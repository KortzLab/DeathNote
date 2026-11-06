import "server-only";
import { z } from "zod";
import { SITE } from "@/lib/site";

// Never log anything read here.
const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().optional(),
  OXAPAY_ENABLED: z.string().optional(),
  OXAPAY_MERCHANT_API_KEY: z.string().optional(),
  ADMIN_EMAILS: z.string().optional(),
});

function read() {
  return schema.parse(process.env);
}

export function siteUrl(): string {
  return SITE.url;
}

export function isOxapayEnabled(): boolean {
  const e = read();
  return e.OXAPAY_ENABLED === "true" && Boolean(e.OXAPAY_MERCHANT_API_KEY);
}

export function oxapayKey(): string {
  const key = read().OXAPAY_MERCHANT_API_KEY;
  if (!key) throw new Error("OxaPay is not configured");
  return key;
}

export function adminEmails(): string[] {
  return (read().ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}