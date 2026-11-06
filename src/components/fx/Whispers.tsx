"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const FRAGMENTS = [
  "…write it…",
  "a name for the ledger",
  "forty seconds",
  "it is watching the margins",
  "who held it before you?",
  "the ink remembers",
  "turn the page",
  "do you see its face?",
  "something is hungry",
  "the candle leans toward you",
  "not yet… not yet…",
  "apples. it wants apples.",
];

type Whisper = { id: number; text: string; side: "left" | "right"; top: number };

export function Whispers() {
  const pathname = usePathname();
  const [items, setItems] = useState<Whisper[]>([]);

  useEffect(() => {
    let id = 0;
    let timer: ReturnType<typeof setTimeout>;
    const spawn = () => {
      const w: Whisper = {
        id: id++,
        text: FRAGMENTS[Math.floor(Math.random() * FRAGMENTS.length)] ?? "",
        side: Math.random() > 0.5 ? "left" : "right",
        top: 18 + Math.random() * 64,
      };
      setItems((prev) => [...prev.slice(-2), w]);
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== w.id)), 7000);
      timer = setTimeout(spawn, 9000 + Math.random() * 9000);
    };
    timer = setTimeout(spawn, 5000);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[5] hidden overflow-hidden lg:block"
    >
      {items.map((w) => (
        <span
          key={w.id}
          className="whisper font-scrawl text-bone/40 absolute text-sm"
          style={{
            top: `${w.top}%`,
            [w.side]: "1.5vw",
            writingMode: "vertical-rl",
            transform: w.side === "left" ? "rotate(180deg)" : undefined,
          }}
        >
          {w.text}
        </span>
      ))}
    </div>
  );
}
