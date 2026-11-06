"use client";

import { useEffect, useRef } from "react";
import { TYPING_EVENT } from "@/lib/fx/eyes";

// Driven from rAF via refs so typing never re-renders the component.
export function Candle({ className = "" }: { className?: string }) {
  const flame = useRef<SVGGElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let energy = 0;
    let raf = 0;
    let t = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onType = () => {
      energy = Math.min(1, energy + 0.18);
    };
    window.addEventListener(TYPING_EVENT, onType);

    const tick = () => {
      t += 0.016;
      energy *= 0.965;
      const wobble = reduce ? 0 : 1;
      const sway =
        (Math.sin(t * 3.1) * 2 + Math.sin(t * 7.3) * 1.2) * (0.4 + energy * 2.2) * wobble;
      const stretch = 1 + (Math.sin(t * 11) * 0.04 + energy * 0.35) * wobble;
      if (flame.current) {
        flame.current.setAttribute(
          "transform",
          `translate(30 44) rotate(${sway}) scale(${1 - energy * 0.08} ${stretch}) translate(-30 -44)`,
        );
      }
      if (glow.current) {
        glow.current.style.opacity = String(0.55 + Math.sin(t * 9) * 0.05 * wobble + energy * 0.3);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener(TYPING_EVENT, onType);
    };
  }, []);

  return (
    <div className={`pointer-events-none relative ${className}`} aria-hidden>
      <div
        ref={glow}
        className="absolute -inset-16 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(255,226,180,0.22), rgba(200,210,220,0.05) 45%, transparent 70%)",
        }}
      />
      <svg viewBox="0 0 60 140" className="relative h-full w-full">
        <defs>
          <radialGradient id="flame-core" cx="50%" cy="70%" r="60%">
            <stop offset="0%" stopColor="#fffbe6" />
            <stop offset="35%" stopColor="#ffd27a" />
            <stop offset="75%" stopColor="#ff6a2b" />
            <stop offset="100%" stopColor="#ff6a2b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="wax" x1="0" x2="1">
            <stop offset="0%" stopColor="#bfb39c" />
            <stop offset="45%" stopColor="#efe6d2" />
            <stop offset="100%" stopColor="#a39780" />
          </linearGradient>
        </defs>
        <g ref={flame}>
          <path
            d="M30 8 C38 22 40 32 36 40 C34 44 26 44 24 40 C20 32 22 22 30 8Z"
            fill="url(#flame-core)"
          />
          <ellipse cx="30" cy="38" rx="3" ry="5" fill="#3a6bd1" opacity="0.5" />
        </g>
        <line x1="30" y1="40" x2="30" y2="50" stroke="#1a1414" strokeWidth="1.6" />
        <path d="M18 50 H42 V132 H18 Z" fill="url(#wax)" />
        <path d="M18 50 C20 58 24 54 25 62 C26 68 28 60 30 56 C33 64 35 58 42 50Z" fill="#f4ecdb" />
        <path d="M37 52 C38 62 39 70 37 76 C36 70 35 62 35 54Z" fill="#e6dcc6" />
        <ellipse cx="30" cy="133" rx="20" ry="4" fill="#2a2321" />
      </svg>
    </div>
  );
}
