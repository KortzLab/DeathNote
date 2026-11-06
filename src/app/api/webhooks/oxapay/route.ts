import { db } from "@/lib/db";
import { isOxapayEnabled, oxapayKey } from "@/lib/env";
import { eventKey, verifySignature } from "@/lib/oxapay/signature";
import { canTransition, mapOxapayStatus, webhookPayloadSchema } from "@/lib/oxapay/status";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const text = (body: string, status: number) =>
  new Response(body, {
    status,
    headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
  });

// The only code path that can mark a sponsorship as paid.
export async function POST(req: Request) {
  if (!isOxapayEnabled()) return text("disabled", 404);

  const limit = await rateLimit(`webhook:${clientIp(req)}`, 120, 60);
  if (!limit.ok) return text("slow down", 429);

  const raw = await req.text();
  if (raw.length > 64 * 1024) return text("too large", 413);

  if (!verifySignature(raw, req.headers.get("hmac"), oxapayKey())) {
    return text("invalid signature", 400);
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return text("invalid json", 400);
  }
  const parsed = webhookPayloadSchema.safeParse(json);
  if (!parsed.success) return text("invalid payload", 400);
  const payload = parsed.data;

  const key = eventKey(raw);
  let eventId: string;
  try {
    const event = await db.webhookEvent.create({
      data: {
        eventKey: key,
        trackId: payload.track_id,
        status: payload.status,
        signatureOk: true,
        payload: payload as Prisma.InputJsonValue,
      },
      select: { id: true },
    });
    eventId = event.id;
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
    // Seen before: ack if it was processed, otherwise a previous attempt died mid-way, so retry it.
    const existing = await db.webhookEvent.findUnique({
      where: { eventKey: key },
      select: { id: true, processedAt: true },
    });
    if (!existing || existing.processedAt) return text("ok", 200);
    eventId = existing.id;
  }

  const finish = (error: string | null, sponsorshipId: string | null = null) =>
    db.webhookEvent.update({
      where: { id: eventId },
      data: { processedAt: new Date(), error, sponsorshipId },
    });

  if (
    payload.type &&
    !["invoice", "payment_link", "white_label"].includes(payload.type.toLowerCase())
  ) {
    await finish(`ignored type ${payload.type}`);
    return text("ok", 200);
  }

  const status = mapOxapayStatus(payload.status);
  if (!status) {
    await finish(`unknown status ${payload.status}`);
    return text("ok", 200);
  }

  const sponsorship = await db.sponsorship.findFirst({
    where: {
      OR: [
        { oxapayTrackId: payload.track_id },
        ...(payload.order_id ? [{ orderId: payload.order_id }] : []),
      ],
    },
  });
  if (!sponsorship) {
    await finish("no matching sponsorship");
    return text("ok", 200);
  }

  // Belt and braces: a valid signature with the wrong amount still does not count.
  if (status === "paid" && payload.currency?.toUpperCase() === "USD" && payload.amount != null) {
    const cents = Math.round(Number(payload.amount) * 100);
    if (Number.isFinite(cents) && cents !== sponsorship.amountCents) {
      await finish(
        `amount mismatch: got ${cents}, expected ${sponsorship.amountCents}`,
        sponsorship.id,
      );
      return text("ok", 200);
    }
  }

  if (!canTransition(sponsorship.status, status)) {
    await finish(`ignored transition ${sponsorship.status} -> ${status}`, sponsorship.id);
    return text("ok", 200);
  }

  await db.$transaction([
    db.sponsorship.update({
      where: { id: sponsorship.id },
      data: {
        status,
        oxapayTrackId: sponsorship.oxapayTrackId ?? payload.track_id,
        ...(status === "paid" ? { paidAt: new Date() } : {}),
      },
    }),
    db.webhookEvent.update({
      where: { id: eventId },
      data: { processedAt: new Date(), sponsorshipId: sponsorship.id },
    }),
  ]);

  return text("ok", 200);
}
