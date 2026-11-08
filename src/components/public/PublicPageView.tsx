"use client";

import { useState } from "react";
import { EntryForm } from "@/components/notebook/EntryForm";
import { InkText } from "@/components/notebook/InkText";
import { CountdownRing } from "@/components/notebook/CountdownRing";
import { PageNumber } from "@/components/notebook/BookPages";
import { ItemActions } from "@/components/public/ItemActions";
import { useSound } from "@/components/providers/SoundProvider";
import { invalidatePage, usePublicPage, writePublic } from "@/lib/public/client";
import { lifespanFor, useEyes } from "@/lib/fx/eyes";
import { PUBLIC_PAGE_SIZE } from "@/lib/public/shared";
import type { NoteDraft } from "@/lib/notes/types";

type Props = {
  page: number;
  side: "left" | "right";
  writable: boolean;
  penName: string | null;
  freshIds: Set<string>;
  onWritten: (id: string) => void;
  onSeal: () => void;
};

export function PublicPageView({
  page,
  side,
  writable,
  penName,
  freshIds,
  onWritten,
  onSeal,
}: Props) {
  const entries = usePublicPage(page);
  const eyes = useEyes();
  const { play } = useSound();
  const [error, setError] = useState<string | null>(null);

  async function write(draft: NoteDraft) {
    setError(null);
    try {
      const id = await writePublic({ ...draft, penName });
      onWritten(id);
      invalidatePage(page);
      return id;
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }

  const canWrite = writable && entries !== null && entries.length < PUBLIC_PAGE_SIZE;

  return (
    <section className="flip-page paper-lines" aria-label={`Open book, page ${page}`}>
      <div className="bg-ink/15 absolute top-0 bottom-0 left-8 w-px" aria-hidden />
      <div className="flex-1 overflow-y-auto pt-3 pr-1 pl-2" data-scroll>
        {entries === null && <p className="text-ink/50 font-serif text-sm italic">Turning…</p>}
        {entries?.length === 0 && !writable && (
          <p className="text-ink/60 font-serif text-sm italic">This page was torn out.</p>
        )}

        <ol className="space-y-3">
          {entries?.map((e) => {
            const fresh = freshIds.has(e.id);
            const sub = [e.cause, e.time].filter(Boolean).join(" — ");
            return (
              <li key={e.id} className="group" data-testid="public-entry">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-hand relative text-3xl leading-[2.25rem]">
                      {eyes && e.name && (
                        <span
                          aria-hidden
                          className="text-blood-bright absolute -top-4 left-0 font-serif text-xs tracking-[0.3em]"
                        >
                          {lifespanFor(e.name)}
                        </span>
                      )}
                      <InkText
                        text={e.name ?? ""}
                        animate={fresh}
                        stagger={0.07}
                        className="eyes-name"
                      />
                    </p>
                    {sub && (
                      <p className="font-hand text-ink-soft text-xl leading-7">
                        <InkText text={sub} animate={fresh} stagger={0.03} />
                      </p>
                    )}
                    {e.details && (
                      <p className="font-hand text-ink-soft/90 text-lg leading-6">{e.details}</p>
                    )}
                    {e.penName && (
                      <p className="text-ink/60 font-serif text-[0.65rem] tracking-widest uppercase">
                        — {e.penName}
                      </p>
                    )}
                  </div>
                  {fresh && (
                    <CountdownRing
                      startedAt={Date.parse(e.createdAt)}
                      onComplete={() => {
                        play("heartbeat", { volume: 0.8 });
                        onSeal();
                      }}
                    />
                  )}
                </div>
                <div className="mt-1 opacity-70 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                  <ItemActions
                    type="public_entry"
                    id={e.id}
                    candles={e.candles}
                    shareable={
                      e.name
                        ? { name: e.name, cause: e.cause, details: e.details, time: e.time }
                        : undefined
                    }
                    onRemoved={() => invalidatePage(page)}
                  />
                </div>
              </li>
            );
          })}
        </ol>

        {canWrite && (
          <div className="mt-4">
            <EntryForm page={page} onWrite={write} />
            {error && (
              <p role="alert" className="text-blood mt-2 font-serif text-sm">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
      <PageNumber n={page} side={side} />
    </section>
  );
}
