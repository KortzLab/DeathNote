"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { SealButton } from "@/components/ui/SealButton";
import {
  CHARITY_SHARE,
  MOST_CHOSEN,
  RECOMMENDED_AMOUNTS,
  SPONSOR_MAX,
  SPONSOR_MIN,
  charityCents,
  formatUsd,
  sponsorSchema,
  toCents,
} from "@/lib/validation/sponsor";

export const SPONSOR_OPEN_EVENT = "dn:sponsor-open";

export function openSponsor() {
  window.dispatchEvent(new Event(SPONSOR_OPEN_EVENT));
}

export function SponsorModal() {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [selected, setSelected] = useState<number | "custom">(MOST_CHOSEN);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [showPublicly, setShowPublicly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const open = () => {
      setError(null);
      dialog.current?.showModal();
    };
    window.addEventListener(SPONSOR_OPEN_EVENT, open);
    return () => window.removeEventListener(SPONSOR_OPEN_EVENT, open);
  }, []);

  const amountInput = selected === "custom" ? custom : String(selected);
  const cents = toCents(amountInput || "0");
  const validCents =
    cents !== null && cents >= SPONSOR_MIN * 100 && cents <= SPONSOR_MAX * 100 ? cents : null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = sponsorSchema.safeParse({ amount: amountInput, name, message, showPublicly });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/sponsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInput, name, message, showPublicly }),
      });
      const data = (await res.json().catch(() => ({}))) as { paymentUrl?: string; error?: string };
      if (!res.ok || !data.paymentUrl) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      window.location.assign(data.paymentUrl);
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      className="sponsor-dialog border-smoke bg-abyss text-bone m-auto w-[min(560px,calc(100vw-24px))] rounded-2xl border p-0 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === dialog.current) dialog.current?.close();
      }}
    >
      <form
        onSubmit={submit}
        className="max-h-[90dvh] space-y-5 overflow-y-auto p-6 sm:p-8"
        data-testid="sponsor-form"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="title-ember text-4xl">
              Feed the notebook
            </h2>
            <p className="text-muted mt-2 text-sm">
              This site is free. If it made your day a little darker (in a good way), consider a
              small contribution.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="btn-ghost h-9 w-9 shrink-0 p-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="border-gold/40 bg-gold/5 rounded-xl border p-4">
          <p className="text-gold font-serif text-lg">
            From this sponsor amount, {Math.round(CHARITY_SHARE * 100)}% will go to charity.
          </p>
        </div>

        <fieldset>
          <legend className="text-muted mb-2 text-xs tracking-widest uppercase">
            Choose an amount
          </legend>
          <div className="flex flex-wrap gap-2">
            {RECOMMENDED_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={selected === a}
                onClick={() => setSelected(a)}
                className={`relative rounded-full border px-4 py-2 font-serif transition ${
                  selected === a
                    ? "border-blood-bright bg-blood/30 text-bone shadow-[0_0_20px_rgba(209,26,31,0.35)]"
                    : "border-smoke text-muted hover:border-ember hover:text-bone"
                }`}
              >
                ${a}
                {a === MOST_CHOSEN && (
                  <span className="bg-gold text-void absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-1.5 py-px font-sans text-[0.6rem] whitespace-nowrap uppercase">
                    Most chosen
                  </span>
                )}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={selected === "custom"}
              onClick={() => setSelected("custom")}
              className={`rounded-full border px-4 py-2 font-serif transition ${
                selected === "custom"
                  ? "border-blood-bright bg-blood/30 text-bone"
                  : "border-smoke text-muted hover:border-ember"
              }`}
            >
              Custom
            </button>
          </div>
          {selected === "custom" && (
            <label className="mt-3 block">
              <span className="sr-only">Custom amount in US dollars</span>
              <span className="border-smoke bg-void focus-within:border-ember flex items-center rounded-lg border">
                <span className="text-muted pl-3">$</span>
                <input
                  autoFocus
                  inputMode="decimal"
                  name="custom-amount"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value.replace(/[^0-9.]/g, "").slice(0, 9))}
                  placeholder={`${SPONSOR_MIN} – ${SPONSOR_MAX.toLocaleString("en-US")}`}
                  className="text-bone w-full bg-transparent px-2 py-2 outline-none"
                  aria-describedby="amount-help"
                />
              </span>
              <span id="amount-help" className="text-muted mt-1 block text-xs">
                Between ${SPONSOR_MIN} and ${SPONSOR_MAX.toLocaleString("en-US")}, up to 2 decimals.
              </span>
            </label>
          )}
        </fieldset>

        <p
          className="bg-void/60 rounded-lg px-4 py-3 text-center font-serif"
          aria-live="polite"
          data-testid="split"
        >
          {validCents ? (
            <>
              You give <strong className="text-bone">{formatUsd(validCents)}</strong> →{" "}
              <strong className="text-gold">{formatUsd(charityCents(validCents))}</strong> goes to
              charity
            </>
          ) : (
            <span className="text-muted">Enter an amount to see the split.</span>
          )}
        </p>

        <div className="space-y-3">
          <p className="text-muted text-xs tracking-widest uppercase">
            Leave a mark in the notebook (optional)
          </p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 60))}
            placeholder="Your name or alias"
            aria-label="Your name or alias"
            className="border-smoke bg-void text-bone placeholder:text-muted/60 focus:border-ember w-full rounded-lg border px-3 py-2"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 280))}
            placeholder="A message"
            aria-label="A message"
            rows={2}
            className="border-smoke bg-void text-bone placeholder:text-muted/60 focus:border-ember w-full resize-none rounded-lg border px-3 py-2"
          />
          <label className="text-muted flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showPublicly}
              onChange={(e) => setShowPublicly(e.target.checked)}
              className="accent-blood"
            />
            Show me on the supporters page
          </label>
        </div>

        {error && (
          <p role="alert" className="text-blood-bright text-sm">
            {error}
          </p>
        )}

        <SealButton type="submit" className="w-full" disabled={busy || !validCents}>
          {busy
            ? "Opening the gateway…"
            : validCents
              ? `Sponsor ${formatUsd(validCents)} with crypto`
              : "Sponsor"}
        </SealButton>
        <p className="text-muted text-center text-xs">
          Payments are processed by OxaPay. You will be redirected to complete the payment.
        </p>
      </form>
    </dialog>
  );
}
