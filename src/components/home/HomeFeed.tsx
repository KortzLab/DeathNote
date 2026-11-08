import Link from "next/link";
import { BlottedName, PaperCard } from "@/components/public/PaperCard";
import { InkLink } from "@/components/ui/InkLink";
import { latestPublicEntries, publicStats, recentShares } from "@/lib/server/public";

async function load() {
  try {
    const [shares, fresh, stats] = await Promise.all([
      recentShares(9),
      latestPublicEntries(5),
      publicStats(),
    ]);
    return { shares, fresh, stats };
  } catch {
    // The home page must render even if the database is unreachable.
    return null;
  }
}

export async function HomeFeed() {
  const data = await load();
  if (!data) return null;
  const { shares, fresh, stats } = data;

  return (
    <div className="relative mx-auto max-w-6xl space-y-24 px-4 py-24 sm:px-6">
      <section aria-labelledby="shared-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-muted font-serif text-xs tracking-[0.4em] uppercase">
              Torn-out pages
            </p>
            <h2 id="shared-heading" className="title-ember mt-2 text-4xl sm:text-5xl">
              Shared by the living
            </h2>
          </div>
          <p className="text-muted max-w-sm text-sm">
            Pages people chose to tear out and leave here. Names can be blotted out by their author.
          </p>
        </div>

        {shares.length === 0 ? (
          <p className="text-muted mt-10 font-serif italic">
            No pages yet. Write one in your notebook and press Share.
          </p>
        ) : (
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {shares.map((note, i) => (
              <li key={note.id}>
                <Link
                  href={`/n/${note.id}`}
                  className="group block transition-transform duration-300 hover:-translate-y-1"
                  style={{ rotate: `${((i * 37) % 7) - 3}deg` }}
                  aria-label={`Open shared page${note.name ? ` for ${note.name}` : ""}`}
                >
                  <PaperCard note={note} />
                  <p className="text-muted mt-2 flex justify-between px-1 text-xs">
                    <span>
                      {note.candles} {note.candles === 1 ? "candle" : "candles"}
                    </span>
                    <span className="group-hover:text-bone">Read the page →</span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="open-book-heading" className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="text-muted font-serif text-xs tracking-[0.4em] uppercase">The open book</p>
          <h2 id="open-book-heading" className="title-ember mt-2 text-4xl sm:text-5xl">
            Fresh ink
          </h2>
          <p className="text-muted mt-4">
            One notebook everyone writes in. {stats.total.toLocaleString("en-US")} names across{" "}
            {stats.pages.toLocaleString("en-US")} pages, {stats.today.toLocaleString("en-US")} of
            them today.
          </p>
          <InkLink href="/public" className="btn-seal mt-8">
            Open the public book
          </InkLink>
        </div>

        <ol className="paper paper-black space-y-4 rounded-lg p-8 shadow-2xl">
          {fresh.length === 0 && (
            <li className="font-serif text-sm text-white/60 italic">
              The first page is still blank.
            </li>
          )}
          {fresh.map((e) => (
            <li key={e.id} className="border-b border-white/10 pb-3 last:border-0">
              <p className="font-hand text-2xl text-white">
                {e.name ?? <BlottedName length={e.nameLength} />}
              </p>
              {(e.cause || e.penName) && (
                <p className="font-serif text-xs text-white/60">
                  {e.cause}
                  {e.cause && e.penName && " · "}
                  {e.penName && `— ${e.penName}`}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
