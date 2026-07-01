"use server";

import { auth } from "../../../auth";
import {
  getOrderForPayment,
  buildPreferenceItems,
  validateBaseUrl,
  createMercadoPagoPreference,
} from "@/services/payment.service";

export async function createPreference(orderId: string) {
  try {
    // 1. Validar sesión
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, message: "Debe estar autenticado" };
    }

    // 2. Obtener orden y validar
    const { order, paymentId } = await getOrderForPayment(
      orderId,
      session.user.id
    );

    // 3. Construir items y validar montos
    const items = buildPreferenceItems(order.OrderItem, order.total);

    // 4. Validar URL base
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    validateBaseUrl(baseUrl);

    // 5. Crear preferencia MP
    const result = await createMercadoPagoPreference(
      items,
      paymentId,
      orderId,
      baseUrl
    );

    return { ok: true, ...result };
  } catch (error) {
    console.error("Error creando preferencia:", error);
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo generar el link de pago de Mercado Pago",
    };
  }
}
