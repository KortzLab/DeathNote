import { randomBytes } from "node:crypto";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { isOxapayEnabled, siteUrl } from "@/lib/env";
import { createInvoice } from "@/lib/oxapay/client";
import { charityCents, sponsorSchema } from "@/lib/validation/sponsor";
import { assertSameOrigin, error, json, readJson, zodError } from "@/lib/server/http";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isOxapayEnabled()) return error(404, "Sponsoring is not available.");
  const blocked = assertSameOrigin(req);
  if (blocked) return blocked;

  const limit = await rateLimit(`sponsor:${clientIp(req)}`, 6, 10 * 60);
  if (!limit.ok) return error(429, "Too many attempts. Try again in a few minutes.");

  let body: unknown;
  try {
    body = await readJson(req, 4096);
  } catch {
    return error(400, "Invalid JSON");
  }
  const parsed = sponsorSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);
  const { amount, name, message, showPublicly } = parsed.data;

  const session = await auth();
  const orderId = `dn_${randomBytes(12).toString("base64url")}`;
  const sponsorship = await db.sponsorship.create({
    data: {
      orderId,
      amountCents: amount,
      charityCents: charityCents(amount),
      currency: "USD",
      status: "pending",
      name,
      message,
      showPublicly,
      userId: session?.user?.id ?? null,
    },
    select: { id: true },
  });

  const base = siteUrl();
  try {
    const invoice = await createInvoice({
      amount: amount / 100,
      orderId,
      callbackUrl: `${base}/api/webhooks/oxapay`,
      returnUrl: `${base}/sponsor/return?order=${encodeURIComponent(orderId)}`,
      description: "Death Note sponsorship (70% to charity)",
    });
    await db.sponsorship.update({
      where: { id: sponsorship.id },
      data: { oxapayTrackId: invoice.trackId, paymentUrl: invoice.paymentUrl },
    });
    return json({ orderId, paymentUrl: invoice.paymentUrl }, 201);
  } catch {
    await db.sponsorship.update({ where: { id: sponsorship.id }, data: { status: "failed" } });
    return error(502, "The payment gateway did not answer. Please try again shortly.");
  }
}
