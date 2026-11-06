import { db } from "@/lib/db";
import { error, json } from "@/lib/server/http";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

// No auth: the 96-bit random order id is the capability.
export async function GET(req: Request) {
  const order = new URL(req.url).searchParams.get("order") ?? "";
  if (!/^dn_[A-Za-z0-9_-]{16}$/.test(order)) return error(404, "Not found");

  const limit = await rateLimit(`status:${clientIp(req)}`, 60, 60);
  if (!limit.ok) return error(429, "Slow down");

  const s = await db.sponsorship.findUnique({
    where: { orderId: order },
    select: { status: true, amountCents: true, charityCents: true, name: true, paymentUrl: true },
  });
  if (!s) return error(404, "Not found");
  return json({
    status: s.status,
    amountCents: s.amountCents,
    charityCents: s.charityCents,
    name: s.name,
    paymentUrl: s.status === "pending" || s.status === "paying" ? s.paymentUrl : null,
  });
}
