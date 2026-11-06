import "server-only";
import { z } from "zod";
import { oxapayKey } from "@/lib/env";

const API = "https://api.oxapay.com/v1";
const INVOICE_LIFETIME_MIN = 60;

const invoiceResponse = z.object({
  data: z.object({
    track_id: z.union([z.string(), z.number()]).transform(String),
    payment_url: z.string().url(),
    expired_at: z.number().optional(),
    date: z.number().optional(),
  }),
  message: z.string().optional(),
  status: z.number().optional(),
});

export type Invoice = { trackId: string; paymentUrl: string; expiresAt: number | null };

export class OxapayError extends Error {}

// POST /v1/payment/invoice. Errors are rethrown without response bodies so the key never ends up in logs.
export async function createInvoice(input: {
  amount: number;
  orderId: string;
  callbackUrl: string;
  returnUrl: string;
  description: string;
}): Promise<Invoice> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(`${API}/payment/invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        merchant_api_key: oxapayKey(),
      },
      body: JSON.stringify({
        amount: input.amount,
        currency: "USD",
        lifetime: INVOICE_LIFETIME_MIN,
        fee_paid_by_payer: 0,
        callback_url: input.callbackUrl,
        return_url: input.returnUrl,
        order_id: input.orderId,
        description: input.description,
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    const body: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new OxapayError(`OxaPay responded with HTTP ${res.status}`);
    const parsed = invoiceResponse.safeParse(body);
    if (!parsed.success) throw new OxapayError("Unexpected OxaPay response");
    return {
      trackId: parsed.data.data.track_id,
      paymentUrl: parsed.data.data.payment_url,
      expiresAt: parsed.data.data.expired_at ?? null,
    };
  } catch (e) {
    if (e instanceof OxapayError) throw e;
    throw new OxapayError(
      (e as Error).name === "AbortError" ? "OxaPay timed out" : "OxaPay unreachable",
    );
  } finally {
    clearTimeout(timeout);
  }
}
