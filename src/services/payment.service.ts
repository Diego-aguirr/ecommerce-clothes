/**
 * Payment Service
 *
 * Responsabilidad: Crear preferencias de pago en MercadoPago.
 * Usado por: payment/create-preference action.
 *
 * Reglas:
 * - Validar que la orden pertenezca al usuario
 * - Validar que la orden no esté ya pagada
 * - Verificar consistencia de montos (anti-fraude)
 * - Validar URL según entorno (ngrok en dev, dominio público en prod)
 * - Usar "server-only" para evitar imports en client components
 */

import prisma from "@/lib/prisma";
import "server-only";
import { Preference } from "mercadopago";
import { getMpClient } from "@/lib/mercadopago";

/**
 * Obtiene una orden con sus items, producto y pago pendiente.
 * Lanza si no existe o no tiene pago pendiente.
 */
export async function getOrderForPayment(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      OrderItem: {
        include: { product: true },
      },
      payments: {
        where: { provider: "mercadopago", status: "CREATED" },
        take: 1,
      },
    },
  });

  if (!order) throw new Error("Orden no encontrada");
  if (order.userId !== userId) throw new Error("No autorizado");
  if (order.isPaid) throw new Error("Esta orden ya está pagada");

  const unconfirmedPayment = order.payments[0];
  if (!unconfirmedPayment) {
    throw new Error("No se encontró un pago pendiente para esta orden");
  }

  return { order, paymentId: unconfirmedPayment.id };
}

/**
 * Construye los items de la preferencia MP desde los OrderItems.
 * Valida que el total sea consistente con la DB (anti-fraude).
 */
export function buildPreferenceItems(
  orderItems: { productId: string; price: number; quantity: number; product: { title: string } }[],
  orderTotal: number
) {
  let totalAcumulado = 0;

  const items = orderItems.map((item) => {
    const price = Number(item.price);
    totalAcumulado += price * item.quantity;
    return {
      id: item.productId,
      title: item.product.title,
      quantity: item.quantity,
      unit_price: price,
      currency_id: "ARS" as const,
    };
  });

  if (Number(orderTotal) !== totalAcumulado) {
    throw new Error(
      "Hubo un error calculando los montos de tu carrito (Desbalance de datos)."
    );
  }

  return items;
}

/** Valida que la URL base sea correcta según el entorno. */
export function validateBaseUrl(baseUrl: string) {
  if (process.env.NODE_ENV === "production" && baseUrl.includes("ngrok")) {
    throw new Error(
      "⛔ Estás intentando lanzar una compra local de MP Webhooks en Producción usando Ngrok. Cambiar APP_URL al dominio público."
    );
  }
}

/** Crea la preferencia de MercadoPago y retorna la URL de pago. */
export async function createMercadoPagoPreference(
  items: { id: string; title: string; quantity: number; unit_price: number; currency_id: "ARS" }[],
  paymentId: string,
  orderId: string,
  baseUrl: string
) {
  const client = getMpClient();
  if (!client) {
    throw new Error(
      "MercadoPago no está configurado. Configurá MERCADOPAGO_ACCESS_TOKEN en .env.docker o usá el método de pago en efectivo/transferencia."
    );
  }

  const preference = new Preference(client);

  const result = await preference.create({
    body: {
      items,
      external_reference: paymentId,
      back_urls: {
        success: `${baseUrl}/orders/${orderId}?status=success`,
        pending: `${baseUrl}/orders/${orderId}?status=pending`,
        failure: `${baseUrl}/orders/${orderId}?status=failure`,
      },
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      auto_return: "approved",
    },
  });

  return {
    init_point: result.init_point,
    preferenceId: result.id,
  };
}
