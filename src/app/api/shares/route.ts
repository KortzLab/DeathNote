import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/env";
import { shareSchema } from "@/lib/validation/public";
import { assertSameOrigin, error, json, readJson, zodError } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { newOwnerToken, shareId, visitorHash } from "@/lib/server/identity";

export async function POST(req: Request) {
  const blocked = assertSameOrigin(req);
  if (blocked) return blocked;

  const visitor = visitorHash(req);
  const limit = await rateLimit(`share:${visitor}`, 10, 60 * 60);
  if (!limit.ok) return error(429, "Too many pages shared. Try again in an hour.");

  let body: unknown;
  try {
    body = await readJson(req, 8 * 1024);
  } catch {
    return error(400, "Invalid JSON");
  }
  const parsed = shareSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const session = await auth();
  const owner = newOwnerToken();
  const id = shareId();
  await db.sharedNote.create({
    data: {
      id,
      ...parsed.data,
      authorId: session?.user?.id ?? null,
      ownerHash: owner.hash,
      ipHash: visitor,
    },
  });

  revalidatePath("/");
  return json({ id, url: `${siteUrl()}/n/${id}`, ownerToken: owner.token }, 201);
}
