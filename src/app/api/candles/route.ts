import { db } from "@/lib/db";
import { targetSchema } from "@/lib/validation/public";
import { assertSameOrigin, error, json, readJson, zodError } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { visitorHash } from "@/lib/server/identity";
import { bump, readCounter, targetExists } from "@/lib/server/targets";
import { Prisma } from "@/generated/prisma/client";

// "Light a candle" for a page: one per person per item, no undo.
export async function POST(req: Request) {
  const blocked = assertSameOrigin(req);
  if (blocked) return blocked;

  const visitor = visitorHash(req);
  const limit = await rateLimit(`candle:${visitor}`, 120, 60 * 60);
  if (!limit.ok) return error(429, "Slow down.");

  let body: unknown;
  try {
    body = await readJson(req, 1024);
  } catch {
    return error(400, "Invalid JSON");
  }
  const parsed = targetSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);
  const { targetType, targetId } = parsed.data;

  if (!(await targetExists(targetType, targetId))) return error(404, "Not found");

  try {
    await db.candle.create({ data: { targetType, targetId, ipHash: visitor } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return json({ candles: await readCounter(targetType, targetId, "candles") });
    }
    throw e;
  }
  const { candles } = await bump(targetType, targetId, "candles");
  return json({ candles }, 201);
}
