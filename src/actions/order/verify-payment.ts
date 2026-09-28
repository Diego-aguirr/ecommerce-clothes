"use server";

import { auth } from "../../../auth";
import { verifyPaymentService } from "@/services/order.service";

export const verifyPayment = async (
  orderId: string,
): Promise<{ ok: true; paymentStatus: string; orderStatus: string; isPaid: boolean } | { ok: false; message: string }> => {
  try {
    // 1. Verificar sesión
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, message: "No hay sesión de usuario" };
    }

    // 2. Delegar al service
    const result = await verifyPaymentService(orderId, session.user.id);

    return result;
  } catch (error) {
    console.error("verifyPayment error:", error);
    return { ok: false, message: "Error verificando el pago" };
  }
};