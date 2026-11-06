"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { InkText } from "@/components/notebook/InkText";
import { InkInput } from "@/components/notebook/InkInput";
import { CountdownRing } from "@/components/notebook/CountdownRing";
import { NOTE_LIMITS } from "@/lib/validation/notes";
import { lifespanFor, useEyes } from "@/lib/fx/eyes";
import { useSound } from "@/components/providers/SoundProvider";
import type { NoteDraft, NoteRecord } from "@/lib/notes/types";

const SEAL_SECONDS = 40;

type Props = {
  note: NoteRecord;
  fresh: boolean;
  onSeal: (id: string) => void;
  onUpdate: (id: string, patch: Partial<NoteDraft>) => void;
  onDelete: (id: string) => void;
  onSealFlash: () => void;
};

export const NoteEntry = memo(function NoteEntry({
  note,
  fresh,
  onSeal,
  onUpdate,
  onDelete,
  onSealFlash,
}: Props) {
  const eyes = useEyes();
  const { play } = useSound();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<NoteDraft>({
    name: note.name,
    cause: note.cause ?? "",
    details: note.details ?? "",
    time: note.time ?? "",
  });
  const started = Date.parse(note.createdAt);
  const [counting] = useState(() => !note.sealedAt && Date.now() - started < SEAL_SECONDS * 1000);
  const [drips] = useState(() =>
    fresh
      ? Array.from({ length: 2 }, () => ({
          left: 10 + Math.random() * 70,
          delay: Math.random() * 1.5,
        }))
      : [],
  );

  // Timer ran out while the tab was closed: seal without the flash.
  useEffect(() => {
    if (!note.sealedAt && !counting) onSeal(note.id);
  }, [counting, note.id, note.sealedAt, onSeal]);

  const complete = useCallback(() => {
    onSeal(note.id);
    onSealFlash();
    play("heartbeat", { volume: 0.8 });
  }, [note.id, onSeal, onSealFlash, play]);

  function change(field: keyof NoteDraft, value: string) {
    const next = { ...draft, [field]: value };
    setDraft(next);
    if (field === "name" && !value.trim()) return;
    onUpdate(note.id, { [field]: value });
  }

  const sealed = Boolean(note.sealedAt);

  if (editing) {
    return (
      <li className="bg-ink/[0.03] rounded-md p-2">
        <InkInput
          label="Name"
          value={draft.name}
          onChange={(v) => change("name", v)}
          maxLength={NOTE_LIMITS.name}
          size="md"
          required
        />
        <InkInput
          label="Cause"
          value={draft.cause ?? ""}
          onChange={(v) => change("cause", v)}
          maxLength={NOTE_LIMITS.cause}
          size="sm"
        />
        <InkInput
          label="Details"
          value={draft.details ?? ""}
          onChange={(v) => change("details", v)}
          maxLength={NOTE_LIMITS.details}
          size="sm"
          multiline
        />
        <InkInput
          label="Time"
          value={draft.time ?? ""}
          onChange={(v) => change("time", v)}
          maxLength={NOTE_LIMITS.time}
          size="sm"
        />
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-ink/70 hover:text-ink-soft font-serif text-xs tracking-widest uppercase hover:underline"
          >
            Done
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="group relative py-1" data-testid="note">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-hand relative text-3xl leading-[2.25rem]">
            {eyes && (
              <span
                aria-hidden
                className="text-blood-bright absolute -top-4 left-0 font-serif text-xs tracking-[0.3em]"
                style={{ animation: "ink-in 0.6s both" }}
              >
                {lifespanFor(note.name)}
              </span>
            )}
            <InkText
              text={note.name}
              animate={fresh}
              stagger={0.07}
              className={`eyes-name ${sealed ? "ink-sealed" : ""} transition-[color,text-shadow] duration-1000`}
            />
            {drips.map((d, i) => (
              <span
                key={i}
                aria-hidden
                className="ink-drip"
                style={{ left: `${d.left}%`, top: "80%", animationDelay: `${0.8 + d.delay}s` }}
              />
            ))}
          </p>
          {(note.cause || note.time) && (
            <p className="font-hand text-ink-soft text-xl leading-7">
              <InkText
                text={[note.cause, note.time].filter(Boolean).join(" — ")}
                animate={fresh}
                stagger={0.03}
                className={sealed ? "ink-sealed" : ""}
              />
            </p>
          )}
          {note.details && (
            <p className="font-hand text-ink-soft/90 text-lg leading-6">
              <InkText text={note.details} animate={fresh} stagger={0.01} />
            </p>
          )}
        </div>

        {counting && !sealed && (
          <CountdownRing startedAt={started} seconds={SEAL_SECONDS} onComplete={complete} />
        )}

        <div className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-ink/60 hover:text-ink-soft rounded px-1 font-serif text-[0.65rem] tracking-widest uppercase hover:underline focus-visible:opacity-100"
            aria-label={`Edit entry for ${note.name}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Tear this entry out of the notebook?")) onDelete(note.id);
            }}
            className="text-ink/60 hover:text-ink-soft rounded px-1 font-serif text-[0.65rem] tracking-widest uppercase hover:underline"
            aria-label={`Delete entry for ${note.name}`}
          >
            Tear
          </button>
        </div>
      </div>
    </li>
  );
});
