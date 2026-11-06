import { describe, expect, it } from "vitest";
import { checkText, normalise } from "@/lib/content-guard";

describe("content guard", () => {
  it("allows fictional entries", () => {
    for (const text of [
      "Count Vellum Ashgrave",
      "Heart attack",
      "Fell asleep in the library and never woke",
      "At the stroke of midnight",
      "Spicy food overdose", // must not trip the slur patterns
    ]) {
      expect(checkText(text)).toEqual({ ok: true });
    }
  });

  it("blocks direct threats, including obfuscated ones", () => {
    expect(checkText("I will kill you")).toMatchObject({ ok: false, reason: "threat" });
    expect(checkText("i'm g0nna hurt u")).toMatchObject({ ok: false, reason: "threat" });
    expect(checkText("I know where you live")).toMatchObject({ ok: false, reason: "threat" });
  });

  it("blocks self-harm encouragement", () => {
    expect(checkText("kys")).toMatchObject({ ok: false, reason: "self-harm" });
    expect(checkText("go kill yourself")).toMatchObject({ ok: false, reason: "self-harm" });
  });

  it("blocks personal data", () => {
    expect(checkText("someone@example.com")).toMatchObject({ ok: false, reason: "personal-data" });
    expect(checkText("call +1 555 123 4567")).toMatchObject({ ok: false, reason: "personal-data" });
  });

  it("normalises leetspeak and repeated letters", () => {
    expect(normalise("K1LLLLL Y0U")).toBe("kill you");
  });
});
