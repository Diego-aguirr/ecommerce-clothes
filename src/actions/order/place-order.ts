"use server";

import prisma from "@/lib/prisma";
import type { Size } from "@/interfaces";
import { auth } from "../../../auth";
import { orderSchema } from "@/lib/schemas/order.schema";

import { z } from "zod";

type ProductsToOrderInput = z.infer<typeof orderSchema>["productsToOrder"];
type AddressInput = z.infer<typeof orderSchema>["address"];

export const placeOrder = async (
  productsToOrderInput: ProductsToOrderInput,
  addressInput: AddressInput,
  shippingMethodInput: "delivery" | "pickup" = "delivery",
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
      shippingMethod: shippingMethodInput,
      idempotencyToken: idempotencyTokenInput,
    });

    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0].message,
      };
    }

    const { productsToOrder, address, shippingMethod, idempotencyToken } = parsed.data;

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

    // 💡 Precios con IVA incluido (modelo B2C Argentina)
    // El precio del producto ya lleva el IVA adentro.
    // El total cobrado es el precio de lista. El IVA se extrae "hacia atrás" para contabilidad.
    const totalBruto = productsToOrder.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      // 🛡️ Seguridad: Si el precio de BD o la cantidad en el DTO vienen corruptos, cortamos
      if (typeof product.price !== 'number' || isNaN(product.price) || isNaN(item.quantity)) {
        throw new Error('Manipulación detectada: Precio o cantidad de producto inválida');
      }
      return total + product.price * item.quantity;
    }, 0);

    const IVA_RATE = 0.21;
    // Extraer IVA desde adentro: IVA = totalBruto - (totalBruto / 1.21)
    const tax = totalBruto - totalBruto / (1 + IVA_RATE);
    const subTotal = totalBruto - tax; // Neto sin IVA (para contabilidad)
    const shipping = 0;
    const total = totalBruto; // Lo que paga el cliente = precio de lista

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
              street: address.street ?? null,
              apartment: address.apartment ?? null,
              zip: address.zip ?? null,
              city: address.city ?? null,
              phone: address.phone,
              dni: address.dni,
              description: address.description ?? null,
              provinceId: address.provinceId ?? null,
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
