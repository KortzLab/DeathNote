export type NoteRecord = {
  id: string;
  page: number;
  name: string;
  cause: string | null;
  details: string | null;
  time: string | null;
  sealedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NoteDraft = {
  name: string;
  cause?: string | null;
  details?: string | null;
  time?: string | null;
};

export const ENTRIES_PER_PAGE = 5;
export const GUEST_STORAGE_KEY = "dn:guest-notes";
export const IMPORT_DISMISSED_KEY = "dn:import-dismissed";
