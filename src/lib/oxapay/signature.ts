import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// OxaPay: header `HMAC` = hex(HMAC-SHA512(rawBody, merchantApiKey)).
// Verify the raw body before JSON.parse; re-serialising changes the bytes.
export function signPayload(rawBody: string, secret: string): string {
  return createHmac("sha512", secret).update(rawBody, "utf8").digest("hex");
}

export function verifySignature(
  rawBody: string,
  header: string | null | undefined,
  secret: string,
): boolean {
  if (!header || !secret) return false;
  const received = header.trim().toLowerCase();
  if (!/^[0-9a-f]{128}$/.test(received)) return false;
  const expected = signPayload(rawBody, secret);
  return timingSafeEqual(Buffer.from(received, "hex"), Buffer.from(expected, "hex"));
}

// OxaPay sends no event id; retries are byte-identical, so the body hash serves as one.
export function eventKey(rawBody: string): string {
  return createHash("sha256").update(rawBody, "utf8").digest("hex");
}
