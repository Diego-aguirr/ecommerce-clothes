import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { Payment } from "mercadopago";
import { getMpClient } from "@/lib/mercadopago";
import { PaymentStatus } from "@/generated/prisma/enums";
import { webhookSchema } from "@/lib/zod";
import type { WebhookPayload } from "@/interfaces";
import { confirmPaymentAndUpdateStock } from "@/services/order.service";

// ---------------------------------------------------------------------------
// 🔐 Verify MP signature (HMAC SHA256)
// ---------------------------------------------------------------------------
function verifySignature(request: NextRequest, body: string): boolean {
  const signature = request.headers.get("x-signature") ?? "";
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET ?? "";
  if (!secret) return false;

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
// 🚀 MAIN WEBHOOK
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  console.log("🔔 Webhook MP:", rawBody);

  // 🔐 Verificación de firma
  const isValidSignature = verifySignature(req, rawBody);

  if (!isValidSignature) {
    if (process.env.NODE_ENV === "production") {
      // Producción: Tolerancia cero. Bloquear y expulsar.
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    } else {
      // Desarrollo: Avisar fuerte en la consola, pero dejar fluir la prueba.
      console.warn("⚠️ [DEV MODE] Firma de Mercado Pago inválida, pero dejando pasar el Webhook para simulación local...");
    }
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
  // 💳 TRANSACCIÓN PRINCIPAL (ÚNICA)
  // -----------------------------------------------------------------------
  const result = await prisma.$transaction(async (tx) => {
    const client = getMpClient();
    if (!client) {
      console.error("❌ MercadoPago no está configurado. Webhook ignorado.");
      return { ok: false, message: "MercadoPago not configured" };
    }

    const paymentClient = new Payment(client);

    let mpResponse;

    // 🔁 fallback seguro (MP puede fallar)
    try {
      mpResponse = await paymentClient.get({ id: payload.data.id });
    } catch {
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
    console.log("💰 CHECKING MONTOS:");
    console.log(`-> MP enviò: ${transaction_amount} ${currency_id}`);
    console.log(`-> DB tiene: ${payment.amount} ${payment.currency}`);
    
    if (
      Number(transaction_amount) !== Number(payment.amount) ||
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

    // 🎯 map status (🔴 FIJO OBLIGATORIO: Usar nombres estrictos del enum de Prisma)
    let newStatus: PaymentStatus;

    switch (mpStatus) {
      case "approved":
        newStatus = PaymentStatus.APPROVED;
        break;
      case "pending":
        newStatus = PaymentStatus.PENDING;
        break;
      case "rejected":
        newStatus = PaymentStatus.REJECTED;
        break;
      case "cancelled":
        newStatus = PaymentStatus.CANCELLED;
        break;
      default:
        newStatus = PaymentStatus.PENDING;
    }

    // 🔥 idempotencia REAL (race safe)
    // Se compara contra PENDING o CREATED (los estados iniciales válidos de PaymentStatus)
    const updated = await tx.payment.updateMany({
      where: {
        id: payment.id,
        status: { in: [PaymentStatus.CREATED, PaymentStatus.PENDING] },
      },
      data: {
        status: newStatus,
        providerPaymentId: String(payload.data.id),
      },
    });

    if (updated.count === 0) {
      return { ok: true, message: "Already processed (race safe)" };
    }

    // 📦 confirmar orden
    if (newStatus === PaymentStatus.APPROVED) {
      // Pasamos tx explícitamente para mantener una sola transacción real
      await confirmPaymentAndUpdateStock(tx, payment.orderId);
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
