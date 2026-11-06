"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { FlipBook, type FlipBookHandle } from "@/components/notebook/FlipBook";
import { Endpaper, RulesPage, TitlePage, TocPage, Verso } from "@/components/notebook/BookPages";
import { WritingPage } from "@/components/notebook/WritingPage";
import { Candle } from "@/components/notebook/Candle";
import { SavedStamp } from "@/components/notebook/SavedStamp";
import { SearchPanel } from "@/components/notebook/SearchPanel";
import { ExportPanel } from "@/components/notebook/ExportPanel";
import { ImportPrompt } from "@/components/notebook/ImportPrompt";
import { SealFlash } from "@/components/notebook/SealFlash";
import { AppleEgg } from "@/components/fx/AppleEgg";
import { InkLink } from "@/components/ui/InkLink";
import { useNotebook } from "@/lib/notes/useNotebook";
import {
  RULES_PER_PAGE,
  bookLayout,
  groupByPage,
  rulePageIndex,
  tableOfContents,
} from "@/lib/notes/layout";
import { useIdle } from "@/lib/hooks/useIdle";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import type { NoteDraft } from "@/lib/notes/types";
import { RULES } from "@/content/rules";
import { SITE } from "@/lib/site";

const rules = RULES.en;

export function NotebookApp() {
  const nb = useNotebook();
  const { data: session } = useSession();
  const single = useMediaQuery("(max-width: 899px)");
  const reduced = useReducedMotion();
  const idle = useIdle(25_000);
  const book = useRef<FlipBookHandle>(null);
  const [freshIds, setFreshIds] = useState<Set<string>>(() => new Set());
  const [flash, setFlash] = useState(0);

  const byPage = useMemo(() => groupByPage(nb.notes), [nb.notes]);
  const layout = bookLayout(byPage, rules.length);

  const { create } = nb;
  const onWrite = useCallback(
    async (draft: NoteDraft, page: number) => {
      const note = await create(draft, page);
      if (note) setFreshIds((ids) => new Set(ids).add(note.id));
      return note;
    },
    [create],
  );
  const onSealFlash = useCallback(() => setFlash((n) => n + 1), []);
  const goTo = useCallback((index: number) => book.current?.goToPage(index), []);

  const side = (index: number) => (single || index % 2 === 0 ? "right" : "left");
  const owner = session?.user?.name || session?.user?.email?.split("@")[0] || "a wandering guest";

  const pages: React.ReactNode[] = [
    <TitlePage key="title" owner={owner} />,
    <TocPage key="toc" entries={tableOfContents(rules, layout)} onGo={goTo} />,
  ];
  for (let i = 0; i < layout.rulePages; i++) {
    const last = i === layout.rulePages - 1;
    pages.push(
      <RulesPage
        key={`rules-${i}`}
        rules={rules.slice(i * RULES_PER_PAGE, (i + 1) * RULES_PER_PAGE)}
        number={rulePageIndex(i) + 1}
        side={side(rulePageIndex(i))}
        heading={i === 0}
        extra={
          last && (
            <div className="flex justify-end pr-4">
              <AppleEgg />
            </div>
          )
        }
      />,
    );
  }
  for (let page = 1; page <= layout.writingPages; page++) {
    pages.push(
      <WritingPage
        key={`write-${page}`}
        number={page}
        side={side(layout.firstWritingIndex + page - 1)}
        notes={byPage.get(page) ?? []}
        freshIds={freshIds}
        onWrite={onWrite}
        onSeal={nb.seal}
        onUpdate={nb.update}
        onDelete={(id) => void nb.remove(id)}
        onSealFlash={onSealFlash}
        compact={single}
      />,
    );
  }

  const latest = layout.writingPages;
  const exportNotes = byPage.get(latest) ?? byPage.get(latest - 1) ?? [];

  return (
    <div className="relative mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6">
      <div className="mx-auto mb-6 max-w-3xl space-y-3">
        {nb.mode === "guest" && (
          <p className="border-smoke bg-abyss/70 text-muted rounded-xl border px-4 py-3 text-center text-sm">
            Your notes live only in this browser.{" "}
            <InkLink
              href="/signin?callbackUrl=/notebook"
              className="text-ember underline-offset-4 hover:underline"
            >
              Sign in to keep them forever.
            </InkLink>
          </p>
        )}
        {nb.mode === "account" && (
          <ImportPrompt count={nb.guestNotes.length} onImport={nb.importGuest} />
        )}
      </div>

      <div className="relative grid items-start gap-10 xl:grid-cols-[1fr_17rem]">
        <div className={single ? "px-2" : "px-12"}>
          {nb.ready ? (
            <FlipBook
              ref={book}
              key={single ? "single" : "spread"}
              pages={pages}
              single={single}
              reducedMotion={reduced}
              endpaper={<Endpaper />}
              verso={<Verso />}
              initialPage={layout.currentWritingIndex}
              idle={idle}
              ribbonPage={layout.currentWritingIndex}
            />
          ) : (
            <BookSkeleton />
          )}
        </div>

        <aside aria-label="Notebook tools" className="mx-auto w-full max-w-sm space-y-6 xl:pt-4">
          <Candle className="mx-auto hidden h-36 w-16 xl:block" />
          <SavedStamp state={nb.saveState} mode={nb.mode} />
          {nb.error && (
            <p
              role="alert"
              className="border-blood/60 bg-blood/10 text-bone rounded-lg border px-3 py-2 text-sm"
            >
              {nb.error}{" "}
              <button type="button" onClick={nb.clearError} className="text-muted ml-2 underline">
                dismiss
              </button>
            </p>
          )}
          <SearchPanel
            notes={nb.notes}
            onPick={(page) => goTo(layout.firstWritingIndex + page - 1)}
          />
          <ExportPanel page={latest} notes={exportNotes} />
          <p className="text-muted text-xs italic">{SITE.safety}</p>
          <p className="text-muted hidden text-xs md:block">
            Tip: drag a page corner, use ← → or the mouse wheel to turn pages.
          </p>
        </aside>
      </div>

      <SealFlash trigger={flash} reduced={reduced} onDone={() => setFlash(0)} />
    </div>
  );
}

function BookSkeleton() {
  return (
    <div
      className="border-smoke bg-abyss mx-auto grid h-[70vh] max-w-3xl place-items-center rounded-lg border"
      role="status"
    >
      <div className="w-48">
        <p className="text-muted mb-3 text-center font-serif text-sm">Opening the notebook…</p>
        <div className="bg-smoke h-1.5 overflow-hidden rounded-full">
          <div className="bg-bone/60 h-full w-1/2 animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
}
