"use client";

import { useEffect, useId, useRef, useState } from "react";
import { PaperCard } from "@/components/public/PaperCard";
import { SealButton } from "@/components/ui/SealButton";
import { useStoredValue } from "@/lib/hooks/useStoredValue";
import { PEN_NAME_KEY, sharePage, type Draft } from "@/lib/public/client";

type ShareRequest = Draft & { source: "notebook" | "public" };

const OPEN = "dn:share-open";

export function openShare(note: ShareRequest) {
  window.dispatchEvent(new CustomEvent<ShareRequest>(OPEN, { detail: note }));
}

export function ShareDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [note, setNote] = useState<ShareRequest | null>(null);
  const [penName, setPenName] = useStoredValue(PEN_NAME_KEY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shared, setShared] = useState<{ id: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onOpen = (e: Event) => {
      setNote((e as CustomEvent<ShareRequest>).detail);
      setShared(null);
      setError(null);
      setCopied(false);
      dialog.current?.showModal();
    };
    window.addEventListener(OPEN, onOpen);
    return () => window.removeEventListener(OPEN, onOpen);
  }, []);

  async function publish() {
    if (!note) return;
    setBusy(true);
    setError(null);
    try {
      setShared(await sharePage({ ...note, penName: penName || null }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!shared) return;
    await navigator.clipboard.writeText(shared.url).catch(() => {});
    setCopied(true);
  }

  async function nativeShare() {
    if (!shared) return;
    await navigator
      .share?.({ title: "A page from the Death Note", url: shared.url })
      .catch(() => {});
  }

  const close = () => dialog.current?.close();

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      className="sponsor-dialog border-smoke bg-abyss text-bone m-auto w-[min(520px,calc(100vw-24px))] rounded-2xl border p-0 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      onClick={(e) => e.target === dialog.current && close()}
    >
      <div className="max-h-[90dvh] space-y-5 overflow-y-auto p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="title-ember text-3xl">
            {shared ? "The page is out" : "Share this page"}
          </h2>
          <button
            type="button"
            onClick={close}
            className="btn-ghost h-9 w-9 shrink-0 p-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {note && (
          <PaperCard
            note={{
              name: note.name,
              cause: note.cause ?? null,
              details: note.details ?? null,
              time: note.time ?? null,
              penName: penName || null,
            }}
          />
        )}

        {!shared ? (
          <>
            <label className="block text-sm">
              <span className="text-muted mb-1 block">Sign as (optional)</span>
              <input
                value={penName ?? ""}
                onChange={(e) => setPenName(e.target.value.slice(0, 40) || null)}
                placeholder="A pen name, never your real one"
                className="border-smoke bg-void text-bone placeholder:text-muted/60 focus:border-ember w-full rounded-lg border px-3 py-2"
              />
            </label>
            <p className="text-muted text-xs">
              Shared pages appear on the home page for everyone. Fictional names only: pages that
              name real people get removed.
            </p>
            {error && (
              <p role="alert" className="text-blood-bright text-sm">
                {error}
              </p>
            )}
            <SealButton onClick={() => void publish()} disabled={busy} className="w-full">
              {busy ? "Tearing out the page…" : "Publish this page"}
            </SealButton>
          </>
        ) : (
          <div className="space-y-3">
            <div className="border-smoke bg-void flex items-center gap-2 rounded-lg border p-2">
              <input
                readOnly
                value={shared.url}
                aria-label="Share link"
                className="text-bone min-w-0 flex-1 bg-transparent px-1 text-sm outline-none"
                onFocus={(e) => e.currentTarget.select()}
              />
              <button
                type="button"
                onClick={() => void copy()}
                className="btn-ghost px-3 py-1 text-xs"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  type="button"
                  onClick={() => void nativeShare()}
                  className="btn-ghost px-3 py-1.5 text-sm"
                >
                  Share…
                </button>
              )}
              <a
                className="btn-ghost px-3 py-1.5 text-sm"
                target="_blank"
                rel="noopener"
                href={`https://x.com/intent/post?url=${encodeURIComponent(shared.url)}&text=${encodeURIComponent("A page from the Death Note")}`}
              >
                Post on X
              </a>
              <a href={`/n/${shared.id}`} className="btn-seal px-4 py-1.5 text-sm">
                Open the page
              </a>
            </div>
            <p className="text-muted text-xs">You can unshare it from that page in this browser.</p>
          </div>
        )}
      </div>
    </dialog>
  );
}
