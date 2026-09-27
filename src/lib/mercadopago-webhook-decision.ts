/**
 * MercadoPago webhook decision helpers (pure, dependency-free).
 *
 * Extracted from app/api/webhooks/mercadopago/route.ts so Vitest can cover it
 * (vitest excludes `src/app/**`). No imports, no I/O.
 */

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
