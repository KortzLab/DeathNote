"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LAUGH_EVENT } from "@/components/fx/AppleEgg";
import { useEyes } from "@/lib/fx/eyes";

export function Shinigami() {
  const pathname = usePathname();
  const eyesMode = useEyes();
  const [visible, setVisible] = useState(false);
  const [laughing, setLaughing] = useState(false);
  const [side, setSide] = useState<"left" | "right">("right");
  const pupils = useRef<SVGGElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let hide: ReturnType<typeof setTimeout>;
    let show: ReturnType<typeof setTimeout>;
    const cycle = () => {
      setSide(Math.random() > 0.5 ? "right" : "left");
      setVisible(true);
      hide = setTimeout(() => setVisible(false), 7000 + Math.random() * 4000);
      show = setTimeout(cycle, 32000 + Math.random() * 30000);
    };
    show = setTimeout(cycle, 9000 + Math.random() * 8000);
    return () => {
      clearTimeout(hide);
      clearTimeout(show);
    };
  }, [pathname]);

  useEffect(() => {
    const onLaugh = () => {
      setVisible(true);
      setLaughing(true);
      setTimeout(() => setLaughing(false), 1600);
    };
    window.addEventListener(LAUGH_EVENT, onLaugh);
    return () => window.removeEventListener(LAUGH_EVENT, onLaugh);
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = root.current;
      const p = pupils.current;
      if (!el || !p) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width * 0.5;
      const cy = r.top + r.height * 0.24;
      const a = Math.atan2(e.clientY - cy, e.clientX - cx);
      const d = Math.min(1, Math.hypot(e.clientX - cx, e.clientY - cy) / 400);
      p.setAttribute("transform", `translate(${Math.cos(a) * 2.6 * d} ${Math.sin(a) * 2 * d})`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const show = visible || eyesMode;

  return (
    <div
      ref={root}
      aria-hidden
      className={`pointer-events-none fixed bottom-0 z-0 h-[78vh] w-[42vh] transition-all duration-[2500ms] ease-out ${side === "right" ? "right-[4vw]" : "left-[4vw]"} ${show ? "translate-y-0 opacity-70" : "translate-y-12 opacity-0"}`}
      style={{ filter: "blur(0.6px)" }}
    >
      <svg
        viewBox="0 0 200 380"
        className={`h-full w-full ${laughing ? "animate-[shake_0.18s_ease-in-out_8]" : ""}`}
      >
        <defs>
          <radialGradient id="shini-body" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#141012" />
            <stop offset="100%" stopColor="#050304" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="shini-eye" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff2c2" />
            <stop offset="35%" stopColor="#ff3b2f" />
            <stop offset="100%" stopColor="#ff3b2f" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          d="M100 120 C60 90 20 70 4 40 C14 80 8 110 24 140 C10 150 6 175 14 200 C30 180 50 170 70 172 Z"
          fill="#0a0809"
          opacity="0.85"
        />
        <path
          d="M100 120 C140 90 180 70 196 40 C186 80 192 110 176 140 C190 150 194 175 186 200 C170 180 150 170 130 172 Z"
          fill="#0a0809"
          opacity="0.85"
        />
        <path
          d="M70 58 L62 18 L78 50 L82 8 L92 46 L100 2 L108 46 L118 8 L122 50 L138 18 L130 58 Z"
          fill="#0d0a0b"
        />
        <path d="M66 60 C66 30 134 30 134 60 L136 100 C124 116 76 116 64 100 Z" fill="#0b0809" />
        <path
          d="M64 100 C40 140 46 220 30 380 L170 380 C154 220 160 140 136 100 C120 118 80 118 64 100 Z"
          fill="url(#shini-body)"
        />
        <path
          d="M30 380 L42 340 L54 380 L66 330 L80 380 L96 336 L110 380 L124 332 L140 380 L154 344 L170 380 Z"
          fill="#050304"
        />
        <path
          d="M60 140 C40 190 36 230 44 268 L48 300 M44 268 L38 300 M44 268 L54 296"
          stroke="#0b0809"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M140 140 C160 190 164 230 156 268 L152 300 M156 268 L162 300 M156 268 L146 296"
          stroke="#0b0809"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <g>
          <ellipse cx="86" cy="78" rx="11" ry="8" fill="url(#shini-eye)" opacity={show ? 1 : 0} />
          <ellipse cx="114" cy="78" rx="11" ry="8" fill="url(#shini-eye)" opacity={show ? 1 : 0} />
          <g ref={pupils}>
            <circle cx="86" cy="78" r="2.4" fill="#1a0000" />
            <circle cx="114" cy="78" r="2.4" fill="#1a0000" />
          </g>
        </g>
        {/* Grin (wider when laughing) */}
        <path
          d={laughing ? "M80 96 Q100 116 120 96 Q100 106 80 96 Z" : "M84 98 Q100 106 116 98"}
          stroke="#7a1010"
          strokeWidth="1.6"
          fill={laughing ? "#2a0000" : "none"}
        />
      </svg>
      {laughing && (
        <p className="font-scrawl text-blood-bright absolute top-[8%] left-1/2 -translate-x-1/2 text-xl whitespace-nowrap">
          heh… heh heh.
        </p>
      )}
    </div>
  );
}
