"use client";

import { useSound } from "@/components/providers/SoundProvider";

export function SoundToggle() {
  const { enabled, toggle } = useSound();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Mute sound" : "Enable sound"}
      title={enabled ? "Mute sound" : "Enable sound"}
      className="btn-ghost h-9 w-9 p-0"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        aria-hidden
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" stroke="none" />
        {enabled ? (
          <>
            <path d="M16 9a4 4 0 0 1 0 6" strokeLinecap="round" />
            <path d="M18.5 6.5a7.5 7.5 0 0 1 0 11" strokeLinecap="round" />
          </>
        ) : (
          <path d="M16 9l5 6M21 9l-5 6" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}
