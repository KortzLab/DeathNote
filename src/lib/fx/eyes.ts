"use client";

import { useSyncExternalStore } from "react";

let active = false;
const listeners = new Set<() => void>();

export function setEyes(on: boolean) {
  active = on;
  document.documentElement.classList.toggle("shinigami-eyes", on);
  listeners.forEach((l) => l());
}

export function toggleEyes() {
  setEyes(!active);
}

export function useEyes(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => active,
    () => false,
  );
}

/** FNV-1a of the name, so the same name always shows the same number. */
export function lifespanFor(name: string): string {
  let h = 2166136261;
  for (const ch of name.trim().toLowerCase()) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 16777619);
  }
  return String((h >>> 0) % 100_000_000).padStart(8, "0");
}

export const TYPING_EVENT = "dn:typing";
export function emitTyping() {
  window.dispatchEvent(new Event(TYPING_EVENT));
}
