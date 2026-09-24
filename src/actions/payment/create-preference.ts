"use server";

import { auth } from "../../../auth";
import {
  getOrderForPayment,
  buildPreferenceItems,
  validateBaseUrl,
  createMercadoPagoPreference,
} from "@/services/payment.service";

type CreatePreferenceResult =
  | { ok: false; message: string }
  | { ok: true; init_point: string | undefined; preferenceId: string | undefined };

/**
 * En producción, cualquier mensaje con indicadores de configuración interna
 * (.env, tokens, URLs de desarrollo) se reemplaza por uno amigable.
 * En desarrollo se pasa el mensaje original para depurar.
 */
function toUserFacingMessage(message: string): string {
  if (process.env.NODE_ENV !== "production") return message;
  if (/MERCADOPAGO_ACCESS_TOKEN|\.env|ngrok|APP_URL|stack|prisma/i.test(message)) {
    console.error(`[payments] Error interno oculto del cliente: ${message}`);
    return "El pago con MercadoPago no está disponible en este momento. Elegí transferencia o efectivo para continuar.";
  }
  return message;
}

export async function createPreference(orderId: string): Promise<CreatePreferenceResult> {
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
      process.env.APP_URL || "http://localhost:3000";
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
    return {
      ok: false,
      message: toUserFacingMessage(
        error instanceof Error
          ? error.message
          : "No se pudo generar el link de pago de Mercado Pago"
      ),
    };
  }
}
