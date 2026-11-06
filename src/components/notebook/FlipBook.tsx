"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSound } from "@/components/providers/SoundProvider";

export type FlipBookHandle = {
  next: () => void;
  prev: () => void;
  goToPage: (pageIndex: number) => void;
};

type Props = {
  pages: ReactNode[];
  single: boolean;
  reducedMotion: boolean;
  /** left page before the first turn (spread mode only) */
  endpaper: ReactNode;
  /** back of each leaf in single-page mode */
  verso: ReactNode;
  onTurn?: (turned: number) => void;
  initialPage?: number;
  idle?: boolean;
  ribbonPage?: number;
};

const INTERACTIVE = "input, textarea, button, a, select, label, [role='button'], [data-no-flip]";

export const FlipBook = forwardRef<FlipBookHandle, Props>(function FlipBook(
  { pages, single, reducedMotion, endpaper, verso, onTurn, initialPage = 0, idle, ribbonPage },
  ref,
) {
  const { play } = useSound();
  const leafCount = single ? pages.length : Math.ceil(pages.length / 2);
  const leafForPage = useCallback((p: number) => (single ? p : Math.floor((p + 1) / 2)), [single]);

  const [turned, setTurned] = useState(() => Math.min(leafForPage(initialPage), leafCount));
  const turnedRef = useRef(turned);
  const leaves = useRef<Array<HTMLDivElement | null>>([]);
  const root = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    leaf: number;
    dir: 1 | -1;
    startX: number;
    startY: number;
    active: boolean;
    angle: number;
    lastX: number;
    lastT: number;
    vx: number;
    pointerId: number;
  } | null>(null);

  const clampTurned = Math.min(turned, leafCount);

  const paint = useCallback((i: number, angle: number, transition = "none") => {
    const el = leaves.current[i];
    if (!el) return;
    const p = Math.abs(angle) / 180;
    const bend = Math.sin(p * Math.PI);
    el.style.transition = transition;
    el.style.transform = `rotateY(${angle}deg)`;
    el.style.setProperty("--bend", bend.toFixed(3));
    el.style.setProperty("--p", p.toFixed(3));
    if (shadow.current) {
      shadow.current.style.opacity = transition === "none" ? String(bend * 0.9) : "0";
      shadow.current.style.transition = transition === "none" ? "none" : "opacity .5s";
    }
  }, []);

  const layout = useCallback(
    (t: number, animated: boolean, movedLeaf?: number) => {
      for (let i = 0; i < leafCount; i++) {
        const el = leaves.current[i];
        if (!el) continue;
        const isTurned = i < t;
        const distance = movedLeaf === undefined ? 0 : Math.abs(i - movedLeaf);
        const delay = animated && !reducedMotion ? Math.min(distance, 8) * 0.05 : 0;
        const dur = reducedMotion ? 0.25 : 0.75;
        paint(
          i,
          isTurned ? -180 : 0,
          animated ? `transform ${dur}s cubic-bezier(.45,.05,.2,1) ${delay}s` : "none",
        );
        el.style.zIndex = String(isTurned ? i + 1 : leafCount - i + 1);
        if (single) {
          // Turned pages leave the stage once their animation has finished.
          if (!isTurned) el.style.visibility = "visible";
          else if (animated && i === movedLeaf) {
            el.style.visibility = "visible";
            setTimeout(
              () => {
                if (i < turnedRef.current) el.style.visibility = "hidden";
              },
              (dur + delay) * 1000 + 50,
            );
          } else el.style.visibility = "hidden";
        }
      }
    },
    [leafCount, paint, reducedMotion, single],
  );

  // Snap into place on mount and when the structure changes; turns animate via turnTo.
  const snapLayout = useEffectEvent(() => layout(Math.min(turnedRef.current, leafCount), false));
  useEffect(() => snapLayout(), [leafCount, single]);

  const turnTo = useCallback(
    (target: number, fromLeaf?: number) => {
      const t = Math.max(0, Math.min(leafCount, target));
      if (t === turnedRef.current) return;
      const moved = fromLeaf ?? (t > turnedRef.current ? turnedRef.current : t);
      const el = leaves.current[moved];
      if (el) el.style.zIndex = String(leafCount + 5);
      if (single && el) el.style.visibility = "visible";
      turnedRef.current = t;
      setTurned(t);
      requestAnimationFrame(() => layout(t, true, moved));
      play("rustle", { volume: 0.5, rate: 0.85 + Math.random() * 0.3 });
      onTurn?.(t);
    },
    [layout, leafCount, onTurn, play, single],
  );

  const next = useCallback(() => turnTo(turnedRef.current + 1), [turnTo]);
  const prev = useCallback(() => turnTo(turnedRef.current - 1), [turnTo]);

  useImperativeHandle(
    ref,
    () => ({ next, prev, goToPage: (p: number) => turnTo(leafForPage(p)) }),
    [leafForPage, next, prev, turnTo],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let last = 0;
    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      // Let scrollable page content scroll first.
      const scroller = target.closest("[data-scroll]") as HTMLElement | null;
      if (scroller && scroller.scrollHeight > scroller.clientHeight + 2) {
        const atEnd = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
        const atStart = scroller.scrollTop <= 0;
        if ((e.deltaY > 0 && !atEnd) || (e.deltaY < 0 && !atStart)) return;
      }
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 12) return;
      e.preventDefault();
      const now = performance.now();
      if (now - last < 700) return;
      last = now;
      if (delta > 0) next();
      else prev();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [next, prev]);

  function angleFor(clientX: number): number {
    const box = root.current?.getBoundingClientRect();
    if (!box) return 0;
    if (single) {
      const x = (clientX - box.left) / box.width; // 0..1 across the page
      return -Math.acos(Math.max(-1, Math.min(1, x * 2 - 1))) * (180 / Math.PI);
    }
    const spine = box.left + box.width / 2;
    const half = box.width / 2;
    const x = (clientX - spine) / half; // -1..1
    return -Math.acos(Math.max(-1, Math.min(1, x))) * (180 / Math.PI);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== 0 || (e.target as HTMLElement).closest(INTERACTIVE)) return;
    const box = root.current?.getBoundingClientRect();
    if (!box) return;
    const t = turnedRef.current;
    const onRight = single
      ? e.clientX > box.left + box.width * 0.35
      : e.clientX > box.left + box.width / 2;
    const forward = single ? onRight : onRight;
    if (forward && t >= leafCount) return;
    if (!forward && t <= 0) return;
    drag.current = {
      leaf: forward ? t : t - 1,
      dir: forward ? 1 : -1,
      startX: e.clientX,
      startY: e.clientY,
      active: false,
      angle: forward ? 0 : -180,
      lastX: e.clientX,
      lastT: performance.now(),
      vx: 0,
      pointerId: e.pointerId,
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.active) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      d.active = true;
      root.current?.setPointerCapture(e.pointerId);
      const el = leaves.current[d.leaf];
      if (el) {
        el.style.zIndex = String(leafCount + 5);
        el.style.visibility = "visible";
      }
    }
    const now = performance.now();
    d.vx = (e.clientX - d.lastX) / Math.max(1, now - d.lastT);
    d.lastX = e.clientX;
    d.lastT = now;
    let angle = angleFor(e.clientX);
    if (single && d.dir === -1) angle = Math.min(angle, -2);
    d.angle = angle;
    paint(d.leaf, angle);
  }

  function onPointerUp(e: React.PointerEvent) {
    const d = drag.current;
    drag.current = null;
    if (!d || d.pointerId !== e.pointerId) return;
    if (!d.active) return;
    root.current?.releasePointerCapture(e.pointerId);
    const flick = Math.abs(d.vx) > 0.5;
    const completeForward = d.dir === 1 && (d.angle < -90 || (flick && d.vx < 0));
    const completeBack = d.dir === -1 && (d.angle > -90 || (flick && d.vx > 0));
    if (completeForward) turnTo(turnedRef.current + 1, d.leaf);
    else if (completeBack) turnTo(turnedRef.current - 1, d.leaf);
    else layout(turnedRef.current, true, d.leaf);
  }

  const visibleLeft = clampTurned - 1;
  const visibleRight = clampTurned;
  const windowed = (i: number) => i >= clampTurned - 2 && i <= clampTurned + 1;

  return (
    <div
      className={`flipbook relative mx-auto select-none ${single ? "flipbook-single" : "flipbook-spread"} ${idle && !reducedMotion ? "flipbook-idle" : ""}`}
      aria-roledescription="notebook"
    >
      <div
        ref={root}
        className="flipbook-stage relative"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ touchAction: "pan-y" }}
      >
        <div aria-hidden className="flipbook-cover" />

        {!single && (
          <div className="flipbook-left paper" inert={clampTurned > 0}>
            {endpaper}
          </div>
        )}

        <div ref={shadow} aria-hidden className="flipbook-shadow" />

        {Array.from({ length: leafCount }, (_, i) => {
          const front = single ? pages[i] : pages[i * 2];
          const back = single ? verso : pages[i * 2 + 1];
          const show = windowed(i);
          return (
            <div
              key={i}
              ref={(el) => {
                leaves.current[i] = el;
              }}
              className="flipbook-leaf"
              data-leaf={i}
            >
              <div className="flipbook-face flipbook-front paper" inert={i !== visibleRight}>
                {show ? front : null}
                <div aria-hidden className="flipbook-shade-front" />
              </div>
              <div className="flipbook-face flipbook-back paper" inert={i !== visibleLeft}>
                {show ? (back ?? <div className="h-full" />) : null}
                <div aria-hidden className="flipbook-shade-back" />
              </div>
            </div>
          );
        })}

        {!single && <div aria-hidden className="flipbook-gutter" />}

        {ribbonPage !== undefined && (
          <button
            type="button"
            data-no-flip
            className="flipbook-ribbon"
            aria-label="Jump to the bookmarked page"
            onClick={() => turnTo(leafForPage(ribbonPage))}
            key={`ribbon-${clampTurned}`}
          />
        )}
      </div>

      <button
        type="button"
        onClick={prev}
        disabled={clampTurned === 0}
        className="flipbook-edge left-0 -translate-x-full"
        aria-label="Previous page"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={next}
        disabled={clampTurned >= leafCount}
        className="flipbook-edge right-0 translate-x-full"
        aria-label="Next page"
      >
        ›
      </button>
      <p className="sr-only" aria-live="polite">
        {single
          ? `Page ${Math.min(clampTurned + 1, pages.length)} of ${pages.length}`
          : `Spread ${clampTurned + 1} of ${leafCount + 1}`}
      </p>
    </div>
  );
});
