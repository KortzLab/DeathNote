"use client";

import { useState } from "react";
import type { NoteRecord } from "@/lib/notes/types";

type Props = {
  notes: NoteRecord[];
  onPick: (page: number) => void;
};

export function SearchPanel({ notes, onPick }: Props) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const results = q
    ? notes.filter((n) =>
        [n.name, n.cause, n.details, n.time].some((f) => f?.toLowerCase().includes(q)),
      )
    : [];

  return (
    <div>
      <label htmlFor="search" className="text-muted mb-1 block text-xs tracking-widest uppercase">
        Search your names
      </label>
      <input
        id="search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value.slice(0, 80))}
        placeholder="A name, a cause…"
        className="border-smoke bg-void text-bone placeholder:text-muted/60 focus:border-ember w-full rounded-lg border px-3 py-2"
      />
      {q && (
        <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto text-sm" aria-live="polite">
          {results.length === 0 && <li className="text-muted">No such name in the notebook.</li>}
          {results.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                className="hover:bg-smoke w-full rounded px-2 py-1 text-left"
                onClick={() => onPick(n.page)}
              >
                <span className="font-hand text-bone text-xl">{n.name}</span>{" "}
                <span className="text-muted">· page {n.page}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
