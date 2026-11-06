"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useStoredValue, writeStored } from "@/lib/hooks/useStoredValue";
import { guestNoteSchema, noteFieldsSchema, updateNoteSchema } from "@/lib/validation/notes";
import { GUEST_STORAGE_KEY, type NoteDraft, type NoteRecord } from "@/lib/notes/types";

export type SaveState = "idle" | "saving" | "saved" | "error";
export type NotebookMode = "loading" | "guest" | "account";

export function newClientId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 20);
}

function parseGuest(raw: string | null): NoteRecord[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.flatMap((item) => {
      const r = guestNoteSchema.safeParse(item);
      if (!r.success) return [];
      const n = r.data;
      return [
        {
          id: n.id,
          page: n.page,
          name: n.name,
          cause: n.cause ?? null,
          details: n.details ?? null,
          time: n.time ?? null,
          sealedAt: n.sealedAt ?? null,
          createdAt: n.createdAt,
          updatedAt: n.updatedAt,
        },
      ];
    });
  } catch {
    return [];
  }
}

function saveGuest(notes: NoteRecord[]) {
  writeStored(GUEST_STORAGE_KEY, JSON.stringify(notes));
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

export function useNotebook() {
  const { status } = useSession();
  const mode: NotebookMode =
    status === "loading" ? "loading" : status === "authenticated" ? "account" : "guest";

  const [guestRaw] = useStoredValue(GUEST_STORAGE_KEY);
  const guestNotes = useMemo(() => parseGuest(guestRaw), [guestRaw]);

  const [accountNotes, setAccountNotes] = useState<NoteRecord[] | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const pending = useRef(new Map<string, Partial<NoteDraft>>());

  const reload = useCallback(async () => {
    try {
      const data = await api<{ notes: NoteRecord[] }>("/api/notes");
      setAccountNotes(data.notes);
    } catch (e) {
      setError((e as Error).message);
      setAccountNotes([]);
    }
  }, []);

  useEffect(() => {
    if (mode !== "account") return;
    let cancelled = false;
    void api<{ notes: NoteRecord[] }>("/api/notes")
      .then((d) => !cancelled && setAccountNotes(d.notes))
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
        setAccountNotes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const notes = mode === "account" ? (accountNotes ?? []) : mode === "guest" ? guestNotes : [];
  const ready = mode === "guest" || (mode === "account" && accountNotes !== null);

  const flashSaved = useCallback(() => {
    setSaveState("saved");
    setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 2200);
  }, []);

  const create = useCallback(
    async (draft: NoteDraft, page: number): Promise<NoteRecord | null> => {
      const parsed = noteFieldsSchema.safeParse(draft);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "The notebook rejected that.");
        return null;
      }
      setError(null);
      const now = new Date().toISOString();
      const clientId = newClientId();

      if (mode === "guest") {
        const record: NoteRecord = {
          id: clientId,
          page,
          ...parsed.data,
          sealedAt: null,
          createdAt: now,
          updatedAt: now,
        };
        saveGuest([...guestNotes, record]);
        flashSaved();
        return record;
      }

      setSaveState("saving");
      try {
        const { note } = await api<{ note: NoteRecord }>("/api/notes", {
          method: "POST",
          body: JSON.stringify({ ...parsed.data, pageNumber: page, clientId }),
        });
        setAccountNotes((prev) => [...(prev ?? []), note]);
        flashSaved();
        return note;
      } catch (e) {
        setSaveState("error");
        setError((e as Error).message);
        return null;
      }
    },
    [flashSaved, guestNotes, mode],
  );

  // Guests save instantly; accounts autosave with a debounce.
  const update = useCallback(
    (id: string, patch: Partial<NoteDraft>) => {
      const check = updateNoteSchema.safeParse(patch);
      if (!check.success) {
        setError(check.error.issues[0]?.message ?? "The notebook rejected that.");
        return;
      }
      setError(null);
      const now = new Date().toISOString();
      const apply = (list: NoteRecord[]) =>
        list.map((n) =>
          n.id === id ? ({ ...n, ...check.data, updatedAt: now } as NoteRecord) : n,
        );

      if (mode === "guest") {
        saveGuest(apply(guestNotes));
        flashSaved();
        return;
      }
      setAccountNotes((prev) => apply(prev ?? []));
      pending.current.set(id, { ...pending.current.get(id), ...patch });
      setSaveState("saving");
      const existing = timers.current.get(id);
      if (existing) clearTimeout(existing);
      timers.current.set(
        id,
        setTimeout(() => {
          const body = pending.current.get(id);
          pending.current.delete(id);
          timers.current.delete(id);
          void api(`/api/notes/${id}`, { method: "PATCH", body: JSON.stringify(body) })
            .then(flashSaved)
            .catch((e: Error) => {
              setSaveState("error");
              setError(e.message);
            });
        }, 700),
      );
    },
    [flashSaved, guestNotes, mode],
  );

  const seal = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      if (mode === "guest") {
        saveGuest(
          guestNotes.map((n) => (n.id === id && !n.sealedAt ? { ...n, sealedAt: now } : n)),
        );
        return;
      }
      setAccountNotes((prev) =>
        (prev ?? []).map((n) => (n.id === id && !n.sealedAt ? { ...n, sealedAt: now } : n)),
      );
      void api(`/api/notes/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ sealed: true }),
      }).catch(() => {});
    },
    [guestNotes, mode],
  );

  const remove = useCallback(
    async (id: string) => {
      if (mode === "guest") {
        saveGuest(guestNotes.filter((n) => n.id !== id));
        return;
      }
      const before = accountNotes;
      setAccountNotes((prev) => (prev ?? []).filter((n) => n.id !== id));
      try {
        await api(`/api/notes/${id}`, { method: "DELETE" });
        flashSaved();
      } catch (e) {
        setAccountNotes(before);
        setError((e as Error).message);
      }
    },
    [accountNotes, flashSaved, guestNotes, mode],
  );

  const importGuest = useCallback(async () => {
    if (mode !== "account" || guestNotes.length === 0) return { imported: 0, skipped: 0 };
    const result = await api<{ imported: number; skipped: number }>("/api/notes/import", {
      method: "POST",
      body: JSON.stringify({ notes: guestNotes }),
    });
    writeStored(GUEST_STORAGE_KEY, null);
    await reload();
    return result;
  }, [guestNotes, mode, reload]);

  // Flush pending autosaves when leaving the page.
  useEffect(() => {
    const t = timers.current;
    const p = pending.current;
    const flush = () => {
      p.forEach((body, id) => {
        void fetch(`/api/notes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          keepalive: true,
        });
      });
      p.clear();
      t.forEach(clearTimeout);
      t.clear();
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, []);

  return {
    mode,
    ready,
    notes,
    guestNotes,
    saveState,
    error,
    clearError: () => setError(null),
    create,
    update,
    seal,
    remove,
    importGuest,
  };
}

export type Notebook = ReturnType<typeof useNotebook>;
