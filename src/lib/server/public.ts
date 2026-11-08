import "server-only";
import { db } from "@/lib/db";
import { PUBLIC_PAGE_SIZE, type PublicItem } from "@/lib/public/shared";

type Row = {
  id: string;
  name: string;
  cause: string | null;
  details: string | null;
  time: string | null;
  penName: string | null;
  candles: number;
  createdAt: Date;
};

const itemSelect = {
  id: true,
  name: true,
  cause: true,
  details: true,
  time: true,
  penName: true,
  candles: true,
  createdAt: true,
} as const;

function toItem(row: Row): PublicItem {
  return {
    id: row.id,
    name: row.name,
    cause: row.cause,
    details: row.details,
    time: row.time,
    penName: row.penName,
    candles: row.candles,
    createdAt: row.createdAt.toISOString(),
  };
}

const visible = { hiddenAt: null } as const;

export async function publicStats() {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const [total, today] = await Promise.all([
    db.publicEntry.count({ where: visible }),
    db.publicEntry.count({ where: { ...visible, createdAt: { gte: startOfDay } } }),
  ]);
  // There is always one page with room to write on.
  const pages = Math.max(1, Math.floor(total / PUBLIC_PAGE_SIZE) + 1);
  return { total, today, pages };
}

export async function publicPage(page: number): Promise<PublicItem[]> {
  const rows = await db.publicEntry.findMany({
    where: visible,
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    skip: (page - 1) * PUBLIC_PAGE_SIZE,
    take: PUBLIC_PAGE_SIZE,
    select: itemSelect,
  });
  return rows.map(toItem);
}

export async function latestPublicEntries(take: number): Promise<PublicItem[]> {
  const rows = await db.publicEntry.findMany({
    where: visible,
    orderBy: { createdAt: "desc" },
    take,
    select: itemSelect,
  });
  return rows.map(toItem);
}

export type SharedItem = PublicItem & { views: number; source: string };

export async function sharedNote(id: string): Promise<SharedItem | null> {
  const row = await db.sharedNote.findFirst({
    where: { id, ...visible },
    select: { ...itemSelect, views: true, source: true },
  });
  if (!row) return null;
  return { ...toItem(row), views: row.views, source: row.source };
}

export async function recentShares(take: number): Promise<SharedItem[]> {
  const rows = await db.sharedNote.findMany({
    where: visible,
    orderBy: { createdAt: "desc" },
    take,
    select: { ...itemSelect, views: true, source: true },
  });
  return rows.map((r) => ({ ...toItem(r), views: r.views, source: r.source }));
}
