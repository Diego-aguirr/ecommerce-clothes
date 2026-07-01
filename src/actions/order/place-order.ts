"use server";

import { auth } from "../../../auth";
import { orderSchema } from "@/lib/schemas/order.schema";
import { createOrder } from "@/services/order.service";

import { z } from "zod";

type ProductsToOrderInput = z.infer<typeof orderSchema>["productsToOrder"];
type AddressInput = z.infer<typeof orderSchema>["address"];

type PlaceOrderResult =
  | { ok: false; message: string }
  | {
      ok: true;
      order: { id: string; total: number; status: string };
      payment: { id: string; status: string };
    };

export const placeOrder = async (
  productsToOrderInput: ProductsToOrderInput,
  addressInput: AddressInput,
  shippingMethodInput: "delivery" | "pickup" = "delivery",
  idempotencyTokenInput?: string
): Promise<PlaceOrderResult> => {
  try {
    // 1. Verificar sesión
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, message: "No hay sesión de usuario" };
    }

    // 2. Validar entrada
    const parsed = orderSchema.safeParse({
      productsToOrder: productsToOrderInput,
      address: addressInput,
      shippingMethod: shippingMethodInput,
      idempotencyToken: idempotencyTokenInput,
    });

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0].message };
    }

    // 3. Delegar al service
    const result = await createOrder({
      userId: session.user.id,
      productsToOrder: parsed.data.productsToOrder,
      address: parsed.data.address,
      shippingMethod: parsed.data.shippingMethod,
      idempotencyToken: parsed.data.idempotencyToken,
    });

    return { ok: true, ...result };
  } catch (error: unknown) {
    console.error("Error crítico procesando la orden:", error);

    const err = error as { code?: string };
    if (err.code === "P2002") {
      return {
        ok: false,
        message:
          "Ya existe un intento de orden en proceso. Verifica tu sesión.",
      };
    }

    return {
      ok: false,
      message:
        "Ocurrió un inconveniente procesando los datos. Por favor, intenta nuevamente más tarde.",
    };
  }
};
