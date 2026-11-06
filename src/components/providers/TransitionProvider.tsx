"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useSound } from "@/components/providers/SoundProvider";

type Phase = "idle" | "cover" | "reveal";
type Point = { x: number; y: number };

const TransitionContext = createContext<{ navigate: (href: string, from?: Point) => void }>({
  navigate: () => {},
});

const COVER_MS = 650;

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const { play } = useSound();
  const [phase, setPhase] = useState<Phase>("idle");
  const [origin, setOrigin] = useState<Point>({ x: 50, y: 50 });
  const pending = useRef<string | null>(null);
  const fallback = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useCallback(
    (href: string, from?: Point) => {
      if (phase !== "idle") return;
      const target = new URL(href, window.location.href);
      if (
        target.pathname === window.location.pathname &&
        target.search === window.location.search
      ) {
        if (target.hash) router.push(href);
        return;
      }
      const vw = window.innerWidth || 1;
      const vh = window.innerHeight || 1;
      setOrigin(from ? { x: (from.x / vw) * 100, y: (from.y / vh) * 100 } : { x: 50, y: 50 });
      pending.current = target.pathname;
      setPhase("cover");
      play("rustle", { volume: 0.4, rate: 0.8 });
      setTimeout(() => router.push(href), reduced ? 150 : COVER_MS);
      fallback.current = setTimeout(() => setPhase("reveal"), 4000);
    },
    [phase, play, reduced, router],
  );

  useEffect(() => {
    if (phase === "cover" && pending.current && pathname === pending.current) {
      pending.current = null;
      if (fallback.current) clearTimeout(fallback.current);
      const t = setTimeout(() => setPhase("reveal"), 80);
      return () => clearTimeout(t);
    }
  }, [pathname, phase]);

  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => setPhase("idle"), reduced ? 200 : 750);
    return () => clearTimeout(t);
  }, [phase, reduced]);

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <AnimatePresence>
        {phase !== "idle" && (
          <motion.div
            key="ink"
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[90]"
            initial={
              reduced
                ? { opacity: 0 }
                : { clipPath: `circle(0% at ${origin.x}% ${origin.y}%)`, opacity: 1 }
            }
            animate={
              reduced
                ? { opacity: phase === "cover" ? 1 : 0 }
                : phase === "cover"
                  ? { clipPath: `circle(150% at ${origin.x}% ${origin.y}%)`, opacity: 1 }
                  : { opacity: 0, filter: "blur(6px)" }
            }
            exit={{ opacity: 0 }}
            transition={{
              duration: reduced ? 0.15 : phase === "cover" ? COVER_MS / 1000 : 0.7,
              ease: [0.7, 0, 0.3, 1],
            }}
            style={{
              background: "radial-gradient(circle at 50% 50%, #0b0708 0%, #050304 60%, #000 100%)",
              filter: reduced ? undefined : "url(#ink-edge)",
            }}
          />
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}

export function useInkNavigate() {
  return useContext(TransitionContext).navigate;
}
