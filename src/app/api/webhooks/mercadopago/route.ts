"use server";

import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Payment } from "mercadopago";
import { mpClient } from "@/lib/mercadopago";
import { PaymentStatus } from "@/generated/prisma/enums";
import { webhookSchema } from "@/lib/zod";
import type { WebhookPayload } from "@/interfaces";

// ---------------------------------------------------------------------------
// 🔐 Verify MP signature (HMAC SHA256)
// ---------------------------------------------------------------------------
function verifySignature(request: NextRequest, body: string): boolean {
  const signature = request.headers.get("x-signature") ?? "";
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET ?? "";
  if (!secret) return false;

  const crypto = require("crypto");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  const sigBuf = Buffer.from(signature, "hex");
  const expBuf = Buffer.from(expected, "hex");

  if (sigBuf.length !== expBuf.length) return false;

  return crypto.timingSafeEqual(sigBuf, expBuf);
}

// ---------------------------------------------------------------------------
// 🧱 Confirm payment + decrement stock (ATÓMICO)
// ---------------------------------------------------------------------------
async function confirmPaymentAndUpdateStock(orderId: string) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { OrderItem: true },
    });

    if (!order) throw new Error("Order not found");
    if (order.isPaid) return order; // idempotencia

    // 🔥 decremento atómico seguro
    for (const item of order.OrderItem) {
      const updated = await tx.product.updateMany({
        where: {
          id: item.productId,
          inStock: { gte: item.quantity },
        },
        data: {
          inStock: { decrement: item.quantity },
        },
      });

      if (updated.count === 0) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }
    }

    // marcar orden como pagada
    return await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        status: "paid",
      },
    });
  });
}

// ---------------------------------------------------------------------------
// 🚀 MAIN WEBHOOK
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  console.log("🔔 Webhook MP:", rawBody);

  // 🔐 firma
  if (!verifySignature(req, rawBody)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 🧪 validar payload
  let payload: WebhookPayload;
  try {
    payload = webhookSchema.parse(JSON.parse(rawBody));
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (payload.type !== "payment") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // -----------------------------------------------------------------------
  // 💳 TRANSACCIÓN PRINCIPAL
  // -----------------------------------------------------------------------
  const result = await prisma.$transaction(async (tx) => {
    const paymentClient = new Payment(mpClient);

    let mpResponse;

    // 🔁 fallback seguro (MP puede fallar)
    try {
      mpResponse = await paymentClient.get({ id: payload.data.id });
    } catch (error) {
      await tx.paymentLog.create({
        data: {
          provider: "mercadopago",
          event: "mp_fetch_error",
          rawData: payload as any,
        },
      });

      return { ok: true }; // evitar retries infinitos
    }

    const {
      transaction_amount,
      currency_id,
      status: mpStatus,
      status_detail,
      external_reference,
    } = mpResponse;

    if (!external_reference) {
      return { ok: false, message: "Missing external_reference" };
    }

    // 🔗 buscar payment interno
    const payment = await tx.payment.findUnique({
      where: { id: external_reference },
      include: { order: true },
    });

    if (!payment) {
      await tx.paymentLog.create({
        data: {
          provider: "mercadopago",
          event: payload.action,
          rawData: payload as any,
        },
      });

      return { ok: false, message: "Payment not found" };
    }

    // 🔒 hardening
    if (payment.provider !== "mercadopago") {
      throw new Error("Invalid provider");
    }

    // 🛑 antifraude
    if (mpStatus === "approved" && status_detail !== "accredited") {
      return { ok: true, message: "Not accredited yet" };
    }

    // 🔐 validación monto
    if (
      transaction_amount !== payment.amount ||
      currency_id !== payment.currency
    ) {
      await tx.paymentLog.create({
        data: {
          paymentId: payment.id,
          provider: "mercadopago",
          event: "amount_mismatch",
          rawData: { mp: mpResponse, db: payment } as any,
        },
      });

      throw new Error("Amount mismatch");
    }

    // 🎯 map status
    let newStatus: PaymentStatus;

    switch (mpStatus) {
      case "approved":
        newStatus = PaymentStatus.confirmed;
        break;
      case "pending":
        newStatus = PaymentStatus.pending;
        break;
      case "rejected":
      case "cancelled":
        newStatus = PaymentStatus.failed;
        break;
      default:
        newStatus = PaymentStatus.pending;
    }

    // 🔥 idempotencia REAL (race safe)
    const updated = await tx.payment.updateMany({
      where: {
        id: payment.id,
        status: PaymentStatus.created,
      },
      data: {
        status: newStatus,
        providerPaymentId: payload.data.id,
      },
    });

    if (updated.count === 0) {
      return { ok: true, message: "Already processed (race safe)" };
    }

    // 📦 confirmar orden
    if (newStatus === PaymentStatus.confirmed) {
      await confirmPaymentAndUpdateStock(payment.orderId);
    }

    // 🧾 log completo
    await tx.paymentLog.create({
      data: {
        paymentId: payment.id,
        provider: "mercadopago",
        event: payload.action,
        rawData: {
          webhook: payload,
          mp: mpResponse,
        } as any,
      },
    });

    return { ok: true };
  });

  return NextResponse.json(result, { status: 200 });
}
