"use client";

import { useEffect, useState } from "react";

export function InkLoader({
  done = false,
  label = "Summoning the notebook",
}: {
  done?: boolean;
  label?: string;
}) {
  const [p, setP] = useState(4);
  useEffect(() => {
    if (done) return;
    const id = setInterval(
      () => setP((v) => Math.min(92, v + (92 - v) * 0.08 + Math.random() * 1.5)),
      120,
    );
    return () => clearInterval(id);
  }, [done]);
  const value = done ? 100 : Math.round(p);

  return (
    <div
      className={`bg-void fixed inset-0 z-40 grid place-items-center transition-opacity duration-700 ${done ? "pointer-events-none opacity-0" : "opacity-100"}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <div className="w-72 text-center">
        <p className="title-ember mb-6 text-4xl">Death Note</p>
        <svg viewBox="0 0 300 24" className="w-full" aria-hidden>
          <defs>
            <clipPath id="ink-progress">
              <path
                d={`M0 0 H${value * 3} q 6 6 0 12 q -6 6 0 12 H0 Z`}
                style={{ transition: "d 0.3s ease" }}
              />
            </clipPath>
            <linearGradient id="ink-fill" x1="0" x2="1">
              <stop offset="0%" stopColor="#1a1c1f" />
              <stop offset="85%" stopColor="#9aa2a8" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
          <rect x="0.5" y="6" width="299" height="12" rx="6" fill="none" stroke="#2b2f34" />
          <g clipPath="url(#ink-progress)" filter="url(#ink-bleed)">
            <rect x="0" y="6" width="300" height="12" rx="6" fill="url(#ink-fill)" />
          </g>
        </svg>
        <p className="text-muted mt-4 font-serif text-sm tracking-[0.3em] uppercase">
          {label}… {value}%
        </p>
      </div>
    </div>
  );
}
