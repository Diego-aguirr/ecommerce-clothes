import { createHmac, timingSafeEqual } from "crypto";

/**
 * MercadoPago webhook signature verification.
 *
 * MercadoPago does NOT sign the request body. It signs a manifest string
 * built from the `data.id` URL query parameter, the `x-request-id` header,
 * and the `ts` field inside the `x-signature` header:
 *
 *   id:{dataId};request-id:{requestId};ts:{ts};
 *
 * Each segment is `key:value;` (the trailing semicolon is part of the
 * contract) and segments without a value are omitted entirely.
 * `v1` in the `x-signature` header is HMAC-SHA256(manifest, secret)
 * rendered as lowercase hex.
 */

export interface MpSignatureManifestInput {
  dataId?: string | null;
  requestId?: string | null;
  ts?: string | null;
}

export interface MpSignatureVerifyInput extends MpSignatureManifestInput {
  header?: string | null;
  secret?: string | null;
}

interface ParsedSignatureHeader {
  ts: string | null;
  v1: string | null;
}

const ALPHANUMERIC = /^[0-9a-zA-Z]+$/;

function normalizeDataId(dataId: string | null | undefined): string | null {
  if (dataId === null || dataId === undefined || dataId === "") return null;
  return ALPHANUMERIC.test(dataId) ? dataId.toLowerCase() : dataId;
}

function hasValue(value: string | null | undefined): value is string {
  return value !== null && value !== undefined && value !== "";
}

/**
 * Builds the signed manifest: concatenation of `key:value;` segments that
 * have a value, in the order id → request-id → ts. Returns "" when no
 * segment has a value.
 */
export function buildSignatureManifest(input: MpSignatureManifestInput): string {
  let manifest = "";

  const dataId = normalizeDataId(input.dataId);
  if (dataId !== null) {
    manifest += `id:${dataId};`;
  }
  if (hasValue(input.requestId)) {
    manifest += `request-id:${input.requestId};`;
  }
  if (hasValue(input.ts)) {
    manifest += `ts:${input.ts};`;
  }

  return manifest;
}

/**
 * Parses `ts=<decimal>,v1=<64-char lowercase hex>`, splitting on `,` and on
 * the first `=` of each part, tolerating whitespace around parts.
 */
function parseSignatureHeader(header: string | null | undefined): ParsedSignatureHeader {
  if (!hasValue(header)) return { ts: null, v1: null };

  let ts: string | null = null;
  let v1: string | null = null;

  for (const part of header.split(",")) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();

    if (key === "ts") ts = value;
    else if (key === "v1") v1 = value;
  }

  return { ts, v1 };
}

/**
 * Verifies the MercadoPago `x-signature` header against the manifest.
 *
 * Fails closed: missing/empty secret, missing `ts`/`v1`, malformed or
 * wrong-length `v1`, and any mismatch all return `false` — never throws.
 * Comparison is timing-safe over the UTF-8 bytes of the two hex strings
 * (the header itself is never hex-decoded).
 */
export function verifyMpSignature(input: MpSignatureVerifyInput): boolean {
  const { header, dataId, requestId, secret } = input;
  if (!hasValue(secret)) return false;

  const { ts, v1 } = parseSignatureHeader(header);
  if (!hasValue(ts) || !hasValue(v1)) return false;

  const manifest = buildSignatureManifest({ dataId, requestId, ts });
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  const actualBuffer = Buffer.from(v1, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  if (actualBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(actualBuffer, expectedBuffer);
}
