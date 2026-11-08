import { describe, expect, it } from "vitest";
import { AUTO_HIDE_AT, shouldAutoHide } from "@/lib/public/shared";
import { publicEntrySchema, reportSchema, shareSchema } from "@/lib/validation/public";

describe("public book and shares", () => {
  it("hides an item once enough distinct people report it", () => {
    expect(shouldAutoHide(AUTO_HIDE_AT - 1)).toBe(false);
    expect(shouldAutoHide(AUTO_HIDE_AT)).toBe(true);
  });

  it("validates public entries like private notes, plus an optional pen name", () => {
    expect(publicEntrySchema.parse({ name: " Ser Hollow ", penName: "" })).toMatchObject({
      name: "Ser Hollow",
      penName: null,
    });
    expect(publicEntrySchema.safeParse({ name: "I will kill you" }).success).toBe(false);
    expect(publicEntrySchema.safeParse({ name: "Ok", penName: "me@example.com" }).success).toBe(
      false,
    );
    expect(publicEntrySchema.safeParse({ name: "Ok", penName: "x".repeat(41) }).success).toBe(
      false,
    );
  });

  it("shares notes from the notebook by default", () => {
    const share = shareSchema.parse({ name: "Mirela" });
    expect(share).toMatchObject({ name: "Mirela", source: "notebook", penName: null });
  });

  it("only accepts known report reasons and targets", () => {
    const ok = { targetType: "shared_note", targetId: "knE35ZtaQo", reason: "real-person" };
    expect(reportSchema.safeParse(ok).success).toBe(true);
    expect(reportSchema.safeParse({ ...ok, reason: "boring" }).success).toBe(false);
    expect(reportSchema.safeParse({ ...ok, targetType: "users" }).success).toBe(false);
  });
});
