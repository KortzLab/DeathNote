"use client";

import { useInkNavigate } from "@/components/providers/TransitionProvider";
import { useSound } from "@/components/providers/SoundProvider";

export const LAUGH_EVENT = "dn:laugh";

export function AppleEgg({ className = "" }: { className?: string }) {
  const navigate = useInkNavigate();
  const { play } = useSound();
  return (
    <button
      type="button"
      data-no-flip
      aria-label="A red apple. Offer it?"
      title="…an apple?"
      className={`group inline-block transition-transform hover:scale-110 hover:-rotate-12 ${className}`}
      onClick={(e) => {
        play("laugh", { volume: 0.7 });
        window.dispatchEvent(new Event(LAUGH_EVENT));
        const point = { x: e.clientX, y: e.clientY };
        setTimeout(() => navigate("/secret", point), 1400);
      }}
    >
      <svg viewBox="0 0 32 36" className="h-7 w-7 drop-shadow" aria-hidden>
        <path d="M16 9c-2-5 1-8 4-8-1 3-2 5-4 8z" fill="#3c5a1e" />
        <path
          d="M16 9c0-3-1-5-3-6"
          stroke="#3a2412"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M16 11c-4-3-12-2-13 7-1 8 5 17 9 17 2 0 3-1 4-1s2 1 4 1c4 0 10-9 9-17-1-9-9-10-13-7z"
          fill="#a3141a"
        />
        <path
          d="M8 15c-2 2-2 6-1 8"
          stroke="#ff8a7a"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
          opacity=".6"
        />
      </svg>
    </button>
  );
}
