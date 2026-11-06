"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { useStoredValue } from "@/lib/hooks/useStoredValue";
import type { Howl as HowlType } from "howler";
import type { SoundName } from "@/lib/sound/synth";

type PlayOptions = { volume?: number; rate?: number };

type SoundContextValue = {
  enabled: boolean;
  toggle: () => void;
  play: (name: SoundName, options?: PlayOptions) => void;
  loop: (name: SoundName, on: boolean, volume?: number) => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);
const STORAGE_KEY = "dn:sound";

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useStoredValue(STORAGE_KEY);
  const enabled = stored === "on";
  const howls = useRef(new Map<SoundName, HowlType>());
  const loops = useRef(new Set<SoundName>());
  const HowlCtor = useRef<typeof HowlType | null>(null);

  const get = useCallback(async (name: SoundName): Promise<HowlType | null> => {
    const existing = howls.current.get(name);
    if (existing) return existing;
    if (!HowlCtor.current) {
      const mod = await import("howler");
      HowlCtor.current = mod.Howl;
    }
    const { synthesize } = await import("@/lib/sound/synth");
    const howl = new HowlCtor.current({ src: [synthesize(name)], format: ["wav"], html5: false });
    howls.current.set(name, howl);
    return howl;
  }, []);

  const play = useCallback(
    (name: SoundName, options?: PlayOptions) => {
      if (!enabled) return;
      void get(name).then((h) => {
        if (!h) return;
        const id = h.play();
        h.volume(options?.volume ?? 0.6, id);
        if (options?.rate) h.rate(options.rate, id);
      });
    },
    [enabled, get],
  );

  const loop = useCallback(
    (name: SoundName, on: boolean, volume = 0.3) => {
      if (on) loops.current.add(name);
      else loops.current.delete(name);
      if (!enabled && on) return;
      void get(name).then((h) => {
        if (!h) return;
        if (on && !h.playing()) {
          h.loop(true);
          h.volume(0);
          h.play();
          h.fade(0, volume, 1500);
        } else if (!on && h.playing()) {
          h.fade(h.volume(), 0, 800);
          setTimeout(() => h.stop(), 820);
        }
      });
    },
    [enabled, get],
  );

  const toggle = useCallback(() => {
    const next = !enabled;
    setStored(next ? "on" : "off");
    if (!next) howls.current.forEach((h) => h.stop());
  }, [enabled, setStored]);

  useEffect(() => {
    if (!enabled) return;
    loops.current.forEach((name) => {
      void get(name).then((h) => {
        if (h && !h.playing()) {
          h.loop(true);
          h.volume(0);
          h.play();
          h.fade(0, 0.3, 1500);
        }
      });
    });
  }, [enabled, get]);

  const value = useMemo(() => ({ enabled, toggle, play, loop }), [enabled, toggle, play, loop]);
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) return { enabled: false, toggle: () => {}, play: () => {}, loop: () => {} };
  return ctx;
}
