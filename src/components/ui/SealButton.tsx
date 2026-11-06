"use client";

import { forwardRef, useCallback, useRef, useState, type ButtonHTMLAttributes } from "react";
import { useSound } from "@/components/providers/SoundProvider";

type Variant = "seal" | "ghost";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

type Ember = { id: number; x: number; dx: number };

export const SealButton = forwardRef<HTMLButtonElement, Props>(function SealButton(
  { variant = "seal", className = "", children, onMouseEnter, onClick, ...rest },
  ref,
) {
  const { play } = useSound();
  const [embers, setEmbers] = useState<Ember[]>([]);
  const next = useRef(0);

  const spawn = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const batch = Array.from({ length: 5 }, () => ({
      id: next.current++,
      x: 10 + Math.random() * 80,
      dx: (Math.random() - 0.5) * 30,
    }));
    setEmbers((e) => [...e.slice(-10), ...batch]);
    setTimeout(() => setEmbers((e) => e.filter((x) => !batch.includes(x))), 1700);
  }, []);

  return (
    <button
      ref={ref}
      className={`${variant === "seal" ? "btn-seal" : "btn-ghost"} ${className}`}
      onMouseEnter={(e) => {
        spawn();
        play("tick", { volume: 0.25 });
        onMouseEnter?.(e);
      }}
      onClick={(e) => {
        play("tick", { volume: 0.5, rate: 0.7 });
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
      <span aria-hidden className="pointer-events-none absolute inset-0">
        {embers.map((em) => (
          <span
            key={em.id}
            className="ember"
            style={{ left: `${em.x}%`, top: "20%", ["--dx" as string]: `${em.dx}px` }}
          />
        ))}
      </span>
    </button>
  );
});
