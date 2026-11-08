import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { db } from "@/lib/db";
import { isOxapayEnabled } from "@/lib/env";
import { formatUsd } from "@/lib/validation/sponsor";
import { SponsorCta } from "@/components/sponsor/SponsorCta";

export const metadata: Metadata = pageMetadata({
  title: "Supporters — The People Who Fed the Notebook",
  description:
    "The supporters who keep the Death Note online. Sponsor with crypto through OxaPay; 70% of every sponsorship goes to charity and the rest keeps the site running.",
  path: "/supporters",
});

export const revalidate = 60;

async function load() {
  try {
    const [supporters, totals] = await Promise.all([
      db.sponsorship.findMany({
        where: { status: "paid", showPublicly: true },
        orderBy: { paidAt: "desc" },
        select: { id: true, name: true, message: true, paidAt: true },
        take: 200,
      }),
      db.sponsorship.aggregate({ where: { status: "paid" }, _sum: { charityCents: true } }),
    ]);
    return { supporters, charity: totals._sum.charityCents ?? 0 };
  } catch {
    return { supporters: [], charity: 0 };
  }
}

export default async function SupportersPage() {
  const { supporters, charity } = await load();
  const enabled = isOxapayEnabled();
  return (
    <div className="mx-auto max-w-4xl px-4 pt-28 pb-16">
      <header className="text-center">
        <p className="text-muted font-serif text-xs tracking-[0.5em] uppercase">
          Written in gold ink
        </p>
        <h1 className="title-ember mt-3 text-6xl">Supporters</h1>
        <p className="text-muted mx-auto mt-4 max-w-xl">
          This site is free. If it made your day a little darker (in a good way), consider a small
          contribution.
        </p>
        <p className="text-gold mt-4 font-serif text-lg">
          From every sponsor amount, 70% goes to charity.
        </p>
        <p className="text-muted mt-1 text-sm">
          {charity > 0 && <>{formatUsd(charity)} pledged to charity so far</>}
        </p>
        {enabled && (
          <div className="mt-8">
            <SponsorCta />
          </div>
        )}
      </header>

      <section aria-labelledby="ledger" className="paper mt-14 rounded-lg p-8 shadow-2xl sm:p-12">
        <h2
          id="ledger"
          className="font-scrawl text-ink text-2xl"
          style={{ filter: "url(#ink-bleed)" }}
        >
          The ledger of the generous
        </h2>
        {supporters.length === 0 ? (
          <p className="font-hand text-ink/70 mt-6 text-2xl">
            No names yet. The first page is waiting.
          </p>
        ) : (
          <ul className="divide-ink/15 mt-6 divide-y">
            {supporters.map((s) => (
              <li key={s.id} className="py-3">
                <p className="font-hand text-3xl" style={{ color: "#8a6a1f" }}>
                  {s.name || "A nameless benefactor"}
                </p>
                {s.message && <p className="font-hand text-ink/80 text-xl">“{s.message}”</p>}
                {s.paidAt && (
                  <p className="text-ink/70 font-serif text-xs">
                    {s.paidAt.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="text-muted mt-6 text-center text-xs">
        Only supporters who chose to be listed appear here. Amounts are never shown publicly.
      </p>
    </div>
  );
}
