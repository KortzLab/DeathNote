"use client";

import { EntryForm } from "@/components/notebook/EntryForm";
import { NoteEntry } from "@/components/notebook/NoteEntry";
import { PageNumber } from "@/components/notebook/BookPages";
import { ENTRIES_PER_PAGE, type NoteDraft, type NoteRecord } from "@/lib/notes/types";

type Props = {
  number: number;
  side: "left" | "right";
  notes: NoteRecord[];
  freshIds: Set<string>;
  onWrite: (draft: NoteDraft, page: number) => Promise<NoteRecord | null>;
  onSeal: (id: string) => void;
  onUpdate: (id: string, patch: Partial<NoteDraft>) => void;
  onDelete: (id: string) => void;
  onSealFlash: () => void;
  compact?: boolean;
};

export function WritingPage({
  number,
  side,
  notes,
  freshIds,
  onWrite,
  compact,
  ...handlers
}: Props) {
  const canWrite = notes.length < ENTRIES_PER_PAGE;
  return (
    <section className="flip-page paper-lines" aria-label={`Notebook page ${number}`}>
      <div className="bg-ink/15 absolute top-0 bottom-0 left-8 w-px" aria-hidden />
      <div className="flex-1 overflow-y-auto pt-3 pr-1 pl-2" data-scroll>
        {notes.length === 0 && (
          <p className="text-ink/70 pt-2 font-serif text-sm italic">
            {number === 1 ? "The first page waits. Write a name." : "A fresh page."}
          </p>
        )}
        <ol className="space-y-2">
          {notes.map((n) => (
            <NoteEntry key={n.id} note={n} fresh={freshIds.has(n.id)} {...handlers} />
          ))}
        </ol>
        {canWrite && (
          <div className="mt-4">
            <EntryForm page={number} onWrite={onWrite} compact={compact} />
          </div>
        )}
      </div>
      <PageNumber n={number} side={side} />
    </section>
  );
}
