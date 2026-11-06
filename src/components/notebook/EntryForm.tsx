"use client";

import { useState, type FormEvent } from "react";
import { InkInput } from "@/components/notebook/InkInput";
import { NOTE_LIMITS } from "@/lib/validation/notes";
import type { NoteDraft, NoteRecord } from "@/lib/notes/types";

type Props = {
  page: number;
  onWrite: (draft: NoteDraft, page: number) => Promise<NoteRecord | null>;
  compact?: boolean;
};

export function EntryForm({ page, onWrite, compact }: Props) {
  const [name, setName] = useState("");
  const [cause, setCause] = useState("");
  const [details, setDetails] = useState("");
  const [time, setTime] = useState("");
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e?: FormEvent) {
    e?.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    const note = await onWrite({ name, cause, details, time }, page);
    setBusy(false);
    if (note) {
      setName("");
      setCause("");
      setDetails("");
      setTime("");
      setMore(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-1" aria-label={`Write on page ${page}`}>
      <InkInput
        label="Name"
        name="name"
        value={name}
        onChange={setName}
        maxLength={NOTE_LIMITS.name}
        size={compact ? "md" : "lg"}
        required
        onEnter={() => void submit()}
        inputClassName="eyes-name"
      />
      <div className="grid gap-x-4 sm:grid-cols-[1fr_auto]">
        <InkInput
          label="Cause"
          name="cause"
          value={cause}
          onChange={setCause}
          maxLength={NOTE_LIMITS.cause}
          size="sm"
          onEnter={() => void submit()}
        />
        {!more && (
          <button
            type="button"
            onClick={() => setMore(true)}
            className="text-ink/60 hover:text-ink-soft self-end pb-1 text-left font-serif text-xs tracking-widest uppercase underline-offset-4 hover:underline"
          >
            + details &amp; time
          </button>
        )}
      </div>
      {more && (
        <>
          <InkInput
            label="Details"
            name="details"
            value={details}
            onChange={setDetails}
            maxLength={NOTE_LIMITS.details}
            size="sm"
            multiline
          />
          <InkInput
            label="Time"
            name="time"
            value={time}
            onChange={setTime}
            maxLength={NOTE_LIMITS.time}
            size="sm"
            onEnter={() => void submit()}
          />
        </>
      )}
      <div className="flex items-center justify-end pt-2">
        <button
          type="submit"
          disabled={!name.trim() || busy}
          className="border-ink/40 text-ink hover:border-ink hover:bg-ink hover:text-bone rounded-full border px-4 py-1.5 font-serif text-sm tracking-widest uppercase transition disabled:opacity-40"
        >
          {busy ? "Writing…" : "Write it"}
        </button>
      </div>
    </form>
  );
}
