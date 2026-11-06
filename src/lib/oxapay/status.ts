import { z } from "zod";

export type SponsorshipStatus = "pending" | "paying" | "paid" | "expired" | "failed" | "refunded";

export function mapOxapayStatus(raw: string): SponsorshipStatus | null {
  switch (raw.trim().toLowerCase().replace(/\s+/g, "_")) {
    case "new":
    case "waiting":
      return "pending";
    case "paying":
    case "confirming":
      return "paying";
    case "paid":
    case "manual_accept":
      return "paid";
    case "expired":
      return "expired";
    case "failed":
    case "canceled":
    case "cancelled":
      return "failed";
    case "refunding":
    case "refunded":
      return "refunded";
    default:
      return null;
  }
}

const ORDER: Record<SponsorshipStatus, number> = {
  pending: 0,
  paying: 1,
  expired: 2,
  failed: 2,
  paid: 3,
  refunded: 4,
};

// Callbacks can arrive out of order, so a late "Paying" must not undo "Paid".
export function canTransition(from: SponsorshipStatus, to: SponsorshipStatus): boolean {
  if (from === to) return false;
  if (from === "paid") return to === "refunded";
  if (from === "refunded") return false;
  if ((from === "expired" || from === "failed") && to !== "paid") return false;
  return ORDER[to] >= ORDER[from];
}

// passthrough(): unknown fields are kept for the audit log.
export const webhookPayloadSchema = z
  .object({
    track_id: z.union([z.string(), z.number()]).transform(String),
    status: z.string().min(1).max(40),
    type: z.string().max(40).optional(),
    order_id: z.string().max(100).nullish(),
    amount: z.union([z.number(), z.string()]).nullish(),
    currency: z.string().max(12).nullish(),
  })
  .passthrough();

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
