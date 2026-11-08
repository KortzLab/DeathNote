import { z } from "zod";
import { checkText, GUARD_MESSAGES } from "@/lib/content-guard";
import { cleanText, guardNoteFields, noteFieldShape } from "@/lib/validation/notes";
import { REPORT_REASONS, type ReportReason } from "@/lib/public/shared";

const penName = z
  .string()
  .max(80)
  .transform(cleanText)
  .pipe(z.string().max(40))
  .nullish()
  .transform((v) => v || null)
  .superRefine((v, ctx) => {
    const r = checkText(v ?? "");
    if (!r.ok) ctx.addIssue({ code: "custom", message: GUARD_MESSAGES[r.reason] });
  });

export const publicEntrySchema = z
  .object({ ...noteFieldShape, penName })
  .superRefine(guardNoteFields);

export const shareSchema = z
  .object({
    ...noteFieldShape,
    penName,
    blurName: z.boolean().default(true),
    source: z.enum(["notebook", "public"]).default("notebook"),
  })
  .superRefine(guardNoteFields);

export const targetSchema = z.object({
  targetType: z.enum(["public_entry", "shared_note"]),
  targetId: z.string().min(6).max(40),
});

export const reportSchema = targetSchema.extend({
  reason: z.enum(Object.keys(REPORT_REASONS) as [ReportReason, ...ReportReason[]]),
});

export const ownerTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{32,64}$/);
