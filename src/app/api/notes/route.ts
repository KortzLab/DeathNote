import { auth } from "@/auth";
import { db } from "@/lib/db";
import { createNoteSchema, searchSchema } from "@/lib/validation/notes";
import { assertSameOrigin, error, json, readJson, zodError } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { getNotebookId, getPageId, noteSelect, toRecord } from "@/lib/server/notes";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return error(401, "Sign in to read your notebook.");

  const url = new URL(req.url);
  const parsed = searchSchema.safeParse({ q: url.searchParams.get("q") ?? "" });
  if (!parsed.success) return zodError(parsed.error);
  const q = parsed.data.q;

  const notes = await db.note.findMany({
    where: {
      deletedAt: null,
      page: { deletedAt: null, notebook: { ownerId: session.user.id, deletedAt: null } },
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { cause: { contains: q, mode: "insensitive" as const } },
              { details: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: [{ page: { number: "asc" } }, { position: "asc" }, { createdAt: "asc" }],
    select: noteSelect,
    take: 2000,
  });
  return json({ notes: notes.map(toRecord) });
}

export async function POST(req: Request) {
  const blocked = assertSameOrigin(req);
  if (blocked) return blocked;
  const session = await auth();
  if (!session?.user?.id) return error(401, "Sign in to write to your account.");

  const limit = await rateLimit(`write:${session.user.id}`, 30, 60);
  if (!limit.ok) return error(429, "The ink needs a moment to dry. Slow down.");

  let body: unknown;
  try {
    body = await readJson(req, 8 * 1024);
  } catch {
    return error(400, "Invalid JSON");
  }
  const parsed = createNoteSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);
  const { pageNumber, clientId, sealed, ...fields } = parsed.data;

  const notebookId = await getNotebookId(session.user.id);
  const pageId = await getPageId(notebookId, pageNumber);
  const position = await db.note.count({ where: { pageId, deletedAt: null } });
  const data = {
    ...fields,
    pageId,
    position,
    clientId: clientId ?? null,
    sealedAt: sealed ? new Date() : null,
  };
  // A retried request with the same client id must not create a duplicate.
  const note = clientId
    ? await db.note.upsert({
        where: { pageId_clientId: { pageId, clientId } },
        update: {},
        create: data,
        select: noteSelect,
      })
    : await db.note.create({ data, select: noteSelect });
  return json({ note: toRecord(note) }, 201);
}
