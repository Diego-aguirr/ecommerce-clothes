import { describe, expect, it } from "vitest";
import { amountsMatch, currenciesMatch } from "./mercadopago-webhook-decision";

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
