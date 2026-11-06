import { z } from "zod";
import { checkAll, GUARD_MESSAGES } from "@/lib/content-guard";
import { cleanText } from "@/lib/validation/notes";

export const SPONSOR_MIN = 1;
export const SPONSOR_MAX = 10_000;
export const RECOMMENDED_AMOUNTS = [3, 5, 10, 25, 50] as const;
export const MOST_CHOSEN = 10;
export const CHARITY_SHARE = 0.7;

// String parsing on purpose: 19.99 * 100 === 1998.9999999999998.
export function toCents(value: number | string): number | null {
  if (typeof value === "number" && !Number.isFinite(value)) return null;
  const s = typeof value === "number" ? String(value) : value.trim();
  if (!/^\d{1,6}(?:\.\d{1,2})?$/.test(s)) return null;
  const [whole = "0", frac = ""] = s.split(".");
  return Number(whole) * 100 + Number(frac.padEnd(2, "0"));
}

// Round down: never promise more than we collect.
export function charityCents(amountCents: number): number {
  return Math.floor((amountCents * 70) / 100);
}

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export const amountSchema = z
  .union([z.number(), z.string()])
  .transform((v, ctx) => {
    const cents = toCents(v);
    if (cents === null) {
      ctx.addIssue({ code: "custom", message: "Use a number with at most 2 decimals." });
      return z.NEVER;
    }
    return cents;
  })
  .pipe(
    z
      .number()
      .int()
      .min(SPONSOR_MIN * 100, `The minimum is $${SPONSOR_MIN}.`)
      .max(SPONSOR_MAX * 100, `The maximum is $${SPONSOR_MAX.toLocaleString("en-US")}.`),
  );

const optionalClean = (max: number) =>
  z
    .string()
    .max(max * 2)
    .transform(cleanText)
    .pipe(z.string().max(max))
    .nullish()
    .transform((v) => (v ? v : null));

export const sponsorSchema = z
  .object({
    amount: amountSchema,
    name: optionalClean(60),
    message: optionalClean(280),
    showPublicly: z.boolean().default(false),
  })
  .superRefine((v, ctx) => {
    const r = checkAll(v.name, v.message);
    if (!r.ok)
      ctx.addIssue({ code: "custom", message: GUARD_MESSAGES[r.reason], path: ["message"] });
  });

export type SponsorInput = z.input<typeof sponsorSchema>;
export type SponsorData = z.output<typeof sponsorSchema>;
