"use server";

import prisma from "@/lib/prisma";
import type { Size } from "@/interfaces";
import { auth } from "../../../auth";
import { orderSchema } from "@/lib/schemas/order.schema";

export const placeOrder = async (
  productsToOrderInput: any,
  addressInput: any,
  idempotencyTokenInput?: string,
) => {
  try {
    // 🔒 1. Verificar sesión
    const session = await auth();

    if (!session?.user?.id) {
      return { ok: false, message: "No hay sesión de usuario" };
    }

    const userId = session.user.id;

    // 🔒 2. Validar entrada
    const parsed = orderSchema.safeParse({
      productsToOrder: productsToOrderInput,
      address: addressInput,
      idempotencyToken: idempotencyTokenInput,
    });

    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0].message,
      };
    }

    const { productsToOrder, address, idempotencyToken } = parsed.data;

    // 🔒 3. Obtener productos reales
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productsToOrder.map((p) => p.productId),
        },
      },
    });

    const uniqueProductIds = [
      ...new Set(productsToOrder.map((p) => p.productId)),
    ];

    if (products.length !== uniqueProductIds.length) {
      return { ok: false, message: "Algunos productos no fueron encontrados" };
    }

    // 🔴 4. VALIDAR STOCK (SIN MODIFICAR)
    for (const item of productsToOrder) {
      const product = products.find((p) => p.id === item.productId)!;

      if (product.inStock < item.quantity) {
        return {
          ok: false,
          message: `Stock insuficiente para ${product.title}`,
        };
      }
    }

    // 💰 5. Calcular totales
    const itemsInOrder = productsToOrder.reduce(
      (count, p) => count + p.quantity,
      0,
    );

    const subTotal = productsToOrder.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return total + product.price * item.quantity;
    }, 0);

    const tax = subTotal * 0.21;
    const shipping = subTotal > 50000 ? 0 : 2500;
    const total = subTotal + tax + shipping;

    // 🧱 6. TRANSACCIÓN
    const result = await prisma.$transaction(async (tx) => {
      // 🧾 6a. Crear orden
      const newOrder = await tx.order.create({
        data: {
          userId,
          itemsInOrder,
          subTotal,
          tax,
          shipping,
          total,
          status: "pending",
          idempotencyToken,

          OrderItem: {
            createMany: {
              data: productsToOrder.map((item) => {
                const product = products.find((p) => p.id === item.productId)!;
                return {
                  productId: item.productId,
                  quantity: item.quantity,
                  size: item.size as Size,
                  price: product.price,
                  productName: product.title,
                  productDescription: product.description,
                };
              }),
            },
          },

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

      // 🟡 6b. Crear registro de Payment (IMPORTANTE)
      const payment = await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: total,
          currency: "ARS",
          status: "CREATED",
          provider: "mercadopago",
        },
      });

      return { newOrder, payment };
    });

    return {
      ok: true,
      order: {
        id: result.newOrder.id,
        total: result.newOrder.total,
        status: result.newOrder.status,
      },
      payment: {
        id: result.payment.id,
        status: result.payment.status,
      },
    };
  } catch (error: any) {
    // 🕵️ Registrar el error crudo sólo internamente en el backend (logs)
    console.error("Error crítico procesando la orden:", error);

    if (error.code === "P2002") {
      return {
        ok: false,
        message: "Ya existe un intento de orden en proceso. Verifica tu sesión.",
      };
    }

    // 🛡️ Regla de Seguridad: NUNCA regresar error.message al cliente si el error viene de DB
    return {
      ok: false,
      message: "Ocurrió un inconveniente procesando los datos. Por favor, intenta nuevamente más tarde.",
    };
  }
};
