"use client";

import { useEffect, useState } from "react";

const ACTIVITY = ["pointermove", "keydown", "wheel", "touchstart"] as const;

export function useIdle(ms: number): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const wake = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), ms);
    };
    wake();
    ACTIVITY.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    return () => {
      clearTimeout(timer);
      ACTIVITY.forEach((e) => window.removeEventListener(e, wake));
    };
  }, [ms]);

  return idle;
}
