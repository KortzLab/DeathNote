import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { clientIp } from "@/lib/server/rate-limit";

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/**
 * Stable, non-reversible id for "the same person" (one report / one candle each) without
 * storing IP addresses. Salted with AUTH_SECRET so the hashes can't be brute-forced offline.
 */
export function visitorHash(req: Request): string {
  return sha256(`${clientIp(req)}|${process.env.AUTH_SECRET ?? ""}`);
}

/** Anonymous ownership: the browser keeps the token, we keep only its hash. */
export function newOwnerToken() {
  const token = randomBytes(24).toString("base64url");
  return { token, hash: sha256(token) };
}

export function ownsWith(token: string | null, hash: string): boolean {
  if (!token) return false;
  const a = Buffer.from(sha256(token), "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/** 10 chars from a 57-symbol alphabet (~58 bits), without look-alikes like 0/O and 1/l/I. */
export function shareId(): string {
  // Rejection sampling: 256 % 57 != 0, so plain modulo would skew towards early letters.
  const limit = 256 - (256 % ALPHABET.length);
  let id = "";
  while (id.length < 10) {
    for (const b of randomBytes(16)) {
      if (b < limit && id.length < 10) id += ALPHABET[b % ALPHABET.length];
    }
  }
  return id;
}
