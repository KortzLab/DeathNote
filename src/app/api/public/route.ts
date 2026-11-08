import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { publicEntrySchema } from "@/lib/validation/public";
import { assertSameOrigin, error, json, readJson, zodError } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { newOwnerToken, visitorHash } from "@/lib/server/identity";
import { publicPage, publicStats } from "@/lib/server/public";

export const dynamic = "force-dynamic";

// GET /api/public            -> stats only (cheap, used for live polling)
// GET /api/public?page=3     -> stats + that page
export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("page");
  const stats = await publicStats();
  if (raw === null) return json({ stats });

  const page = Number(raw);
  if (!Number.isInteger(page) || page < 1 || page > stats.pages) return error(404, "No such page");
  return json({ stats, page, entries: await publicPage(page) });
}

export async function POST(req: Request) {
  const blocked = assertSameOrigin(req);
  if (blocked) return blocked;

  const visitor = visitorHash(req);
  // A burst limit and a daily cap: the public book should not become anyone's spam wall.
  const [burst, daily] = await Promise.all([
    rateLimit(`public:burst:${visitor}`, 5, 10 * 60),
    rateLimit(`public:day:${visitor}`, 30, 24 * 60 * 60),
  ]);
  if (!burst.ok || !daily.ok) return error(429, "The open book needs to rest. Try again later.");

  let body: unknown;
  try {
    body = await readJson(req, 8 * 1024);
  } catch {
    return error(400, "Invalid JSON");
  }
  const parsed = publicEntrySchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const session = await auth();
  const owner = newOwnerToken();
  const entry = await db.publicEntry.create({
    data: {
      ...parsed.data,
      authorId: session?.user?.id ?? null,
      ownerHash: owner.hash,
      ipHash: visitor,
    },
    select: { id: true, createdAt: true },
  });

  revalidatePath("/");
  return json({ id: entry.id, createdAt: entry.createdAt, ownerToken: owner.token }, 201);
}
