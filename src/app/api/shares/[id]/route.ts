import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SHARE_ID } from "@/lib/public/shared";
import { assertSameOrigin, error, json } from "@/lib/server/http";
import { ownsWith } from "@/lib/server/identity";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(req: Request, ctx: Ctx) {
  const blocked = assertSameOrigin(req);
  if (blocked) return blocked;
  const { id } = await ctx.params;
  if (!SHARE_ID.test(id)) return error(404, "Not found");

  const share = await db.sharedNote.findUnique({
    where: { id },
    select: { ownerHash: true, authorId: true },
  });
  if (!share) return error(404, "Not found");

  const session = await auth();
  const isAuthor = Boolean(session?.user?.id && session.user.id === share.authorId);
  if (!isAuthor && !ownsWith(req.headers.get("x-owner-token"), share.ownerHash)) {
    return error(403, "Only the person who shared this page can remove it.");
  }

  // Unsharing deletes the snapshot outright; there is nothing to keep.
  await db.sharedNote.delete({ where: { id } });
  revalidatePath("/");
  return json({ ok: true });
}
