"use client";

import { useEffect, useState, type PointerEvent } from "react";
import { motion, useAnimationControls } from "motion/react";
import { InkLink } from "@/components/ui/InkLink";
import { SealButton } from "@/components/ui/SealButton";
import { useSound } from "@/components/providers/SoundProvider";
import { SITE } from "@/lib/site";

type Props = { calm: boolean; onUse3D?: () => void };

const DUST = Array.from({ length: 22 }, (_, i) => {
  const r = (n: number) => (((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1) + 1) % 1;
  return {
    dx: (i % 2 === 0 ? 1 : -1) * (60 + r(1) * 200),
    dy: -10 - r(2) * 40,
    dur: 1.4 + r(3) * 0.6,
  };
});

export function Intro2D({ calm, onUse3D }: Props) {
  const { play } = useSound();
  const book = useAnimationControls();
  const stageCtl = useAnimationControls();
  const [landed, setLanded] = useState(calm);
  const [open, setOpen] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [dust, setDust] = useState(false);

  useEffect(() => {
    if (calm) return;
    let cancelled = false;
    void (async () => {
      await book.start({
        y: 0,
        rotate: -4,
        transition: { duration: 2.4, ease: [0.5, 0, 0.9, 0.6] },
      });
      if (cancelled) return;
      play("thud", { volume: 0.9 });
      setDust(true);
      void stageCtl.start({
        x: [0, -8, 7, -5, 3, 0],
        y: [0, 5, -4, 3, -1, 0],
        transition: { duration: 0.5 },
      });
      await book.start({
        y: [0, -14, 0],
        rotate: [-4, -2, -3],
        transition: { duration: 0.45, ease: "easeOut" },
      });
      if (!cancelled) setLanded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [book, calm, play, stageCtl]);

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (calm || open || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({
      x: ((e.clientY - r.top) / r.height - 0.5) * -14,
      y: ((e.clientX - r.left) / r.width - 0.5) * 18,
    });
  }

  function toggleOpen() {
    if (!landed) return;
    setOpen((o) => !o);
    play(open ? "thud" : "creak", { volume: 0.6 });
  }

  return (
    <section
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 pt-20 pb-16"
      aria-labelledby="intro-title"
    >
      <h1 id="intro-title" className="sr-only">
        Death Note, the cursed notebook
      </h1>
      <p
        className={`text-muted mb-8 text-center font-serif text-sm tracking-[0.35em] uppercase transition-opacity duration-1000 ${landed ? "opacity-100" : "opacity-0"}`}
      >
        {SITE.tagline}
      </p>

      <motion.div
        animate={stageCtl}
        className="relative"
        onPointerMove={onMove}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      >
        <motion.div
          initial={calm ? { opacity: 0, y: 0 } : { y: "-120vh", rotate: 18 }}
          animate={calm ? { opacity: 1, transition: { duration: 1.2 } } : book}
          className="relative"
          style={{ perspective: 1600 }}
        >
          <div
            className="relative h-[min(62vh,440px)] w-[min(72vw,310px)] transition-transform duration-300 ease-out"
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            <div className="paper absolute inset-0 flex flex-col rounded-r-md p-6">
              <p
                className="font-scrawl text-ink -rotate-2 text-xl"
                style={{ filter: "url(#ink-bleed)" }}
              >
                How to use it
              </p>
              <p className="text-ink mt-4 font-serif text-sm leading-snug">
                Whosoever has their true name set down in these pages, while the hand that writes
                holds their face in mind…
              </p>
              <div className="mt-auto flex flex-col gap-2">
                <InkLink href="/notebook" className="btn-seal text-sm" tabIndex={open ? 0 : -1}>
                  Write in it
                </InkLink>
                <InkLink
                  href="/rules"
                  className="text-ink text-center font-serif text-sm underline-offset-4 hover:underline"
                  tabIndex={open ? 0 : -1}
                >
                  Read every rule
                </InkLink>
              </div>
            </div>

            {/* Cover on a hinge */}
            <button
              type="button"
              onClick={toggleOpen}
              aria-expanded={open}
              aria-label={open ? "Close the notebook" : "Open the notebook"}
              className="absolute inset-0 origin-left rounded-r-md"
              style={{
                transform: `rotateY(${open ? -158 : 0}deg)`,
                transition: calm ? "opacity .4s" : "transform 1.6s cubic-bezier(.6,.02,.2,1)",
                transformStyle: "preserve-3d",
                opacity: calm && open ? 0 : 1,
              }}
            >
              <span
                className="absolute inset-0 grid place-items-center rounded-r-md"
                style={{
                  backfaceVisibility: "hidden",
                  background:
                    "radial-gradient(ellipse at 35% 25%, rgba(255,255,255,0.06), transparent 55%), linear-gradient(135deg, #1b1617, #070606)",
                  boxShadow:
                    "inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 30px rgba(0,0,0,0.9), 0 30px 60px -20px #000",
                }}
              >
                <span className="title-ember px-4 text-center text-5xl leading-tight">
                  Death Note
                </span>
                <span
                  className="absolute inset-3 rounded border border-dashed border-white/10"
                  aria-hidden
                />
              </span>
              <span
                className="paper absolute inset-0 rounded-l-md"
                style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                aria-hidden
              />
            </button>
          </div>
        </motion.div>

        {dust && (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-2 h-10">
            {DUST.map((d, i) => (
              <motion.span
                key={i}
                className="absolute bottom-0 left-1/2 h-6 w-6 rounded-full bg-[#5a524a]/40 blur-md"
                initial={{ x: 0, y: 0, opacity: 0.9, scale: 0.4 }}
                animate={{ x: d.dx, y: d.dy, opacity: 0, scale: 2 }}
                transition={{ duration: d.dur, ease: "easeOut" }}
              />
            ))}
          </div>
        )}
      </motion.div>

      <div
        className={`mt-10 flex flex-col items-center gap-3 transition-opacity duration-700 ${landed ? "opacity-100" : "opacity-0"}`}
      >
        {!open && (
          <SealButton onClick={toggleOpen} disabled={!landed}>
            Open the notebook
          </SealButton>
        )}
        <div className="text-muted flex gap-4 text-xs">
          <InkLink href="/notebook" className="hover:text-bone">
            Skip the intro
          </InkLink>
          {onUse3D && (
            <button type="button" onClick={onUse3D} className="hover:text-bone">
              Full 3D version
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
