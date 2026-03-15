"use server";

import prisma from "@/lib/prisma";
import type { Size } from "@/interfaces";
import { auth } from "../../../auth";

import { orderSchema } from "@/lib/schemas/order.schema";



export const placeOrder = async (
  productsToOrderInput: any,
  addressInput: any,
) => {
  try {
    // 🔒 1. Verificar sesión
    const session = await auth();

    if (!session?.user?.id) {
      return { ok: false, message: "No hay sesión de usuario" };
    }

    const userId = session.user.id;

    // 🔒 2. Validar entrada con Zod
    const parsed = orderSchema.safeParse({
      productsToOrder: productsToOrderInput,
      address: addressInput,
    });

    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0].message,
      };
    }

    const { productsToOrder, address } = parsed.data;

    // 🔒 3. Obtener precios reales de la BD
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productsToOrder.map((p) => p.productId),
        },
      },
    });

    // Verificar que todos los productos únicos existen
    const uniqueProductIds = [
      ...new Set(productsToOrder.map((p) => p.productId)),
    ];

    if (products.length !== uniqueProductIds.length) {
      return { ok: false, message: "Algunos productos no fueron encontrados" };
    }

    // 🔒 4. Verificar disponibilidad de stock
    for (const item of productsToOrder) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      if (product.inStock < item.quantity) {
        return {
          ok: false,
          message: `Stock insuficiente para: ${product.title}`,
        };
      }
    }

    // 4. Calcular totales con precios reales del servidor
    const itemsInOrder = productsToOrder.reduce(
      (count, p) => count + p.quantity,
      0,
    );

    const subTotal = productsToOrder.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Producto ${item.productId} no encontrado`);

      return total + product.price * item.quantity;
    }, 0);

    const tax = subTotal * 0.21; // 21% IVA
    const shipping = subTotal > 50000 ? 0 : 2500;
    const total = subTotal + tax + shipping;

    // 4. Crear la orden dentro de una transacción de Prisma
    const order = await prisma.$transaction(async (tx) => {
      // 4a. Crear la orden
      const newOrder = await tx.order.create({
        data: {
          userId,
          itemsInOrder,
          subTotal,
          tax,
          shipping,
          total,
          status: "pending",

          // 4b. Crear los items de la orden con precios snapshot
          OrderItem: {
            createMany: {
              data: productsToOrder.map((item) => {
                const product = products.find((p) => p.id === item.productId)!;
                return {
                  productId: item.productId,
                  quantity: item.quantity,
                  size: item.size as Size,
                  price: product.price, // Precio real de la BD
                };
              }),
            },
          },

          // 4c. Crear la dirección snapshot de la orden
          OrderAddress: {
            create: {
              fullname: address.fullname,
              street: address.street,
              apartment: address.apartment,
              zip: address.zip,
              city: address.city,
              phone: address.phone,
              dni: address.dni,
              description: address.description,
              provinceId: address.provinceId,
            },
          },
        },
      });

      // 4d. Actualizar stock de los productos
      for (const item of productsToOrder) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            inStock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return {
      ok: true,
      order: {
        id: order.id,
        total: order.total,
        status: order.status,
      },
    };
  } catch (error) {
    console.error("❌ Error al colocar orden:", error);
    return {
      ok: false,
      message: "Error procesando la orden",
    };
  }
};
