"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { report } from "@/lib/public/client";
import { REPORT_REASONS, type ReportReason, type TargetType } from "@/lib/public/shared";

type Target = { type: TargetType; id: string };
const OPEN = "dn:report-open";

export function openReport(type: TargetType, id: string) {
  window.dispatchEvent(new CustomEvent<Target>(OPEN, { detail: { type, id } }));
}

export function ReportDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [target, setTarget] = useState<Target | null>(null);
  const [reason, setReason] = useState<ReportReason>("real-person");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      setTarget((e as CustomEvent<Target>).detail);
      setState("idle");
      setError(null);
      dialog.current?.showModal();
    };
    window.addEventListener(OPEN, onOpen);
    return () => window.removeEventListener(OPEN, onOpen);
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!target) return;
    setState("busy");
    try {
      await report(target.type, target.id, reason);
      setState("done");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      className="sponsor-dialog border-smoke bg-abyss text-bone m-auto w-[min(420px,calc(100vw-24px))] rounded-2xl border p-0 backdrop:bg-black/70"
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
    >
      {state === "done" ? (
        <div className="space-y-4 p-6">
          <h2 id={titleId} className="font-serif text-xl">
            Thank you
          </h2>
          <p className="text-muted text-sm">
            We will look at it. Pages reported by several people are hidden until reviewed.
          </p>
          <button type="button" className="btn-ghost" onClick={() => dialog.current?.close()}>
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4 p-6">
          <h2 id={titleId} className="font-serif text-xl">
            Report this page
          </h2>
          <fieldset className="space-y-2">
            <legend className="sr-only">Reason</legend>
            {(Object.entries(REPORT_REASONS) as Array<[ReportReason, string]>).map(
              ([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="reason"
                    value={key}
                    checked={reason === key}
                    onChange={() => setReason(key)}
                    className="accent-blood"
                  />
                  {label}
                </label>
              ),
            )}
          </fieldset>
          {error && (
            <p role="alert" className="text-blood-bright text-sm">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              className="btn-seal px-4 py-1.5 text-sm"
              disabled={state === "busy"}
            >
              Send report
            </button>
            <button
              type="button"
              className="btn-ghost px-4 py-1.5 text-sm"
              onClick={() => dialog.current?.close()}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
