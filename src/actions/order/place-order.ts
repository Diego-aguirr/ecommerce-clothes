"use server";

import prisma from "@/lib/prisma";
import type { Size } from "@/interfaces";
import { auth } from "../../../auth";

// Tipo que recibimos del frontend (solo IDs, cantidades y tallas)
type ProductToOrder = {
  productId: string;
  quantity: number;
  size: Size;
};

// Tipo de la dirección que recibimos del frontend
type OrderAddressInput = {
  fullname: string;
  street: string;
  apartment?: string;
  zip: string;
  city: string;
  phone: string;
  dni: string;
  description?: string;
  provinceId: string;
};

export const placeOrder = async (
  productsToOrder: ProductToOrder[],
  address: OrderAddressInput,
) => {
  try {
    // 🔒 1. Verificar sesión
    const session = await auth();

    if (!session?.user?.id) {
      return { ok: false, message: "No hay sesión de usuario" };
    }

    const userId = session.user.id;
    // 🔒 2. Obtener precios reales de la BD (nunca confiar en el frontend)

    // 🔍 DEBUG: Ver qué IDs llegan del frontend
    console.log("📦 Productos recibidos del frontend:", productsToOrder);
    console.log("📍 Dirección recibida:", address);

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productsToOrder.map((p) => p.productId),
        },
      },
    });

    // 🔍 DEBUG: Ver qué encontró Prisma
    console.log("🔎 Productos encontrados en BD:", products.map(p => ({ id: p.id, title: p.title, price: p.price })));

    // Verificar que todos los productos únicos existen
    // (un mismo producto puede estar varias veces con diferentes tallas)
    const uniqueProductIds = [...new Set(productsToOrder.map((p) => p.productId))];
    console.log(`📊 IDs únicos enviados: ${uniqueProductIds.length} | Encontrados: ${products.length}`);

    if (products.length !== uniqueProductIds.length) {
      return { ok: false, message: "Algunos productos no fueron encontrados" };
    }

    // 3. Calcular totales con precios reales del servidor
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
                  size: item.size,
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

    // ✅ Console.log para verificar la orden creada
    console.log("✅ Orden creada exitosamente:", {
      orderId: order.id,
      userId: order.userId,
      itemsInOrder: order.itemsInOrder,
      subTotal: order.subTotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      status: order.status,
      address: address,
      products: productsToOrder,
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
