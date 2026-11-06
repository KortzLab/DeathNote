"use client";

import { useState } from "react";
import type { NoteRecord } from "@/lib/notes/types";

type Format = "png" | "pdf" | "share";

const BUTTONS: Array<[Format, string]> = [
  ["png", "Image"],
  ["pdf", "PDF"],
  ["share", "Share"],
];

export function ExportPanel({ page, notes }: { page: number; notes: NoteRecord[] }) {
  const [blurNames, setBlurNames] = useState(true);
  const [busy, setBusy] = useState(false);

  async function run(format: Format) {
    setBusy(true);
    try {
      // Loaded on demand: the canvas/PDF code is not needed until someone exports.
      const { exportPng, exportPdf, sharePage } = await import("@/lib/notes/export");
      const opts = { page, blurNames };
      if (format === "png") await exportPng(notes, opts);
      else if (format === "pdf") await exportPdf(notes, opts);
      else await sharePage(notes, opts);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-muted text-xs tracking-widest uppercase">Export the latest page</p>
      <label className="text-muted flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={blurNames}
          onChange={(e) => setBlurNames(e.target.checked)}
          className="accent-blood"
        />
        Blur the names
      </label>
      <div className="flex flex-wrap gap-2">
        {BUTTONS.map(([format, label]) => (
          <button
            key={format}
            type="button"
            disabled={busy}
            onClick={() => void run(format)}
            className="btn-ghost px-3 py-1.5 text-sm"
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-muted text-xs">
        Shared pages are images you create on purpose. Nothing is published.
      </p>
    </div>
  );
}
