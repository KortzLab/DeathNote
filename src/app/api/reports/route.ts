import { db } from "@/lib/db";
import { reportSchema } from "@/lib/validation/public";
import { shouldAutoHide } from "@/lib/public/shared";
import { assertSameOrigin, error, json, readJson, zodError } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { visitorHash } from "@/lib/server/identity";
import { bump, hide, targetExists } from "@/lib/server/targets";
import { Prisma } from "@/generated/prisma/client";

export async function POST(req: Request) {
  const blocked = assertSameOrigin(req);
  if (blocked) return blocked;

  const visitor = visitorHash(req);
  const limit = await rateLimit(`report:${visitor}`, 20, 60 * 60);
  if (!limit.ok) return error(429, "Too many reports. Try again later.");

  let body: unknown;
  try {
    body = await readJson(req, 2048);
  } catch {
    return error(400, "Invalid JSON");
  }
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);
  const { targetType, targetId, reason } = parsed.data;

  if (!(await targetExists(targetType, targetId))) return error(404, "Not found");

  try {
    await db.report.create({ data: { targetType, targetId, reason, ipHash: visitor } });
  } catch (e) {
    // Already reported by this person: say thanks again, count it once.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return json({ ok: true });
    }
    throw e;
  }

  const { reports } = await bump(targetType, targetId, "reports");
  if (shouldAutoHide(reports)) await hide(targetType, targetId, true);

  return json({ ok: true }, 201);
}
