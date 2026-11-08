import { db } from "@/lib/db";
import { REPORT_REASONS, type ReportReason, type TargetType } from "@/lib/public/shared";
import { moderate } from "@/app/admin/actions";

type QueueItem = {
  type: TargetType;
  id: string;
  name: string;
  cause: string | null;
  hidden: boolean;
  reports: number;
  reasons: string[];
};

async function loadQueue(): Promise<QueueItem[]> {
  const open = await db.report.findMany({
    where: { resolvedAt: null },
    orderBy: { createdAt: "desc" },
    take: 500,
    select: { targetType: true, targetId: true, reason: true },
  });

  const byTarget = new Map<string, { type: TargetType; id: string; reasons: string[] }>();
  for (const r of open) {
    const key = `${r.targetType}:${r.targetId}`;
    const item = byTarget.get(key) ?? { type: r.targetType, id: r.targetId, reasons: [] };
    item.reasons.push(REPORT_REASONS[r.reason as ReportReason] ?? r.reason);
    byTarget.set(key, item);
  }

  const ids = (type: TargetType) =>
    [...byTarget.values()].filter((t) => t.type === type).map((t) => t.id);
  const select = { id: true, name: true, cause: true, hiddenAt: true, reports: true } as const;
  const [entries, shares] = await Promise.all([
    db.publicEntry.findMany({ where: { id: { in: ids("public_entry") } }, select }),
    db.sharedNote.findMany({ where: { id: { in: ids("shared_note") } }, select }),
  ]);

  const rows = [
    ...entries.map((e) => ({ ...e, type: "public_entry" as const })),
    ...shares.map((s) => ({ ...s, type: "shared_note" as const })),
  ];
  return rows
    .map((row) => ({
      type: row.type,
      id: row.id,
      name: row.name,
      cause: row.cause,
      hidden: Boolean(row.hiddenAt),
      reports: row.reports,
      reasons: byTarget.get(`${row.type}:${row.id}`)?.reasons ?? [],
    }))
    .sort((a, b) => b.reports - a.reports);
}

export async function Moderation() {
  const queue = await loadQueue();

  return (
    <section aria-labelledby="moderation" className="mt-12">
      <h2 id="moderation" className="font-serif text-xl">
        Reports <span className="text-muted">({queue.length})</span>
      </h2>
      {queue.length === 0 ? (
        <p className="text-muted mt-3 text-sm">Nothing waiting for review.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {queue.map((item) => (
            <li
              key={`${item.type}:${item.id}`}
              className="border-smoke bg-abyss rounded-xl border p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-hand text-bone text-2xl">{item.name}</p>
                  {item.cause && <p className="text-muted text-sm">{item.cause}</p>}
                  <p className="text-muted mt-1 text-xs">
                    {item.type === "public_entry" ? "Open book entry" : "Shared page"} ·{" "}
                    {item.reports} report{item.reports === 1 ? "" : "s"} ·{" "}
                    {item.hidden ? <span className="text-blood-bright">hidden</span> : "visible"}
                  </p>
                  <p className="text-muted mt-1 text-xs">{[...new Set(item.reasons)].join(", ")}</p>
                </div>
                <form action={moderate} className="flex gap-2">
                  <input type="hidden" name="targetType" value={item.type} />
                  <input type="hidden" name="targetId" value={item.id} />
                  {item.hidden ? (
                    <button name="action" value="restore" className="btn-ghost px-3 py-1 text-xs">
                      Restore
                    </button>
                  ) : (
                    <button name="action" value="hide" className="btn-seal px-3 py-1 text-xs">
                      Hide
                    </button>
                  )}
                  <button name="action" value="dismiss" className="btn-ghost px-3 py-1 text-xs">
                    Dismiss
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
