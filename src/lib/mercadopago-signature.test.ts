import crypto from "crypto";
import { describe, expect, it } from "vitest";
import { buildSignatureManifest, verifyMpSignature } from "./mercadopago-signature";

const SECRET = "mp-test-secret-signature";

function hmacHex(message: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(message).digest("hex");
}

function rawHeader(ts: string, manifest: string, secret: string): string {
  return `ts=${ts},v1=${hmacHex(manifest, secret)}`;
}

describe("buildSignatureManifest", () => {
  it("numeric data.id builds id:12345;request-id:<req>;ts:<ts>; and verifies an HMAC computed in the test", () => {
    const manifest = buildSignatureManifest({
      dataId: "12345",
      requestId: "req-abc",
      ts: "1700000000",
    });
    expect(manifest).toBe("id:12345;request-id:req-abc;ts:1700000000;");

    // Verify the full round trip against an HMAC computed independently here.
    const v1 = hmacHex(manifest, SECRET);
    expect(
      verifyMpSignature({
        header: `ts=1700000000,v1=${v1}`,
        dataId: "12345",
        requestId: "req-abc",
        secret: SECRET,
      }),
    ).toBe(true);
  });

  it("alphanumeric data.id with uppercase letters is lowercased in the manifest", () => {
    const manifest = buildSignatureManifest({
      dataId: "ORD01JQ4S4KY8HWQ6NA5PXB65B3D3",
      requestId: "req-abc",
      ts: "1700000000",
    });
    expect(manifest).toBe(
      "id:ord01jq4s4ky8hwq6na5pxb65b3d3;request-id:req-abc;ts:1700000000;",
    );

    expect(
      verifyMpSignature({
        header: rawHeader("1700000000", manifest, SECRET),
        dataId: "ORD01JQ4S4KY8HWQ6NA5PXB65B3D3",
        requestId: "req-abc",
        secret: SECRET,
      }),
    ).toBe(true);
  });

  it("data.id containing non-alphanumeric characters preserves its original case", () => {
    const manifest = buildSignatureManifest({
      dataId: "Ab_C-def",
      requestId: "req-abc",
      ts: "1700000000",
    });
    expect(manifest).toBe("id:Ab_C-def;request-id:req-abc;ts:1700000000;");

    expect(
      verifyMpSignature({
        header: rawHeader("1700000000", manifest, SECRET),
        dataId: "Ab_C-def",
        requestId: "req-abc",
        secret: SECRET,
      }),
    ).toBe(true);
  });

  it("missing x-request-id omits the segment entirely", () => {
    const manifest = buildSignatureManifest({
      dataId: "12345",
      requestId: null,
      ts: "1700000000",
    });
    expect(manifest).toBe("id:12345;ts:1700000000;");

    expect(
      verifyMpSignature({
        header: rawHeader("1700000000", manifest, SECRET),
        dataId: "12345",
        requestId: null,
        secret: SECRET,
      }),
    ).toBe(true);
  });

  it("missing data.id query omits the segment entirely", () => {
    const manifest = buildSignatureManifest({
      dataId: null,
      requestId: "req-abc",
      ts: "1700000000",
    });
    expect(manifest).toBe("request-id:req-abc;ts:1700000000;");

    expect(
      verifyMpSignature({
        header: rawHeader("1700000000", manifest, SECRET),
        dataId: null,
        requestId: "req-abc",
        secret: SECRET,
      }),
    ).toBe(true);
  });

  it("manifest with all three segments absent is the empty string and is never an automatic pass", () => {
    const manifest = buildSignatureManifest({
      dataId: null,
      requestId: null,
      ts: null,
    });
    expect(manifest).toBe("");

    // HMAC over "" computed locally, exactly as the verifier computes it.
    const localEmptyHmac = hmacHex("", SECRET);
    expect(hmacHex(manifest, SECRET)).toBe(localEmptyHmac);

    // Fail-closed: an HMAC of the empty manifest must not validate when the
    // header carries a ts (the manifest then contains the ts segment), and a
    // header without ts/v1 is invalid regardless.
    expect(
      verifyMpSignature({
        header: `ts=1700000000,v1=${localEmptyHmac}`,
        dataId: null,
        requestId: null,
        secret: SECRET,
      }),
    ).toBe(false);
    expect(
      verifyMpSignature({
        header: null,
        dataId: null,
        requestId: null,
        secret: SECRET,
      }),
    ).toBe(false);
  });
});

describe("verifyMpSignature", () => {
  it("returns true for a valid header with the correct secret", () => {
    const manifest = "id:12345;request-id:req-abc;ts:1700000000;";
    expect(
      verifyMpSignature({
        header: rawHeader("1700000000", manifest, SECRET),
        dataId: "12345",
        requestId: "req-abc",
        secret: SECRET,
      }),
    ).toBe(true);
  });

  it("returns false for a valid header with the wrong secret", () => {
    const manifest = "id:12345;request-id:req-abc;ts:1700000000;";
    expect(
      verifyMpSignature({
        header: rawHeader("1700000000", manifest, "other-secret"),
        dataId: "12345",
        requestId: "req-abc",
        secret: SECRET,
      }),
    ).toBe(false);
  });

  it("returns false for an empty or missing secret", () => {
    const manifest = "id:12345;request-id:req-abc;ts:1700000000;";
    const header = rawHeader("1700000000", manifest, SECRET);

    expect(
      verifyMpSignature({
        header,
        dataId: "12345",
        requestId: "req-abc",
        secret: "",
      }),
    ).toBe(false);
    expect(
      verifyMpSignature({
        header,
        dataId: "12345",
        requestId: "req-abc",
        secret: null,
      }),
    ).toBe(false);
    expect(
      verifyMpSignature({
        header,
        dataId: "12345",
        requestId: "req-abc",
      }),
    ).toBe(false);
  });

  it("returns false without throwing when the header is missing v1", () => {
    expect(
      verifyMpSignature({
        header: "ts=1700000000",
        dataId: "12345",
        requestId: "req-abc",
        secret: SECRET,
      }),
    ).toBe(false);
  });

  it("returns false without throwing when the header is missing ts", () => {
    const v1 = hmacHex("id:12345;request-id:req-abc;ts:1700000000;", SECRET);
    expect(
      verifyMpSignature({
        header: `v1=${v1}`,
        dataId: "12345",
        requestId: "req-abc",
        secret: SECRET,
      }),
    ).toBe(false);
  });

  it("returns false without throwing when v1 has the wrong length (3 bytes)", () => {
    expect(
      verifyMpSignature({
        header: "ts=1700000000,v1=abc123",
        dataId: "12345",
        requestId: "req-abc",
        secret: SECRET,
      }),
    ).toBe(false);
  });

  it("returns false without throwing for a completely malformed header", () => {
    expect(
      verifyMpSignature({
        header: "not-a-signature",
        dataId: "12345",
        requestId: "req-abc",
        secret: SECRET,
      }),
    ).toBe(false);
  });

  it("tolerates whitespace around header parts", () => {
    const manifest = "id:12345;request-id:req-abc;ts:1700000000;";
    const v1 = hmacHex(manifest, SECRET);
    expect(
      verifyMpSignature({
        header: ` ts=1700000000 , v1=${v1} `,
        dataId: "12345",
        requestId: "req-abc",
        secret: SECRET,
      }),
    ).toBe(true);
  });

  it("historical bug: Buffer.from(raw header, 'hex') is 0 bytes, but verification still succeeds", () => {
    const manifest = "id:12345;request-id:req-abc;ts:1700000000;";
    const header = rawHeader("1700000000", manifest, SECRET);

    // The old implementation hex-decoded the whole header, which yields no bytes.
    expect(Buffer.from(header, "hex").length).toBe(0);

    // The new parser must not depend on hex-decoding the header as a whole.
    expect(
      verifyMpSignature({
        header,
        dataId: "12345",
        requestId: "req-abc",
        secret: SECRET,
      }),
    ).toBe(true);
  });
});
