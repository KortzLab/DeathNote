"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { PublicItem, TargetType } from "@/lib/public/shared";

export type PublicStats = { total: number; today: number; pages: number };

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
  return body;
}

// --- page cache -------------------------------------------------------------
// Pages are fetched lazily as the flip-book windows them in, and shared between
// re-renders. Bumping `version` tells every subscriber to re-read.

const pages = new Map<number, PublicItem[]>();
const inflight = new Map<number, Promise<void>>();
let stats: PublicStats | null = null;
let version = 0;
const listeners = new Set<() => void>();
const emit = () => {
  version++;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function load(page: number) {
  if (inflight.has(page)) return inflight.get(page);
  const p = call<{ stats: PublicStats; entries: PublicItem[] }>(`/api/public?page=${page}`)
    .then((r) => {
      pages.set(page, r.entries);
      stats = r.stats;
    })
    .catch(() => {
      pages.set(page, []);
    })
    .finally(() => {
      inflight.delete(page);
      emit();
    });
  inflight.set(page, p);
  return p;
}

export function invalidatePage(page: number) {
  pages.delete(page);
  void load(page);
}

export function usePublicPage(page: number): PublicItem[] | null {
  useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  );
  useEffect(() => {
    if (!pages.has(page)) void load(page);
  }, [page]);
  return pages.get(page) ?? null;
}

/** Polls the cheap stats endpoint; returns the latest numbers. */
export function usePublicStats(pollMs: number, initial: PublicStats): PublicStats {
  useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  );
  useEffect(() => {
    let alive = true;
    const tick = () =>
      call<{ stats: PublicStats }>("/api/public")
        .then((r) => {
          if (!alive) return;
          stats = r.stats;
          emit();
        })
        .catch(() => {});
    const id = setInterval(tick, pollMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [pollMs]);
  return stats ?? initial;
}

// --- ownership tokens -------------------------------------------------------
// Anonymous authors prove ownership with a token only their browser holds.

const TOKENS_KEY = "dn:owner-tokens";

function readTokens(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(TOKENS_KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

export function rememberToken(id: string, token: string) {
  try {
    localStorage.setItem(TOKENS_KEY, JSON.stringify({ ...readTokens(), [id]: token }));
  } catch {
    /* private mode: the item simply can't be withdrawn later */
  }
}

export function tokenFor(id: string): string | null {
  return typeof window === "undefined" ? null : (readTokens()[id] ?? null);
}

export function forgetToken(id: string) {
  const { [id]: _drop, ...rest } = readTokens();
  try {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(rest));
  } catch {
    /* ignore */
  }
}

// --- actions ----------------------------------------------------------------

export type Draft = {
  name: string;
  cause?: string | null;
  details?: string | null;
  time?: string | null;
};

export async function writePublic(draft: Draft & { penName?: string | null }) {
  const r = await call<{ id: string; ownerToken: string }>("/api/public", {
    method: "POST",
    body: JSON.stringify(draft),
  });
  rememberToken(r.id, r.ownerToken);
  return r.id;
}

export async function withdrawPublic(id: string) {
  await call(`/api/public/${id}`, {
    method: "DELETE",
    headers: { "x-owner-token": tokenFor(id) ?? "" },
  });
  forgetToken(id);
}

export async function sharePage(
  draft: Draft & { penName?: string | null; source: "notebook" | "public" },
) {
  const r = await call<{ id: string; url: string; ownerToken: string }>("/api/shares", {
    method: "POST",
    body: JSON.stringify(draft),
  });
  rememberToken(r.id, r.ownerToken);
  return r;
}

export async function unshare(id: string) {
  await call(`/api/shares/${id}`, {
    method: "DELETE",
    headers: { "x-owner-token": tokenFor(id) ?? "" },
  });
  forgetToken(id);
}

export function lightCandle(targetType: TargetType, targetId: string) {
  return call<{ candles: number }>("/api/candles", {
    method: "POST",
    body: JSON.stringify({ targetType, targetId }),
  });
}

export function report(targetType: TargetType, targetId: string, reason: string) {
  return call("/api/reports", {
    method: "POST",
    body: JSON.stringify({ targetType, targetId, reason }),
  });
}

// --- pen name ---------------------------------------------------------------

export const PEN_NAME_KEY = "dn:pen-name";
