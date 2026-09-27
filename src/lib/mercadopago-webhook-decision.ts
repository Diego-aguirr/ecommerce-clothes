/**
 * MercadoPago webhook decision helpers (pure, dependency-free).
 *
 * Extracted from app/api/webhooks/mercadopago/route.ts so Vitest can cover it
 * (vitest excludes `src/app/**`). Only import is `type`-only (erased at
 * runtime), so the module stays dependency-free for Vitest. No I/O.
 */
import type { WebhookPayload } from "@/interfaces";

/** Half a cent: the maximum tolerated distance between two "same" amounts. */
const HALF_CENT = 0.005;

/** Epsilon above HALF_CENT to absorb IEEE-754 subtraction noise. */
const FLOAT_TOLERANCE = 1e-9;

/**
 * Compares the MercadoPago `transaction_amount` with the stored payment amount
 * using money-tolerance at 2 decimals.
 *
 * Both amounts come from Prisma `Float` columns, so a raw `===` produces false
 * mismatches on noise like `1210.0000000000002` vs `1210`. Comparison passes when:
 * - both sides are equal after `Number(x.toFixed(2))` normalization, OR
 * - the distance between them is within half a cent.
 *
 * A real mismatch (`1000` vs `900`, `1000` vs `1000.01`) is still rejected.
 * A missing or non-finite MP amount is treated as a mismatch (never throws).
 *
 * @param mpAmount - Amount reported by MercadoPago (may be missing).
 * @param dbAmount - Amount stored on the internal Payment row (Prisma `Float`).
 * @returns `true` when both amounts are considered equal.
 */
export function amountsMatch(
  mpAmount: number | undefined,
  dbAmount: number,
): boolean {
  if (typeof mpAmount !== "number" || !Number.isFinite(mpAmount)) return false;
  if (!Number.isFinite(dbAmount)) return false;

  // Doc rule: equality after Number(x.toFixed(2)) normalization on both sides.
  if (Number(mpAmount.toFixed(2)) === Number(dbAmount.toFixed(2))) return true;

  // Float-noise tolerance: within half a cent.
  return Math.abs(mpAmount - dbAmount) <= HALF_CENT + FLOAT_TOLERANCE;
}

/**
 * Compares the MercadoPago `currency_id` with the stored payment currency.
 *
 * A missing MP currency never matches a stored value (same as the previous
 * strict `!==` check in the route).
 *
 * @param mpCurrency - Currency reported by MercadoPago (may be missing).
 * @param dbCurrency - Currency stored on the internal Payment row.
 * @returns `true` when both currencies are equal.
 */
export function currenciesMatch(
  mpCurrency: string | undefined,
  dbCurrency: string,
): boolean {
  return mpCurrency === dbCurrency;
}

// ---------------------------------------------------------------------------
// Webhook outcome decision (event loss + double-charge visibility)
// ---------------------------------------------------------------------------

/** Discriminants for the recoverable/duplicate webhook outcomes. */
export const WebhookDecisionKind = {
  MP_FETCH_ERROR: "mp_fetch_error",
  NOT_ACCREDITED: "not_accredited",
  DUPLICATE: "duplicate",
} as const;

export type WebhookDecisionKind =
  (typeof WebhookDecisionKind)[keyof typeof WebhookDecisionKind];

/**
 * Marker returned by the route transaction for outcomes that must be decided
 * (and logged) OUTSIDE the transaction. Inside the tx a `paymentLog.create`
 * would be rolled back by a later throw, and answering 200 there would make
 * MercadoPago drop the event forever.
 */
export type WebhookDecisionInput =
  | {
      kind: typeof WebhookDecisionKind.MP_FETCH_ERROR;
      webhook: WebhookPayload;
    }
  | {
      kind: typeof WebhookDecisionKind.NOT_ACCREDITED;
      webhook: WebhookPayload;
      paymentId: string;
      mpStatus: string;
      mpStatusDetail?: string;
    }
  | {
      kind: typeof WebhookDecisionKind.DUPLICATE;
      webhook: WebhookPayload;
      paymentId: string;
    };

type MpFetchErrorRawData = { webhook: WebhookPayload };

type NotAccreditedRawData = {
  webhook: WebhookPayload;
  mpStatus: string;
  mpStatusDetail?: string;
};

type DuplicateRawData = {
  webhook: WebhookPayload;
  providerPaymentId: string;
};

export type WebhookLogRawData =
  | MpFetchErrorRawData
  | NotAccreditedRawData
  | DuplicateRawData;

/** Data for a durable `paymentLog.create` run outside the transaction. */
export type WebhookLogPayload = {
  provider: "mercadopago";
  event: string;
  paymentId?: string;
  rawData: WebhookLogRawData;
};

export type WebhookDecisionResponse =
  | { ok: true; message?: string }
  | { ok: false; error: string };

export type WebhookDecision = {
  /** HTTP status for MercadoPago: non-2xx → bounded retry (15min → 96h). */
  httpStatus: number;
  response: WebhookDecisionResponse;
  logPayload: WebhookLogPayload;
};

/**
 * Decides the HTTP response and the durable log payload for the three
 * webhook outcomes that must not answer a bare 200:
 *
 * - `mp_fetch_error`: MP fetch failed → 500 + `mp_fetch_error` log, so MP
 *   retries instead of dropping the event silently.
 * - `not_accredited`: approved but not liquidated yet → 500 + `not_accredited`
 *   log with paymentId and MP status.
 * - `duplicate`: already processed (`updateMany count === 0`) → 200, but the
 *   `duplicate` log with `providerPaymentId` makes double charges visible.
 *
 * The caller writes `logPayload` with `prisma.paymentLog.create` OUTSIDE the
 * transaction before responding.
 *
 * @param input - Discriminated marker returned by the route transaction.
 * @returns HTTP status, response body, and durable log payload.
 */
export function decideWebhookOutcome(input: WebhookDecisionInput): WebhookDecision {
  switch (input.kind) {
    case WebhookDecisionKind.MP_FETCH_ERROR:
      return {
        httpStatus: 500,
        response: { ok: false, error: "Failed to fetch payment from MercadoPago" },
        logPayload: {
          provider: "mercadopago",
          event: WebhookDecisionKind.MP_FETCH_ERROR,
          rawData: { webhook: input.webhook },
        },
      };
    case WebhookDecisionKind.NOT_ACCREDITED:
      return {
        httpStatus: 500,
        response: { ok: false, error: "Not accredited yet" },
        logPayload: {
          provider: "mercadopago",
          event: WebhookDecisionKind.NOT_ACCREDITED,
          paymentId: input.paymentId,
          rawData: {
            webhook: input.webhook,
            mpStatus: input.mpStatus,
            mpStatusDetail: input.mpStatusDetail,
          },
        },
      };
    case WebhookDecisionKind.DUPLICATE:
      return {
        httpStatus: 200,
        response: { ok: true, message: "Already processed (race safe)" },
        logPayload: {
          provider: "mercadopago",
          event: WebhookDecisionKind.DUPLICATE,
          paymentId: input.paymentId,
          rawData: {
            webhook: input.webhook,
            providerPaymentId: String(input.webhook.data.id),
          },
        },
      };
  }
}
