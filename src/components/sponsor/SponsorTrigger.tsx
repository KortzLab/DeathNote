"use client";

import { openSponsor } from "@/components/sponsor/SponsorModal";

function AppleSeal({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 36" className={className} aria-hidden>
      <path d="M16 9c-2-5 1-8 4-8-1 3-2 5-4 8z" fill="#3c5a1e" />
      <path
        d="M16 11c-4-3-12-2-13 7-1 8 5 17 9 17 2 0 3-1 4-1s2 1 4 1c4 0 10-9 9-17-1-9-9-10-13-7z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SponsorTrigger({ variant }: { variant: "header" | "floating" }) {
  if (variant === "header") {
    return (
      <button
        type="button"
        onClick={openSponsor}
        className="btn-ghost hidden gap-1.5 px-3 py-1.5 text-xs sm:inline-flex"
      >
        <AppleSeal className="text-blood-bright h-3.5 w-3.5" />
        Sponsor
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={openSponsor}
      aria-label="Sponsor the project (70% goes to charity)"
      title="Sponsor (70% to charity)"
      className="no-print group fixed right-5 bottom-5 z-[60] grid h-14 w-14 place-items-center rounded-full transition-transform hover:scale-110 active:scale-95"
      style={{
        background: "radial-gradient(circle at 35% 30%, #c3262b, #8f0f12 50%, #4f0507)",
        boxShadow:
          "inset 0 2px 3px rgba(255,200,190,.3), inset 0 -4px 8px rgba(0,0,0,.55), 0 10px 30px rgba(143,15,18,.45)",
      }}
    >
      <span
        aria-hidden
        className="absolute inset-1 rounded-full border border-dashed border-white/20 transition-transform duration-700 group-hover:rotate-90"
      />
      <AppleSeal className="h-6 w-6 text-[#2a0204] drop-shadow-[0_1px_0_rgba(255,180,170,0.4)]" />
    </button>
  );
}
