import { auth } from "@/auth";
import { db } from "@/lib/db";
import { updateNoteSchema } from "@/lib/validation/notes";
import { assertSameOrigin, error, json, readJson, zodError } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { findOwnedNote, noteSelect, toRecord } from "@/lib/server/notes";

type Ctx = { params: Promise<{ id: string }> };

const ID = /^[a-z0-9]{20,40}$/i;

export async function PATCH(req: Request, ctx: Ctx) {
  const blocked = assertSameOrigin(req);
  if (blocked) return blocked;
  const session = await auth();
  if (!session?.user?.id) return error(401, "Sign in first.");
  const { id } = await ctx.params;
  if (!ID.test(id)) return error(404, "Not found");

  const limit = await rateLimit(`write:${session.user.id}`, 60, 60);
  if (!limit.ok) return error(429, "The ink needs a moment to dry. Slow down.");

  let body: unknown;
  try {
    body = await readJson(req, 8 * 1024);
  } catch {
    return error(400, "Invalid JSON");
  }
  const parsed = updateNoteSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const owned = await findOwnedNote(session.user.id, id);
  if (!owned) return error(404, "Not found");

  const { sealed, name, cause, details, time } = parsed.data;
  const raw = body as Record<string, unknown>;
  const note = await db.note.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...("cause" in raw ? { cause } : {}),
      ...("details" in raw ? { details } : {}),
      ...("time" in raw ? { time } : {}),
      // Once the ink has set it stays set.
      ...(sealed && !owned.sealedAt ? { sealedAt: new Date() } : {}),
    },
    select: noteSelect,
  });
  return json({ note: toRecord(note) });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const blocked = assertSameOrigin(req);
  if (blocked) return blocked;
  const session = await auth();
  if (!session?.user?.id) return error(401, "Sign in first.");
  const { id } = await ctx.params;
  if (!ID.test(id)) return error(404, "Not found");

  const owned = await findOwnedNote(session.user.id, id);
  if (!owned) return error(404, "Not found");
  await db.note.update({ where: { id }, data: { deletedAt: new Date() } });
  return json({ ok: true });
}
