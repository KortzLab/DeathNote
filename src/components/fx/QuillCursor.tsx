"use client";

import { useEffect, useRef, useState } from "react";

export function QuillCursor() {
  const [enabled, setEnabled] = useState(false);
  const nib = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(fine.matches && !calm.matches);
    update();
    fine.addEventListener("change", update);
    calm.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      calm.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("quill-cursor");
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    type Dot = { x: number; y: number; r: number; life: number };
    const dots: Dot[] = [];
    let last = { x: -100, y: -100 };
    let raf = 0;
    let visible = false;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const { clientX: x, clientY: y } = e;
      if (nib.current) {
        nib.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        if (!visible) {
          nib.current.style.opacity = "1";
          visible = true;
        }
        const overText = (e.target as HTMLElement | null)?.closest?.(
          "input, textarea, [contenteditable='true']",
        );
        nib.current.style.visibility = overText ? "hidden" : "visible";
      }
      const dist = Math.hypot(x - last.x, y - last.y);
      const steps = Math.min(8, Math.floor(dist / 4));
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        dots.push({
          x: last.x + (x - last.x) * t,
          y: last.y + (y - last.y) * t,
          r: 0.6 + Math.random() * 1.3,
          life: 1,
        });
      }
      if (dots.length > 260) dots.splice(0, dots.length - 260);
      last = { x, y };
    };
    const onLeave = () => {
      if (nib.current) nib.current.style.opacity = "0";
      visible = false;
    };

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = dots.length - 1; i >= 0; i--) {
        const d = dots[i]!;
        d.life -= 0.022;
        if (d.life <= 0) {
          dots.splice(i, 1);
          continue;
        }
        ctx.fillStyle = `rgba(205, 214, 220, ${d.life * 0.28})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y + (1 - d.life) * 3, d.r * (0.6 + d.life * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      root.classList.remove("quill-cursor");
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <canvas
        ref={canvas}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[95] h-full w-full"
      />
      <div
        ref={nib}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[96] opacity-0 transition-opacity duration-300"
        style={{ willChange: "transform" }}
      >
        {/* -translate-y-full puts the nib tip on the hotspot */}
        <svg
          width="34"
          height="34"
          viewBox="0 0 34 34"
          className="-translate-y-full"
          style={{ marginLeft: -2 }}
        >
          <path
            d="M2 32 L8 22 L26 4 C29 1 33 5 30 8 L12 26 Z"
            fill="#e8dfcc"
            stroke="#0c0b0b"
            strokeWidth="1.2"
          />
          <path d="M2 32 L8 22 L12 26 Z" fill="#0b0b0d" />
          <path d="M5 29 L21 13" stroke="#0c0b0b" strokeWidth="0.9" />
          <circle cx="9.5" cy="24.5" r="1.1" fill="#0c0b0b" />
        </svg>
      </div>
    </>
  );
}
