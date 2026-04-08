"use server";

import prisma from "@/lib/prisma";
import { auth } from "../../../auth";
import { Preference } from "mercadopago";
import { mpClient } from "@/lib/mercadopago";

export async function createPreference(orderId: string) {
  try {
    // 🔒 1. Validar sesión
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, message: "Debe estar autenticado" };
    }

    // 🔒 2. Obtener la orden y su pago asociado
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

    if (!order) {
      return { ok: false, message: "Orden no encontrada" };
    }

    if (order.userId !== session.user.id) {
      return { ok: false, message: "No autorizado" };
    }

    if (order.isPaid) {
      return { ok: false, message: "Esta orden ya está pagada" };
    }

    const unconfirmedPayment = order.payments[0];
    if (!unconfirmedPayment) {
      return {
        ok: false,
        message: "No se encontró un pago pendiente para esta orden",
      };
    }

    const preference = new Preference(mpClient);

    // 💳 4. Construir cuerpo de la preferencia
    const items = order.OrderItem.map((item) => ({
      id: item.productId,
      title: item.product.title,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: "ARS",
    }));

    // URL dinámica (ngrok o localhost según .env)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!baseUrl) {
      throw new Error("BASE URL not defined");
    }

    const body = {
      items,
      external_reference: unconfirmedPayment.id,

      back_urls: {
        success: `${baseUrl}/orders/${orderId}?status=success`,
        pending: `${baseUrl}/orders/${orderId}?status=pending`,
        failure: `${baseUrl}/orders/${orderId}?status=failure`,
      },

      notification_url: `${baseUrl}/api/webhooks/mercadopago`,

      //   auto_return: "approved",
    };
    console.log("SUCCESS FINAL:", `${baseUrl}/orders/${orderId}`);

    // 📡  5. Crear preferencia en Mercado Pago
    const result = await preference.create({ body });

    return {
      ok: true,
      init_point: result.init_point, // URL a la que mandamos al usuario
      preferenceId: result.id,
    };
  } catch (error) {
    console.error("Error creando preferencia:", error);
    return {
      ok: false,
      message: "No se pudo generar el link de pago de Mercado Pago",
    };
  }
}
