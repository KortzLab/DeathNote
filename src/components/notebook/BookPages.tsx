"use client";

import { Sigil } from "@/components/ui/Sigil";
import { InkText } from "@/components/notebook/InkText";
import type { Rule } from "@/content/rules";
import type { TocEntry } from "@/lib/notes/layout";

export function PageNumber({ n, side }: { n: number | string; side: "left" | "right" }) {
  return (
    <span aria-hidden className={`flip-page-num ${side === "left" ? "left-6" : "right-6"}`}>
      {n}
    </span>
  );
}

export function Endpaper() {
  return (
    <div className="flip-page items-center justify-center text-center">
      <Sigil className="text-ink/10 h-40 w-40" />
      <p className="text-ink/70 mt-8 max-w-[16rem] font-serif text-sm italic">
        Should this notebook find you, it has already decided to stay.
      </p>
    </div>
  );
}

export function Verso() {
  return (
    <div className="flip-page" aria-hidden>
      <div className="bg-ink/[0.04] m-auto h-24 w-24 rounded-full blur-xl" />
    </div>
  );
}

export function TitlePage({ owner }: { owner: string }) {
  return (
    <div className="flip-page text-center">
      <p className="text-ink/70 mt-6 font-serif text-xs tracking-[0.5em] uppercase">Volume I</p>
      <h2 className="font-gothic text-ink mt-4 text-6xl">Death Note</h2>
      <p
        className="font-scrawl text-ink mx-auto mt-10 -rotate-3 text-2xl"
        style={{ filter: "url(#ink-bleed)" }}
      >
        How to use it
      </p>
      <div className="mt-auto space-y-2 pb-6 text-left">
        <p className="text-ink/60 font-serif text-xs tracking-[0.3em] uppercase">
          This notebook belongs to
        </p>
        <p className="border-ink/30 font-hand text-ink border-b pb-1 text-3xl">
          <InkText text={owner} />
        </p>
      </div>
      <PageNumber n="i" side="right" />
    </div>
  );
}

export function TocPage({
  entries,
  onGo,
}: {
  entries: TocEntry[];
  onGo: (target: number) => void;
}) {
  return (
    <div className="flip-page">
      <h2 className="font-scrawl text-ink text-2xl" style={{ filter: "url(#ink-bleed)" }}>
        Contents
      </h2>
      <ol className="mt-6 space-y-3" data-scroll>
        {entries.map((e) => (
          <li key={e.label}>
            <button
              type="button"
              onClick={() => onGo(e.target)}
              className="group font-hand text-ink hover:text-ink-soft flex w-full items-baseline gap-2 text-left text-2xl"
            >
              <span>{e.label}</span>
              <span
                aria-hidden
                className="border-ink/40 group-hover:border-ink mb-1 flex-1 border-b border-dotted"
              />
              <span className="text-xl">{e.hint}</span>
            </button>
          </li>
        ))}
      </ol>
      <PageNumber n="ii" side="left" />
    </div>
  );
}

export function RulesPage({
  rules,
  number,
  side,
  heading,
  extra,
}: {
  rules: Rule[];
  number: number;
  side: "left" | "right";
  heading?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flip-page paper-black">
      {heading && (
        <h2
          className="font-scrawl mb-3 -rotate-2 text-2xl text-white"
          style={{ filter: "url(#ink-bleed)" }}
        >
          How to use it
        </h2>
      )}
      <ol className="flex-1 space-y-4 overflow-y-auto pr-1" data-scroll>
        {rules.map((r) => (
          <li key={r.numeral}>
            <p className="font-gothic text-xl text-white">{r.numeral}.</p>
            <p className="font-serif text-[0.95rem] leading-snug text-[#d9dee2]">{r.body}</p>
          </li>
        ))}
      </ol>
      {extra}
      <PageNumber n={number} side={side} />
    </div>
  );
}
