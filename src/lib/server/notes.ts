import "server-only";
import { db } from "@/lib/db";
import type { NoteRecord } from "@/lib/notes/types";

type DbNote = {
  id: string;
  name: string;
  cause: string | null;
  details: string | null;
  time: string | null;
  sealedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  page: { number: number };
};

export const noteSelect = {
  id: true,
  name: true,
  cause: true,
  details: true,
  time: true,
  sealedAt: true,
  createdAt: true,
  updatedAt: true,
  page: { select: { number: true } },
} as const;

export function toRecord(n: DbNote): NoteRecord {
  return {
    id: n.id,
    page: n.page.number,
    name: n.name,
    cause: n.cause,
    details: n.details,
    time: n.time,
    sealedAt: n.sealedAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  };
}

// One active notebook per user, created on first write.
export async function getNotebookId(userId: string): Promise<string> {
  const existing = await db.notebook.findFirst({
    where: { ownerId: userId, deletedAt: null },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing.id;
  const created = await db.notebook.create({ data: { ownerId: userId }, select: { id: true } });
  return created.id;
}

export async function getPageId(notebookId: string, number: number): Promise<string> {
  const page = await db.page.upsert({
    where: { notebookId_number: { notebookId, number } },
    update: { deletedAt: null },
    create: { notebookId, number },
    select: { id: true },
  });
  return page.id;
}

export async function findOwnedNote(userId: string, id: string) {
  return db.note.findFirst({
    where: { id, deletedAt: null, page: { notebook: { ownerId: userId, deletedAt: null } } },
    select: { id: true, sealedAt: true },
  });
}
