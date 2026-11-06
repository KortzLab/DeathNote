"use client";

import { useState } from "react";
import { useStoredValue } from "@/lib/hooks/useStoredValue";
import { IMPORT_DISMISSED_KEY } from "@/lib/notes/types";

type Props = {
  count: number;
  onImport: () => Promise<{ imported: number; skipped: number }>;
};

export function ImportPrompt({ count, onImport }: Props) {
  const [dismissed, setDismissed] = useStoredValue(IMPORT_DISMISSED_KEY);
  const [message, setMessage] = useState<string | null>(null);

  async function importNotes() {
    try {
      const { imported, skipped } = await onImport();
      const names = `${imported} name${imported === 1 ? "" : "s"}`;
      setMessage(
        `${names} moved into your notebook.` +
          (skipped ? ` ${skipped} could not be imported.` : ""),
      );
      setDismissed("1");
    } catch (e) {
      setMessage((e as Error).message);
    }
  }

  if (message) {
    return (
      <p role="status" className="text-gold text-center text-sm">
        {message}
      </p>
    );
  }
  if (count === 0 || dismissed === "1") return null;

  return (
    <div
      role="dialog"
      aria-labelledby="import-title"
      className="border-gold/40 bg-abyss/90 rounded-xl border p-4 text-sm"
    >
      <p id="import-title" className="text-bone font-serif">
        This browser still holds {count} guest {count === 1 ? "entry" : "entries"}. Bind them to
        your account?
      </p>
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          className="btn-seal px-4 py-1.5 text-sm"
          onClick={() => void importNotes()}
        >
          Import them
        </button>
        <button
          type="button"
          className="btn-ghost px-4 py-1.5 text-sm"
          onClick={() => setDismissed("1")}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
