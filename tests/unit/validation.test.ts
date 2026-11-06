import { describe, expect, it } from "vitest";
import { createNoteSchema, noteFieldsSchema, cleanText } from "@/lib/validation/notes";
import { registerSchema } from "@/lib/validation/auth";

describe("note validation", () => {
  it("trims and strips control characters", () => {
    expect(cleanText("  Ryo\u0000ta \u0007 ")).toBe("Ryota");
  });

  it("requires a name", () => {
    expect(noteFieldsSchema.safeParse({ name: "   " }).success).toBe(false);
  });

  it("normalises empty optional fields to null", () => {
    const r = noteFieldsSchema.parse({ name: "Mirela", cause: "  ", details: "" });
    expect(r).toEqual({ name: "Mirela", cause: null, details: null, time: null });
  });

  it("enforces length limits", () => {
    expect(noteFieldsSchema.safeParse({ name: "x".repeat(81) }).success).toBe(false);
    expect(noteFieldsSchema.safeParse({ name: "ok", details: "x".repeat(1001) }).success).toBe(
      false,
    );
  });

  it("keeps markup as plain text (rendering escapes it)", () => {
    const r = noteFieldsSchema.parse({ name: "<script>alert(1)</script>" });
    expect(r.name).toBe("<script>alert(1)</script>");
  });

  it("rejects threats via the content guard", () => {
    const r = noteFieldsSchema.safeParse({ name: "Someone", details: "I will kill you" });
    expect(r.success).toBe(false);
  });

  it("validates page numbers and client ids", () => {
    expect(createNoteSchema.safeParse({ name: "A", pageNumber: 0 }).success).toBe(false);
    expect(
      createNoteSchema.safeParse({ name: "A", pageNumber: 2, clientId: "bad id!" }).success,
    ).toBe(false);
    expect(createNoteSchema.parse({ name: "A" }).pageNumber).toBe(1);
  });
});

describe("account validation", () => {
  it("lower-cases e-mails and requires strong-enough passwords", () => {
    expect(
      registerSchema.parse({ email: " Kira@Example.COM ", password: "0123456789" }).email,
    ).toBe("kira@example.com");
    expect(registerSchema.safeParse({ email: "a@b.co", password: "short" }).success).toBe(false);
  });
});
