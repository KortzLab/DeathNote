"use client";

import { useState, useSyncExternalStore } from "react";
import { openReport } from "@/components/public/ReportDialog";
import { openShare } from "@/components/public/ShareDialog";
import { useSound } from "@/components/providers/SoundProvider";
import { lightCandle, tokenFor, withdrawPublic, unshare } from "@/lib/public/client";
import type { TargetType } from "@/lib/public/shared";

const LIT_KEY = "dn:lit";

function readLit(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LIT_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

type Props = {
  type: TargetType;
  id: string;
  candles: number;
  /** Present when the item can be re-shared (public book entries). */
  shareable?: { name: string; cause: string | null; details: string | null; time: string | null };
  onRemoved?: () => void;
  tone?: "paper" | "dark";
};

export function ItemActions({ type, id, candles, shareable, onRemoved, tone = "paper" }: Props) {
  const { play } = useSound();
  const [count, setCount] = useState(candles);
  const [litNow, setLitNow] = useState(false);
  const litBefore = useSyncExternalStore(
    () => () => {},
    () => readLit().includes(id),
    () => false,
  );
  const ownToken = useSyncExternalStore(
    () => () => {},
    () => tokenFor(id),
    () => null,
  );
  const lit = litBefore || litNow;

  async function candle() {
    if (lit) return;
    setLitNow(true);
    setCount((c) => c + 1);
    play("tick", { volume: 0.4, rate: 0.6 });
    try {
      localStorage.setItem(LIT_KEY, JSON.stringify([...readLit(), id].slice(-500)));
    } catch {
      /* ignore */
    }
    const r = await lightCandle(type, id).catch(() => null);
    if (r) setCount(r.candles);
  }

  async function remove() {
    const what =
      type === "public_entry" ? "Withdraw this entry from the open book?" : "Unshare this page?";
    if (!window.confirm(what)) return;
    if (type === "public_entry") await withdrawPublic(id);
    else await unshare(id);
    onRemoved?.();
  }

  const btn =
    tone === "paper"
      ? "font-serif text-[0.7rem] tracking-widest uppercase text-ink/70 hover:text-ink hover:underline"
      : "btn-ghost px-3 py-1.5 text-xs";

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <button
        type="button"
        onClick={() => void candle()}
        aria-pressed={lit}
        aria-label={lit ? `Candle lit, ${count} in total` : `Light a candle, ${count} so far`}
        className={`${btn} inline-flex items-center gap-1`}
      >
        <svg viewBox="0 0 10 16" className="h-3.5 w-2.5" aria-hidden>
          <path
            d="M5 1c2 3 2 5 0 7-2-2-2-4 0-7z"
            fill={lit ? "#ffcf7a" : "currentColor"}
            opacity={lit ? 1 : 0.5}
          />
          <rect x="3" y="8" width="4" height="7" rx="1" fill="currentColor" />
        </svg>
        {count}
      </button>
      {shareable && (
        <button
          type="button"
          className={btn}
          onClick={() => openShare({ ...shareable, source: "public" })}
        >
          Share
        </button>
      )}
      <button type="button" className={btn} onClick={() => openReport(type, id)}>
        Report
      </button>
      {ownToken && (
        <button type="button" className={btn} onClick={() => void remove()}>
          {type === "public_entry" ? "Withdraw" : "Unshare"}
        </button>
      )}
    </div>
  );
}
