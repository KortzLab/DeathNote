import "server-only";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { TargetType } from "@/lib/public/shared";

type Counter = "candles" | "reports";

// Small adapter so reports and candles don't need a switch on every call site.
export async function targetExists(type: TargetType, id: string): Promise<boolean> {
  const where = { id, hiddenAt: null };
  const found =
    type === "public_entry"
      ? await db.publicEntry.findFirst({ where, select: { id: true } })
      : await db.sharedNote.findFirst({ where, select: { id: true } });
  return Boolean(found);
}

export async function bump(type: TargetType, id: string, field: Counter) {
  const data = { [field]: { increment: 1 } };
  const select = { candles: true, reports: true } as const;
  return type === "public_entry"
    ? db.publicEntry.update({ where: { id }, data, select })
    : db.sharedNote.update({ where: { id }, data, select });
}

export async function readCounter(type: TargetType, id: string, field: Counter) {
  const select = { [field]: true } as Record<Counter, true>;
  const row =
    type === "public_entry"
      ? await db.publicEntry.findUnique({ where: { id }, select })
      : await db.sharedNote.findUnique({ where: { id }, select });
  return row?.[field] ?? 0;
}

export async function hide(type: TargetType, id: string, hidden: boolean) {
  const data = { hiddenAt: hidden ? new Date() : null };
  if (type === "public_entry") await db.publicEntry.update({ where: { id }, data });
  else await db.sharedNote.update({ where: { id }, data });
  // Hidden or restored items change what the home page shows.
  revalidatePath("/");
}
