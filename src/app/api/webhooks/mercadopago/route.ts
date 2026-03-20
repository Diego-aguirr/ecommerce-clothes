// src/app/api/webhooks/mercadopago/route.ts
"use server";

import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Payment } from "mercadopago";
import { mpClient } from "@/lib/mercadopago";
import { PaymentStatus } from "@/generated/prisma/enums";
import { webhookSchema } from "@/lib/zod";
import type { WebhookPayload } from "@/interfaces";

// ---------------------------------------------------------------------------



// ---------------------------------------------------------------------------
// 3️⃣ Helper: verify MP signature (HMAC SHA256) using secret from env
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
  // Ensure buffers have same length before timingSafeEqual
  const sigBuf = Buffer.from(signature, "hex");
  const expBuf = Buffer.from(expected, "hex");
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

// ---------------------------------------------------------------------------
// 4️⃣ Helper: confirm payment and decrement stock atomically
// ---------------------------------------------------------------------------
async function confirmPaymentAndUpdateStock(orderId: string) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { OrderItem: true },
    });
    if (!order) throw new Error("Order not found");
    if (order.isPaid) return order; // idempotent

    // Validate stock before decrement
    for (const item of order.OrderItem) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (product.inStock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.title}`);
      }
    }

    // Decrement stock
    for (const item of order.OrderItem) {
      await tx.product.update({
        where: { id: item.productId },
        data: { inStock: { decrement: item.quantity } },
      });
    }

    // Mark order as paid
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { isPaid: true, paidAt: new Date(), status: "paid" },
    });
    return updatedOrder;
  });
}

// ---------------------------------------------------------------------------
// 5️⃣ Main webhook handler – only POST is used by Mercado Pago
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  console.log("🔔 [Webhook MercadoPago] Payload recibido:", rawBody);

  // ---- Signature validation ----
  if (!verifySignature(req, rawBody)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // ---- Payload validation ----
  let payload: WebhookPayload;
  try {
    payload = webhookSchema.parse(JSON.parse(rawBody));
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // ---- Process only payment events ----
  if (payload.type !== "payment") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // ---------------------------------------------------------------------
  // 6️⃣ Transaction: find Payment, verify amount/currency, update status, log
  // ---------------------------------------------------------------------
  const result = await prisma.$transaction(async (tx) => {
    // Fetch payment details from Mercado Pago first to get our standard ID
    const paymentClient = new Payment(mpClient);
    const mpResponse = await paymentClient.get({ id: payload.data.id });
    const { transaction_amount, currency_id, status: mpStatus, external_reference } = mpResponse;

    if (!external_reference) {
       return { ok: false, message: "Missing external_reference in Mercado Pago payment" };
    }

    // 🔗 Find payment record using external_reference (our DB Payment ID)
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

    // Idempotency – ignore if already finalised
    if (payment.status === PaymentStatus.confirmed || payment.status === PaymentStatus.failed) {
      return { ok: true, message: "Idempotent – already processed" };
    }

    // ---- Amount integrity & currency lock ----
    if (
      transaction_amount !== payment.amount ||
      currency_id !== payment.currency
    ) {
      await tx.paymentLog.create({
        data: {
          paymentId: payment.id,
          provider: "mercadopago",
          event: "amount_mismatch",
          rawData: { mpPayment: mpResponse, stored: payment } as any,
        },
      });
      throw new Error("Amount or currency mismatch");
    }

    // Map MP status to our domain status
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

    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: { status: newStatus, providerPaymentId: payload.data.id },
    });

    if (newStatus === PaymentStatus.confirmed) {
      await confirmPaymentAndUpdateStock(payment.orderId);
    }

    await tx.paymentLog.create({
      data: {
        paymentId: payment.id,
        provider: "mercadopago",
        event: payload.action,
        rawData: payload as any,
      },
    });

    return { ok: true, payment: updatedPayment };
  });

  return NextResponse.json(result, { status: 200 });
}
