import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Payment } from "mercadopago";
import { getMpClient } from "@/lib/mercadopago";
import { PaymentStatus } from "@/generated/prisma/enums";
import { webhookSchema } from "@/lib/zod";
import type { WebhookPayload } from "@/interfaces";
import { confirmPaymentAndUpdateStock } from "@/services/order.service";
import { verifyMpSignature } from "@/lib/mercadopago-signature";
import {
  amountsMatch,
  currenciesMatch,
  decideWebhookOutcome,
  WebhookDecisionKind,
} from "@/lib/mercadopago-webhook-decision";

// ---------------------------------------------------------------------------
// MAIN WEBHOOK
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Verificación de firma (manifest HMAC, no el body — ver lib/mercadopago-signature.ts)
  const isValidSignature = verifyMpSignature({
    header: req.headers.get("x-signature"),
    dataId: req.nextUrl.searchParams.get("data.id"),
    requestId: req.headers.get("x-request-id"),
    secret: process.env.MERCADOPAGO_WEBHOOK_SECRET ?? "",
  });

  if (!isValidSignature) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  // Validar payload
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
  // TRANSACCIÓN PRINCIPAL (ÚNICA)
  // -----------------------------------------------------------------------
  const result = await prisma.$transaction(async (tx) => {
    const client = getMpClient();
    if (!client) {
      return { ok: false, message: "MercadoPago not configured" };
    }

    const paymentClient = new Payment(client);

    let mpResponse;

    // fallback seguro (MP puede fallar)
    try {
      mpResponse = await paymentClient.get({ id: payload.data.id });
    } catch {
      // El log se escribe FUERA de la transacción (ver abajo): adentro el
      // rollback lo borraría. Devuelvo un resultado discriminado y respondo
      // non-2xx para que MP reintente (backoff acotado 15min → 96h, no
      // infinito) en vez de perder el evento con un 200 silencioso.
      return { kind: WebhookDecisionKind.MP_FETCH_ERROR, webhook: payload };
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

    // buscar payment interno
    const payment = await tx.payment.findUnique({
      where: { id: external_reference },
      include: { order: true },
    });

    if (!payment) {
      await tx.paymentLog.create({
        data: {
          provider: "mercadopago",
          event: payload.action,
          rawData: payload,
        },
      });

      return { ok: false, message: "Payment not found" };
    }

    // hardening
    if (payment.provider !== "mercadopago") {
      throw new Error("Invalid provider");
    }

    // antifraude: approved pero sin liquidar → non-2xx + log duradero fuera
    // de la transacción para que MP reintente hasta acreditar.
    if (mpStatus === "approved" && status_detail !== "accredited") {
      return {
        kind: WebhookDecisionKind.NOT_ACCREDITED,
        webhook: payload,
        paymentId: payment.id,
        mpStatus,
        mpStatusDetail: status_detail,
      };
    }

    // validación monto (tolerante a ruido Float: ver lib/mercadopago-webhook-decision.ts)
    if (
      !amountsMatch(transaction_amount, payment.amount) ||
      !currenciesMatch(currency_id, payment.currency)
    ) {
      // No tirar adentro de la transacción: el rollback borraría el log y el
      // throw quedaría sin registrar. Se devuelve un resultado discriminado y
      // el log se escribe FUERA de la transacción (ver abajo).
      return {
        kind: "amount_mismatch" as const,
        paymentId: payment.id,
        mp: JSON.parse(JSON.stringify(mpResponse)),
        db: payment,
      };
    }

    // map status (FIJO OBLIGATORIO: Usar nombres estrictos del enum de Prisma)
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

    // idempotencia REAL (race safe)
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
      // Duplicado: respondo 200, pero el log `duplicate` con
      // providerPaymentId se escribe fuera de la transacción para que un
      // doble cobro quede visible en la DB (antes: cero trazas).
      return {
        kind: WebhookDecisionKind.DUPLICATE,
        webhook: payload,
        paymentId: payment.id,
      };
    }

    // confirmar orden
    if (newStatus === PaymentStatus.APPROVED) {
      await confirmPaymentAndUpdateStock(tx, payment.orderId);
    }

    // log completo
    await tx.paymentLog.create({
      data: {
        paymentId: payment.id,
        provider: "mercadopago",
        event: payload.action,
        rawData: { webhook: payload, mp: JSON.parse(JSON.stringify(mpResponse)) },
      },
    });

    return { ok: true };
  });

  // Monto/currency distinto: log duradero FUERA de la transacción + non-2xx
  // para que MercadoPago reintente (el pago no se procesó).
  if ("kind" in result && result.kind === "amount_mismatch") {
    await prisma.paymentLog.create({
      data: {
        paymentId: result.paymentId,
        provider: "mercadopago",
        event: "amount_mismatch",
        rawData: { mp: result.mp, db: result.db },
      },
    });

    return NextResponse.json({ ok: false, error: "Amount mismatch" }, { status: 500 });
  }

  // Fetch fallido / no acreditado / duplicado: log duradero FUERA de la
  // transacción (adentro el rollback lo borraría) y respuesta decidida en
  // lib/mercadopago-webhook-decision.ts (cubierta por tests puros).
  // El chequeo por valor (y no solo `"kind" in result`) es necesario porque
  // los retornos `{ ok, message }` quedan con `kind?: undefined` en la unión.
  if ("kind" in result && result.kind !== undefined) {
    const decision = decideWebhookOutcome(result);
    await prisma.paymentLog.create({ data: decision.logPayload });

    return NextResponse.json(decision.response, { status: decision.httpStatus });
  }

  return NextResponse.json(result, { status: 200 });
}
