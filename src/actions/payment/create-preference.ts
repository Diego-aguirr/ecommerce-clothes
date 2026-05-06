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
    // Los precios de productos YA incluyen IVA (modelo B2C Argentina).
    // La suma de los ítems = order.total exacto. No se agregan ítems extra de TAX.
    let totalAcumulado = 0;
    const items = order.OrderItem.map((item) => {
      const price = Number(item.price);
      totalAcumulado += price * item.quantity;
      return {
        id: item.productId,
        title: item.product.title,
        quantity: item.quantity,
        unit_price: price, // precio con IVA incluido
        currency_id: "ARS",
      };
    });

    // 🛡️ Seguridad: Proteger la creación de MP validando que el total de la preferencia a cobrar es 100% igual a la Base de Datos.
    // Esto previene cobros falsos si en el futuro alguien expusiera este archivo de cara al frontend client-side.
    if (Number(order.total) !== totalAcumulado) {
      console.error(`🚨 Fraude Detectado: Intento de manipular Checkout. DB: ${order.total} | Checkout MP intentaba: ${totalAcumulado}`);
      return { ok: false, message: "Hubo un error calculando los montos de tu carrito (Desbalance de datos)." };
    }

    // URL dinámica (ngrok o localhost según .env)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    console.log("🔗 Creando preferencia MP con baseUrl:", baseUrl, "orderId:", orderId);

    if (!baseUrl) {
      throw new Error("BASE URL not defined");
    }

    // 🛡️ Seguridad: Evitar lanzar MP si estamos en Producción pero no cambiamos el NEXT_PUBLIC_APP_URL de Ngrok a Vercel
    if (process.env.NODE_ENV === "production" && baseUrl.includes("ngrok")) {
        throw new Error("⛔ Estás intentando lanzar una compra local de MP Webhooks en Producción usando Ngrok. Cambiar APP_URL al dominio público.");
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

      auto_return: "approved",
    };

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
