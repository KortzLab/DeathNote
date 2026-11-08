import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { checkAdmin } from "@/lib/server/admin";
import { formatUsd } from "@/lib/validation/sponsor";
import { Moderation } from "@/app/admin/Moderation";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const admin = await checkAdmin();
  if (!admin.ok) {
    // Everyone who isn't an admin gets a plain 404; admins just sign in again.
    if (admin.reason === "forbidden") notFound();
    redirect("/signin?callbackUrl=/admin");
  }

  const { status } = await searchParams;
  const statuses = ["pending", "paying", "paid", "expired", "failed", "refunded"] as const;
  const filter = statuses.find((s) => s === status);

  const [rows, paid, counts, events] = await Promise.all([
    db.sponsorship.findMany({
      where: filter ? { status: filter } : {},
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    db.sponsorship.aggregate({
      where: { status: "paid" },
      _sum: { amountCents: true, charityCents: true },
      _count: true,
    }),
    db.sponsorship.groupBy({ by: ["status"], _count: true }),
    db.webhookEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        trackId: true,
        status: true,
        error: true,
        processedAt: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-28 pb-16">
      <h1 className="title-ember text-5xl">Ledger &amp; moderation</h1>
      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Received (paid)" value={formatUsd(paid._sum.amountCents ?? 0)} />
        <Stat label="Charity share (70%)" value={formatUsd(paid._sum.charityCents ?? 0)} accent />
        <Stat label="Paid sponsorships" value={String(paid._count)} />
      </dl>

      <nav aria-label="Filter by status" className="mt-8 flex flex-wrap gap-2 text-sm">
        <a href="/admin" className={`btn-ghost px-3 py-1 ${!filter ? "border-ember" : ""}`}>
          All
        </a>
        {statuses.map((s) => (
          <a
            key={s}
            href={`/admin?status=${s}`}
            className={`btn-ghost px-3 py-1 ${filter === s ? "border-ember" : ""}`}
          >
            {s} ({counts.find((c) => c.status === s)?._count ?? 0})
          </a>
        ))}
      </nav>

      <div className="border-smoke mt-6 overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Sponsorships</caption>
          <thead className="bg-ash text-muted text-xs tracking-widest uppercase">
            <tr>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Charity</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Track ID</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Public</th>
            </tr>
          </thead>
          <tbody className="divide-smoke divide-y">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="text-muted px-3 py-2 whitespace-nowrap">
                  {r.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                </td>
                <td className="px-3 py-2 font-mono text-xs">{r.orderId}</td>
                <td className="px-3 py-2">{formatUsd(r.amountCents)}</td>
                <td className="text-gold px-3 py-2">{formatUsd(r.charityCents)}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      r.status === "paid"
                        ? "text-gold"
                        : r.status === "failed" || r.status === "expired"
                          ? "text-blood-bright"
                          : "text-muted"
                    }
                  >
                    {r.status}
                  </span>
                </td>
                <td className="text-muted px-3 py-2 font-mono text-xs">{r.oxapayTrackId ?? "—"}</td>
                <td className="max-w-[12rem] truncate px-3 py-2" title={r.message ?? undefined}>
                  {r.name ?? "—"}
                </td>
                <td className="px-3 py-2">{r.showPublicly ? "yes" : "no"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="text-muted px-3 py-6 text-center">
                  Nothing here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Moderation />

      <h2 className="mt-12 font-serif text-xl">Latest webhook deliveries</h2>
      <ul className="text-muted mt-3 space-y-1 font-mono text-xs">
        {events.map((e) => (
          <li key={e.id}>
            {e.createdAt.toISOString()} · {e.trackId} · {e.status} ·{" "}
            {e.processedAt ? "processed" : "pending"}
            {e.error ? ` · ${e.error}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border-smoke bg-abyss rounded-xl border p-5">
      <dt className="text-muted text-xs tracking-widest uppercase">{label}</dt>
      <dd className={`mt-2 font-serif text-3xl ${accent ? "text-gold" : "text-bone"}`}>{value}</dd>
    </div>
  );
}
