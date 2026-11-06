"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** epoch ms */
  startedAt: number;
  seconds?: number;
  onComplete: () => void;
  size?: number;
};

export function CountdownRing({ startedAt, seconds = 40, onComplete, size = 44 }: Props) {
  const [now, setNow] = useState(() => Date.now());
  const done = useRef(false);
  const callback = useRef(onComplete);
  useEffect(() => {
    callback.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (!done.current && t - startedAt >= seconds * 1000) {
        done.current = true;
        clearInterval(id);
        callback.current();
      }
    }, 100);
    return () => clearInterval(id);
  }, [seconds, startedAt]);

  const elapsed = Math.min(seconds, (now - startedAt) / 1000);
  const remaining = Math.max(0, Math.ceil(seconds - elapsed));
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const progress = elapsed / seconds;
  const urgent = remaining <= 10;

  return (
    <span
      className="relative inline-grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
      role="timer"
      aria-live="off"
      aria-label={`${remaining} seconds until the ink sets`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(20,16,18,0.18)"
          strokeWidth="3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={urgent ? "#8f0f12" : "#2b2326"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * progress}
          style={{ transition: "stroke-dashoffset 0.1s linear, stroke 0.4s" }}
        />
      </svg>
      <span
        aria-hidden
        className={`font-hand absolute text-lg leading-none font-bold ${urgent ? "text-blood animate-pulse" : "text-ink"}`}
      >
        {remaining}
      </span>
    </span>
  );
}
