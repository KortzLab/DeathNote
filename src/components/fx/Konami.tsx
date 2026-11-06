"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toggleEyes, useEyes } from "@/lib/fx/eyes";
import { useSound } from "@/components/providers/SoundProvider";

const CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function Konami() {
  const eyes = useEyes();
  const { play } = useSound();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = key === CODE[pos] ? pos + 1 : key === CODE[0] ? 1 : 0;
      if (pos === CODE.length) {
        pos = 0;
        toggleEyes();
        play("heartbeat", { volume: 0.8 });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [play]);

  useEffect(() => {
    const msg = eyes ? "Shinigami Eyes awakened. Names reveal their numbers." : null;
    const t = setTimeout(() => setToast(msg), 0);
    const h = setTimeout(() => setToast(null), 3200);
    return () => {
      clearTimeout(t);
      clearTimeout(h);
    };
  }, [eyes]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.p
          role="status"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="border-blood bg-void/90 text-blood-bright fixed bottom-6 left-1/2 z-[97] -translate-x-1/2 rounded-full border px-5 py-2 font-serif text-sm shadow-[0_0_30px_rgba(209,26,31,0.4)]"
        >
          {toast}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
