import { describe, expect, it } from "vitest";
import {
  amountsMatch,
  currenciesMatch,
  decideWebhookOutcome,
} from "./mercadopago-webhook-decision";

describe("amountsMatch", () => {
  it("accepts exactly equal amounts", () => {
    expect(amountsMatch(1000, 1000)).toBe(true);
  });

  it("accepts Float noise that vanishes at 2 decimals (1210.0000000000002 vs 1210)", () => {
    expect(amountsMatch(1210.0000000000002, 1210)).toBe(true);
  });

  it("accepts 12.305-style float noise within half a cent", () => {
    expect(amountsMatch(12.305, 12.3)).toBe(true);
    expect(amountsMatch(12.305, 12.31)).toBe(true);
  });

  it("accepts values equal after Number(x.toFixed(2)) normalization on both sides", () => {
    expect(amountsMatch(999.996, 1000.004)).toBe(true);
  });

  it("rejects a real amount mismatch", () => {
    expect(amountsMatch(1000, 900)).toBe(false);
    expect(amountsMatch(1000, 1000.01)).toBe(false);
    expect(amountsMatch(1000, 1000.006)).toBe(false);
  });

  it("treats missing or non-finite amounts as a mismatch instead of throwing", () => {
    expect(amountsMatch(Number.NaN, 1000)).toBe(false);
    expect(amountsMatch(1000, Number.POSITIVE_INFINITY)).toBe(false);
    expect(amountsMatch(undefined, 1000)).toBe(false);
  });
});

describe("currenciesMatch", () => {
  it("accepts identical currencies", () => {
    expect(currenciesMatch("ARS", "ARS")).toBe(true);
  });

  it("rejects different currencies", () => {
    expect(currenciesMatch("USD", "ARS")).toBe(false);
  });

  it("rejects a missing MP currency against a stored value", () => {
    expect(currenciesMatch(undefined, "ARS")).toBe(false);
  });
});

describe("decideWebhookOutcome", () => {
  const webhook = {
    action: "payment.updated",
    data: { id: "123456" },
    type: "payment",
  };

  describe("mp_fetch_error (Payment.get failed against MercadoPago)", () => {
    it("responds 500 so MercadoPago retries instead of silently dropping the event", () => {
      const decision = decideWebhookOutcome({ kind: "mp_fetch_error", webhook });

      expect(decision.httpStatus).toBe(500);
      expect(decision.response.ok).toBe(false);
    });

    it("builds a durable log payload (event mp_fetch_error, no paymentId yet)", () => {
      const decision = decideWebhookOutcome({ kind: "mp_fetch_error", webhook });

      expect(decision.logPayload).toEqual({
        provider: "mercadopago",
        event: "mp_fetch_error",
        rawData: { webhook },
      });
      expect(decision.logPayload.paymentId).toBeUndefined();
    });
  });

  describe("not_accredited (approved but status_detail !== accredited)", () => {
    const input = {
      kind: "not_accredited",
      webhook,
      paymentId: "pay_1",
      mpStatus: "approved",
      mpStatusDetail: "pending_contingency",
    } as const;

    it("responds 500 so MercadoPago retries until the money is liquidated", () => {
      const decision = decideWebhookOutcome(input);

      expect(decision.httpStatus).toBe(500);
      expect(decision.response).toEqual({
        ok: false,
        error: "Not accredited yet",
      });
    });

    it("builds a durable log payload with paymentId and the MP status", () => {
      const decision = decideWebhookOutcome(input);

      expect(decision.logPayload).toEqual({
        provider: "mercadopago",
        event: "not_accredited",
        paymentId: "pay_1",
        rawData: {
          webhook,
          mpStatus: "approved",
          mpStatusDetail: "pending_contingency",
        },
      });
    });
  });

  describe("duplicate (updateMany count === 0, already processed)", () => {
    const input = {
      kind: "duplicate",
      webhook,
      paymentId: "pay_1",
    } as const;

    it("responds 200 without reprocessing", () => {
      const decision = decideWebhookOutcome(input);

      expect(decision.httpStatus).toBe(200);
      expect(decision.response).toEqual({
        ok: true,
        message: "Already processed (race safe)",
      });
    });

    it("logs providerPaymentId so double charges are visible in the DB", () => {
      const decision = decideWebhookOutcome(input);

      expect(decision.logPayload).toEqual({
        provider: "mercadopago",
        event: "duplicate",
        paymentId: "pay_1",
        rawData: { webhook, providerPaymentId: "123456" },
      });
    });
  });
});
