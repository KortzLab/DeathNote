import { auth } from "@/auth";
import { db } from "@/lib/db";
import { importSchema, noteFieldsSchema } from "@/lib/validation/notes";
import { assertSameOrigin, error, json, readJson, zodError } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { getNotebookId, getPageId } from "@/lib/server/notes";

// Idempotent: (page, clientId) is unique, so re-importing is a no-op.
export async function POST(req: Request) {
  const blocked = assertSameOrigin(req);
  if (blocked) return blocked;
  const session = await auth();
  if (!session?.user?.id) return error(401, "Sign in first.");

  const limit = await rateLimit(`import:${session.user.id}`, 5, 60 * 10);
  if (!limit.ok) return error(429, "Too many imports. Try again later.");

  let body: unknown;
  try {
    body = await readJson(req, 1024 * 1024);
  } catch {
    return error(400, "Invalid JSON");
  }
  const parsed = importSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const notebookId = await getNotebookId(session.user.id);
  const pageIds = new Map<number, string>();
  let imported = 0;
  let skipped = 0;

  for (const guest of parsed.data.notes) {
    const fields = noteFieldsSchema.safeParse(guest);
    if (!fields.success) {
      skipped++;
      continue;
    }
    let pageId = pageIds.get(guest.page);
    if (!pageId) {
      pageId = await getPageId(notebookId, guest.page);
      pageIds.set(guest.page, pageId);
    }
    const created = Date.parse(guest.createdAt);
    const sealed = guest.sealedAt ? Date.parse(guest.sealedAt) : NaN;
    const result = await db.note.upsert({
      where: { pageId_clientId: { pageId, clientId: guest.id } },
      update: {},
      create: {
        ...fields.data,
        pageId,
        clientId: guest.id,
        position: await db.note.count({ where: { pageId, deletedAt: null } }),
        createdAt: Number.isFinite(created) ? new Date(created) : new Date(),
        sealedAt: Number.isFinite(sealed) ? new Date(sealed) : null,
      },
      select: { id: true },
    });
    if (result) imported++;
  }
  return json({ imported, skipped });
}
