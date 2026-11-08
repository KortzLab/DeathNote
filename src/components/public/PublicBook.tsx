"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { FlipBook, type FlipBookHandle } from "@/components/notebook/FlipBook";
import { Endpaper, PageNumber, Verso } from "@/components/notebook/BookPages";
import { Candle } from "@/components/notebook/Candle";
import { SealFlash } from "@/components/notebook/SealFlash";
import { PublicPageView } from "@/components/public/PublicPageView";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useStoredValue } from "@/lib/hooks/useStoredValue";
import { useIdle } from "@/lib/hooks/useIdle";
import {
  PEN_NAME_KEY,
  invalidatePage,
  usePublicStats,
  type PublicStats,
} from "@/lib/public/client";

// The book can grow forever, so only a chapter of it is mounted at once.
const CHAPTER = 20;

function chapterAround(page: number, latest: number) {
  const lastStart = Math.max(1, latest - CHAPTER + 1);
  return Math.min(Math.max(1, page - Math.floor(CHAPTER / 2)), lastStart);
}

export function PublicBook({ initialStats }: { initialStats: PublicStats }) {
  const stats = usePublicStats(15_000, initialStats);
  const latest = stats.pages;
  const single = useMediaQuery("(max-width: 899px)");
  const reduced = useReducedMotion();
  const idle = useIdle(25_000);
  const book = useRef<FlipBookHandle>(null);

  const [target, setTarget] = useState(latest);
  const [start, setStart] = useState(() => chapterAround(latest, latest));
  const [penName, setPenName] = useStoredValue(PEN_NAME_KEY);
  const [freshIds, setFreshIds] = useState<Set<string>>(() => new Set());
  const [flash, setFlash] = useState(0);
  const [jump, setJump] = useState("");

  // Live updates: names written by other people since we opened the book.
  const seen = useRef(initialStats.total);
  const ownWrites = useRef(0);
  const [newNames, setNewNames] = useState(0);
  useEffect(() => {
    const others = stats.total - seen.current - ownWrites.current;
    if (others <= 0) return;
    invalidatePage(latest);
    if (latest > 1) invalidatePage(latest - 1);
    const t = setTimeout(() => setNewNames((n) => n + others), 0);
    seen.current = stats.total - ownWrites.current;
    return () => clearTimeout(t);
  }, [stats.total, latest]);

  const end = Math.min(start + CHAPTER - 1, latest);
  const pageNumbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const goToPage = useCallback(
    (page: number) => {
      const p = Math.min(Math.max(1, page), latest);
      setTarget(p);
      if (p >= start && p <= end) book.current?.goToPage(p - start + 1);
      else setStart(chapterAround(p, latest));
    },
    [end, latest, start],
  );

  const onWritten = useCallback((id: string) => {
    ownWrites.current += 1;
    setFreshIds((ids) => new Set(ids).add(id));
  }, []);

  function onJump(e: FormEvent) {
    e.preventDefault();
    const n = Number(jump);
    if (Number.isInteger(n)) goToPage(n);
  }

  const side = (index: number) => (single || index % 2 === 0 ? "right" : "left");
  const pages = [
    <ChapterTitle key="title" start={start} end={end} stats={stats} />,
    ...pageNumbers.map((n, i) => (
      <PublicPageView
        key={n}
        page={n}
        side={side(i + 1)}
        writable={n === latest}
        penName={penName}
        freshIds={freshIds}
        onWritten={onWritten}
        onSeal={() => setFlash((f) => f + 1)}
      />
    )),
  ];

  // With an even count the last page ends up on the left facing the bare cover; add a blank.
  if (!single && pages.length % 2 === 0) pages.push(<BlankPage key="blank" />);

  const nav = "btn-ghost px-3 py-1.5 text-xs disabled:opacity-30";

  return (
    <div className="relative mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6">
      <header className="mx-auto mb-6 max-w-3xl text-center">
        <h1 className="title-ember text-5xl sm:text-6xl">The Open Book</h1>
        <p className="text-muted mt-3 font-serif">
          One notebook, shared by everyone. Write a fictional name and it stays here, in ink, for
          good.
        </p>
      </header>

      {newNames > 0 && (
        <div
          role="status"
          className="mx-auto mb-4 flex max-w-md items-center justify-center gap-3 text-sm"
        >
          <span className="text-bone">
            {newNames} new {newNames === 1 ? "name was" : "names were"} just written.
          </span>
          <button
            type="button"
            className="btn-ghost px-3 py-1 text-xs"
            onClick={() => {
              setNewNames(0);
              goToPage(latest);
            }}
          >
            Turn to the latest page
          </button>
        </div>
      )}

      <div className="relative grid items-start gap-10 xl:grid-cols-[1fr_17rem]">
        <div className={single ? "px-2" : "px-12"}>
          <FlipBook
            ref={book}
            key={`${start}-${single ? "s" : "d"}`}
            pages={pages}
            single={single}
            reducedMotion={reduced}
            endpaper={<Endpaper />}
            verso={<Verso />}
            initialPage={Math.min(Math.max(target, start), end) - start + 1}
            idle={idle}
            ribbonPage={latest >= start && latest <= end ? latest - start + 1 : undefined}
          />
        </div>

        <aside aria-label="Open book tools" className="mx-auto w-full max-w-sm space-y-6 xl:pt-4">
          <Candle className="mx-auto hidden h-36 w-16 xl:block" />
          <dl className="grid grid-cols-3 gap-2 text-center">
            <Stat label="names" value={stats.total} />
            <Stat label="today" value={stats.today} />
            <Stat label="pages" value={stats.pages} />
          </dl>

          <label className="block text-sm">
            <span className="text-muted mb-1 block text-xs tracking-widest uppercase">Sign as</span>
            <input
              value={penName ?? ""}
              onChange={(e) => setPenName(e.target.value.slice(0, 40) || null)}
              placeholder="A pen name (optional)"
              className="border-smoke bg-void text-bone placeholder:text-muted/60 focus:border-ember w-full rounded-lg border px-3 py-2"
            />
          </label>

          <nav aria-label="Pages" className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={nav}
                onClick={() => goToPage(1)}
                disabled={start === 1}
              >
                First
              </button>
              <button
                type="button"
                className={nav}
                onClick={() => goToPage(start - 1)}
                disabled={start === 1}
              >
                Earlier
              </button>
              <button
                type="button"
                className={nav}
                onClick={() => goToPage(end + 1)}
                disabled={end >= latest}
              >
                Later
              </button>
              <button type="button" className={nav} onClick={() => goToPage(latest)}>
                Latest
              </button>
              <button
                type="button"
                className={nav}
                onClick={() => goToPage(1 + Math.floor(Math.random() * latest))}
                title="Let the book fall open"
              >
                Random
              </button>
            </div>
            <form onSubmit={onJump} className="flex gap-2">
              <label className="sr-only" htmlFor="jump">
                Go to page
              </label>
              <input
                id="jump"
                inputMode="numeric"
                value={jump}
                onChange={(e) => setJump(e.target.value.replace(/\D/g, "").slice(0, 7))}
                placeholder={`Page 1–${latest}`}
                className="border-smoke bg-void text-bone placeholder:text-muted/60 focus:border-ember w-full rounded-lg border px-3 py-1.5 text-sm"
              />
              <button type="submit" className="btn-ghost px-3 py-1.5 text-xs">
                Go
              </button>
            </form>
          </nav>

          <p className="text-muted text-xs">
            Fictional names only. Anything that names a real person, threatens anyone or shares
            personal details will be removed. Use Report on any entry.
          </p>
        </aside>
      </div>

      <SealFlash trigger={flash} reduced={reduced} onDone={() => setFlash(0)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-smoke bg-abyss/70 rounded-lg border py-2">
      <dd className="text-bone font-serif text-2xl">{value.toLocaleString("en-US")}</dd>
      <dt className="text-muted text-[0.65rem] tracking-widest uppercase">{label}</dt>
    </div>
  );
}

function ChapterTitle({ start, end, stats }: { start: number; end: number; stats: PublicStats }) {
  return (
    <div className="flip-page paper-black text-center">
      <p className="mt-6 font-serif text-xs tracking-[0.5em] text-white/50 uppercase">
        The Open Book
      </p>
      <h2 className="font-gothic mt-4 text-5xl text-white">
        Pages {start}
        {end > start && `–${end}`}
      </h2>
      <p
        className="font-scrawl mx-auto mt-10 -rotate-2 text-xl text-white/80"
        style={{ filter: "url(#ink-bleed)" }}
      >
        everyone writes here
      </p>
      <ul className="mx-auto mt-10 max-w-[18rem] space-y-3 text-left font-serif text-sm text-[#d4dadf]">
        <li>I. Anyone may write. Nothing written here can be unwritten by another hand.</li>
        <li>II. Only fictional names. The book rejects real ones and so do its keepers.</li>
        <li>III. Light a candle for a page you like. Report one that should not be here.</li>
      </ul>
      <p className="mt-auto pb-4 font-serif text-xs text-white/50">
        {stats.total.toLocaleString("en-US")} names so far
      </p>
      <PageNumber n="·" side="right" />
    </div>
  );
}

function BlankPage() {
  return (
    <div className="flip-page paper-lines items-center justify-center">
      <p className="text-ink/50 font-serif text-sm italic">The next page is still blank.</p>
    </div>
  );
}
