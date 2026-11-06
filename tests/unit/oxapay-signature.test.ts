import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { eventKey, signPayload, verifySignature } from "@/lib/oxapay/signature";

const SECRET = "test-merchant-key-for-unit-tests";
const body = JSON.stringify({
  track_id: "123456",
  status: "Paid",
  type: "invoice",
  order_id: "dn_abc",
});

describe("OxaPay webhook signature", () => {
  it("matches an independently computed HMAC-SHA512 of the raw body", () => {
    const expected = createHmac("sha512", SECRET).update(body).digest("hex");
    expect(signPayload(body, SECRET)).toBe(expected);
  });

  it("accepts a valid signature (case-insensitive hex)", () => {
    const sig = signPayload(body, SECRET);
    expect(verifySignature(body, sig, SECRET)).toBe(true);
    expect(verifySignature(body, sig.toUpperCase(), SECRET)).toBe(true);
  });

  it("rejects a signature made with another key", () => {
    expect(verifySignature(body, signPayload(body, "another-key"), SECRET)).toBe(false);
  });

  it("rejects a tampered body", () => {
    const sig = signPayload(body, SECRET);
    expect(verifySignature(body.replace("Paid", "paid"), sig, SECRET)).toBe(false);
    expect(verifySignature(`${body} `, sig, SECRET)).toBe(false);
  });

  it("rejects missing, malformed or truncated headers", () => {
    const sig = signPayload(body, SECRET);
    expect(verifySignature(body, null, SECRET)).toBe(false);
    expect(verifySignature(body, "", SECRET)).toBe(false);
    expect(verifySignature(body, "not-hex", SECRET)).toBe(false);
    expect(verifySignature(body, sig.slice(0, 64), SECRET)).toBe(false);
  });

  it("rejects everything when no secret is configured", () => {
    expect(verifySignature(body, signPayload(body, ""), "")).toBe(false);
  });

  it("derives a stable idempotency key per delivery", () => {
    expect(eventKey(body)).toBe(eventKey(body));
    expect(eventKey(body)).not.toBe(eventKey(`${body}\n`));
  });
});
