import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { assertSameOrigin, error, json } from "@/lib/server/http";
import { ownsWith } from "@/lib/server/identity";

type Ctx = { params: Promise<{ id: string }> };

// Authors can withdraw their own entry (token from the browser, or their account).
export async function DELETE(req: Request, ctx: Ctx) {
  const blocked = assertSameOrigin(req);
  if (blocked) return blocked;
  const { id } = await ctx.params;

  const entry = await db.publicEntry.findFirst({
    where: { id, hiddenAt: null },
    select: { ownerHash: true, authorId: true },
  });
  if (!entry) return error(404, "Not found");

  const session = await auth();
  const isAuthor = Boolean(session?.user?.id && session.user.id === entry.authorId);
  if (!isAuthor && !ownsWith(req.headers.get("x-owner-token"), entry.ownerHash)) {
    return error(403, "Only the author can withdraw this entry.");
  }

  await db.publicEntry.update({ where: { id }, data: { hiddenAt: new Date() } });
  revalidatePath("/");
  return json({ ok: true });
}
