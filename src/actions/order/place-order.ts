"use server";

import prisma from "@/lib/prisma";
import type { Size } from "@/interfaces";
import { auth } from "../../../auth";
import { orderSchema } from "@/lib/schemas/order.schema";
import { provinces } from "@/seed/seed-province";

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

    // 🗺️ 3.5 Asegurar provincias y validar provinceId
    if (shippingMethod === "delivery" && address.provinceId) {
      let provinceCount = await prisma.province.count();
      
      // Seedear si la tabla está vacía
      if (provinceCount === 0) {
        await prisma.province.createMany({ data: provinces, skipDuplicates: true });
        provinceCount = await prisma.province.count();
      }
      
      // Validar que la provincia exista
      const provinceExists = await prisma.province.findUnique({
        where: { id: address.provinceId },
      });
      
      if (!provinceExists) {
        return {
          ok: false,
          message: "La provincia seleccionada no es válida. Por favor, actualizá tu dirección de envío.",
        };
      }
    }

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

    // 🔒 4. Obtener variantes para validar stock
    const variantIds = productsToOrder
      .map((p) => p.variantId)
      .filter(Boolean) as string[];
    
    const variants = await prisma.productVariant.findMany({
      where: {
        id: {
          in: variantIds,
        },
      },
    });

    // ✅ NUEVO: Validar que todas las variantes existan
    if (variants.length !== variantIds.length) {
      return { ok: false, message: "Algunas variantes de producto no fueron encontradas" };
    }

    // 🔴 5. VALIDAR STOCK POR VARIANTE
    for (const item of productsToOrder) {
      const variant = variants.find((v) => v.id === item.variantId);
      
      if (!variant) {
        return {
          ok: false,
          message: `Variante no encontrada para uno de los productos`,
        };
      }

      if (variant.stock < item.quantity) {
        const product = products.find((p) => p.id === item.productId)!;
        return {
          ok: false,
          message: `Stock insuficiente para ${product.title} - ${variant.color} - Talle ${variant.size}`,
        };
      }
    }

    // 💰 6. Calcular totales
    const itemsInOrder = productsToOrder.reduce(
      (count, p) => count + p.quantity,
      0,
    );

    const totalBruto = productsToOrder.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      if (typeof product.price !== 'number' || isNaN(product.price) || isNaN(item.quantity)) {
        throw new Error('Manipulación detectada: Precio o cantidad de producto inválida');
      }
      return total + product.price * item.quantity;
    }, 0);

    const IVA_RATE = 0.21;
    const tax = totalBruto - totalBruto / (1 + IVA_RATE);
    const subTotal = totalBruto - tax;
    const shipping = 0;
    const total = totalBruto;

    // 🧱 7. TRANSACCIÓN
    const result = await prisma.$transaction(async (tx) => {
      // 🧾 7a. Crear orden
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
                const variant = variants.find((v) => v.id === item.variantId)!;
                
                return {
                  productId: item.productId,
                  quantity: item.quantity,
                  size: item.size as Size,
                  price: product.price,
                  productName: product.title,
                  productDescription: product.description,
                  // ✅ NUEVO: Guardar datos de la variante
                  variantId: item.variantId,
                  color: item.color || variant.color,
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

      // 🟡 7b. Crear registro de Payment
      const payment = await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: total,
          currency: "ARS",
          status: "CREATED",
          provider: "mercadopago",
        },
      });

      // ✅ NUEVO: 7c. Actualizar stock de variantes
      for (const item of productsToOrder) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // ✅ NUEVO: 7d. Crear movimientos de stock por variante
      await tx.stockMovement.createMany({
        data: productsToOrder.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          type: "sale",
          quantity: -item.quantity,
          note: `Venta orden #${newOrder.orderNumber}`,
        })),
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
    console.error("Error crítico procesando la orden:", error);

    if (error.code === "P2002") {
      return {
        ok: false,
        message: "Ya existe un intento de orden en proceso. Verifica tu sesión.",
      };
    }

    return {
      ok: false,
      message: "Ocurrió un inconveniente procesando los datos. Por favor, intenta nuevamente más tarde.",
    };
  }
};
