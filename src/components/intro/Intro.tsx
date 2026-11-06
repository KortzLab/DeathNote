"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { InkLoader } from "@/components/intro/InkLoader";
import { Intro2D } from "@/components/intro/Intro2D";
import { InkLink } from "@/components/ui/InkLink";
import { SealButton } from "@/components/ui/SealButton";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useWebGLTier } from "@/lib/hooks/useWebGLTier";
import { useStoredValue } from "@/lib/hooks/useStoredValue";
import { useSound } from "@/components/providers/SoundProvider";
import type { IntroHandle, Stage } from "@/components/three/IntroScene";
import { SITE } from "@/lib/site";

const IntroScene = dynamic(
  () => import("@/components/three/IntroScene").then((m) => m.IntroScene),
  {
    ssr: false,
    loading: () => <InkLoader />,
  },
);

export function Intro() {
  const reduced = useReducedMotion();
  const tier = useWebGLTier();
  const [lite, setLite] = useStoredValue("dn:lite");
  const { play, loop } = useSound();
  const [stage, setStage] = useState<Stage>("loading");
  const [leaf, setLeaf] = useState({ turned: 0, total: 5 });
  const scene = useRef<IntroHandle>(null);

  const use3D = !reduced && tier !== "pending" && tier !== "none" && lite !== "1";

  useEffect(() => {
    loop("rain", true, 0.18);
    return () => loop("rain", false);
  }, [loop]);

  useEffect(() => {
    if (!use3D) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea")) return;
      if (e.key === "ArrowRight") scene.current?.next();
      if (e.key === "ArrowLeft") scene.current?.prev();
    };
    let last = 0;
    const onWheel = (e: WheelEvent) => {
      if (stage !== "open" || Math.abs(e.deltaY) < 15) return;
      const now = performance.now();
      if (now - last < 1200) return;
      last = now;
      if (e.deltaY > 0) scene.current?.next();
      else scene.current?.prev();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
    };
  }, [stage, use3D]);

  const onLeaf = useCallback((turned: number, total: number) => setLeaf({ turned, total }), []);

  // Reserve the viewport while probing, otherwise the footer jumps (CLS).
  if (tier === "pending")
    return (
      <section className="h-[100dvh]" aria-busy="true">
        <InkLoader />
      </section>
    );

  if (!use3D) {
    return (
      <Intro2D
        calm={reduced}
        onUse3D={tier !== "none" && !reduced && lite === "1" ? () => setLite(null) : undefined}
      />
    );
  }

  const atEnd = leaf.turned >= leaf.total;

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden" aria-labelledby="intro-title">
      <div className="absolute inset-0">
        <IntroScene
          ref={scene}
          onStage={setStage}
          onLeaf={onLeaf}
          play={play}
          lowPower={tier === "low"}
        />
      </div>
      <InkLoader done={stage !== "loading"} />

      <h1 id="intro-title" className="sr-only">
        Death Note, the cursed notebook
      </h1>

      <div className="pointer-events-none absolute inset-x-0 top-20 text-center">
        <p
          className={`text-muted font-serif text-sm tracking-[0.35em] uppercase transition-opacity duration-1000 ${stage === "landed" || stage === "open" ? "opacity-100" : "opacity-0"}`}
        >
          {SITE.tagline}
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-4 px-4 text-center">
        {stage === "landed" && (
          <>
            <p className="text-muted animate-pulse font-serif italic" aria-live="polite">
              Click or drag the cover to open it.
            </p>
            <SealButton onClick={() => scene.current?.open()}>Open the notebook</SealButton>
          </>
        )}
        {stage === "open" && (
          <>
            <p className="text-muted font-serif text-sm italic" aria-live="polite">
              Drag, click a page or use ← → to turn. {atEnd ? "The last page is yours." : ""}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => scene.current?.prev()}
                disabled={leaf.turned === 0}
                aria-label="Previous page"
              >
                ‹ Back
              </button>
              <InkLink href="/notebook" className={`btn-seal ${atEnd ? "scale-110" : ""}`}>
                Write in the notebook
              </InkLink>
              <InkLink href="/rules" className="btn-ghost">
                Read the rules
              </InkLink>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => scene.current?.next()}
                disabled={atEnd}
                aria-label="Next page"
              >
                Turn ›
              </button>
            </div>
          </>
        )}
        <div className="text-muted flex gap-4 text-xs">
          <InkLink href="/notebook" className="hover:text-bone">
            Skip the intro
          </InkLink>
          <button type="button" onClick={() => setLite("1")} className="hover:text-bone">
            Lighter version
          </button>
        </div>
      </div>
    </section>
  );
}
