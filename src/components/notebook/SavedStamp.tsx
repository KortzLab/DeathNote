import type { NotebookMode, SaveState } from "@/lib/notes/useNotebook";

const LABEL: Record<SaveState, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  error: "Not saved",
};

const STAMP: Record<SaveState, string> = {
  idle: "border-smoke text-muted opacity-70",
  saving: "border-smoke text-muted opacity-70",
  saved: "border-blood text-blood-bright scale-110",
  error: "border-blood-bright text-blood-bright",
};

export function SavedStamp({ state, mode }: { state: SaveState; mode: NotebookMode }) {
  const label = LABEL[state] || (mode === "account" ? "Synced" : "Kept in this browser");

  return (
    <div className="flex items-center gap-3" role="status" aria-live="polite">
      <span
        aria-hidden
        className={`font-gothic grid h-14 w-14 -rotate-12 place-items-center rounded-full border-2 text-sm transition-all duration-500 ${STAMP[state]}`}
        style={state === "saved" ? { filter: "url(#ink-bleed)" } : undefined}
      >
        {state === "saved" ? "Inked" : "✒"}
      </span>
      <span className="text-muted text-sm">{label}</span>
    </div>
  );
}
