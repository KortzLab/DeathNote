"use client";

import { useEffect, useEffectEvent, type RefObject } from "react";
import type * as THREE from "three";
import gsap from "gsap";

/** Occasional double-flash on the ambient light, with `onStrike` for the thunder. */
export function useLightning(light: RefObject<THREE.AmbientLight | null>, onStrike: () => void) {
  const strikeSound = useEffectEvent(onStrike);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const strike = () => {
      const a = light.current;
      if (a) {
        gsap
          .timeline()
          .to(a, { intensity: 2.2, duration: 0.05 })
          .to(a, { intensity: 0.25, duration: 0.15 })
          .to(a, { intensity: 1.4, duration: 0.05 })
          .to(a, { intensity: 0.25, duration: 0.6 });
        // light travels faster than sound
        setTimeout(strikeSound, 400);
      }
      timer = setTimeout(strike, 14_000 + Math.random() * 12_000);
    };
    timer = setTimeout(strike, 7_000);
    return () => clearTimeout(timer);
  }, [light]);
}

type Gesture = { kind: "tap"; x: number } | { kind: "swipe"; dx: number };

/**
 * Taps and horizontal swipes that start on the canvas. Listens on window so a drag that
 * leaves the canvas still ends cleanly.
 */
export function useCanvasGestures(onGesture: (g: Gesture) => void, swipeThreshold = 40) {
  const handle = useEffectEvent(onGesture);

  useEffect(() => {
    let startX: number | null = null;
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).tagName === "CANVAS") startX = e.clientX;
    };
    const onUp = (e: PointerEvent) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      handle(Math.abs(dx) > swipeThreshold ? { kind: "swipe", dx } : { kind: "tap", x: e.clientX });
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [swipeThreshold]);
}
