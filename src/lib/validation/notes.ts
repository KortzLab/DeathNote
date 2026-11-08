import { z } from "zod";
import { checkAll, GUARD_MESSAGES } from "@/lib/content-guard";

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

// Keeps \t and \n.
export const cleanText = (s: string) => s.replace(CONTROL_CHARS, "").trim();

export const NOTE_LIMITS = { name: 80, cause: 120, details: 1000, time: 80 } as const;

const requiredName = z
  .string()
  .max(NOTE_LIMITS.name * 2)
  .transform(cleanText)
  .pipe(z.string().min(1, "A name must be written.").max(NOTE_LIMITS.name));

const optionalText = (max: number) =>
  z
    .string()
    .max(max * 2)
    .transform(cleanText)
    .pipe(z.string().max(max))
    .nullish()
    .transform((v) => (v ? v : null));

type GuardFields = {
  name?: string | null;
  cause?: string | null;
  details?: string | null;
  time?: string | null;
};

export function guardNoteFields(v: GuardFields, ctx: z.RefinementCtx) {
  const r = checkAll(v.name, v.cause, v.details, v.time);
  if (!r.ok) ctx.addIssue({ code: "custom", message: GUARD_MESSAGES[r.reason], path: ["name"] });
}

export const noteFieldShape = {
  name: requiredName,
  cause: optionalText(NOTE_LIMITS.cause),
  details: optionalText(NOTE_LIMITS.details),
  time: optionalText(NOTE_LIMITS.time),
};

export const noteFieldsSchema = z.object(noteFieldShape).superRefine(guardNoteFields);
export type NoteFields = z.infer<typeof noteFieldsSchema>;

const clientIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{6,64}$/);

export const createNoteSchema = z
  .object({
    ...noteFieldShape,
    pageNumber: z.number().int().min(1).max(999).default(1),
    clientId: clientIdSchema.optional(),
    sealed: z.boolean().optional(),
  })
  .superRefine(guardNoteFields);

export const updateNoteSchema = z
  .object({
    name: requiredName.optional(),
    cause: optionalText(NOTE_LIMITS.cause),
    details: optionalText(NOTE_LIMITS.details),
    time: optionalText(NOTE_LIMITS.time),
    sealed: z.boolean().optional(),
  })
  .superRefine(guardNoteFields);

export const guestNoteSchema = z.object({
  id: clientIdSchema,
  page: z.number().int().min(1).max(999),
  name: z.string(),
  cause: z.string().nullish(),
  details: z.string().nullish(),
  time: z.string().nullish(),
  sealedAt: z.string().nullish(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type GuestNote = z.infer<typeof guestNoteSchema>;

export const importSchema = z.object({ notes: z.array(guestNoteSchema).max(500) });

export const searchSchema = z.object({
  q: z.string().max(80).transform(cleanText),
});
