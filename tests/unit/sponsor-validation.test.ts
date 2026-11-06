import { describe, expect, it } from "vitest";
import { charityCents, formatUsd, sponsorSchema, toCents } from "@/lib/validation/sponsor";

describe("sponsor amounts", () => {
  it("converts dollars to integer cents without float errors", () => {
    expect(toCents("10")).toBe(1000);
    expect(toCents("0.1")).toBe(10);
    expect(toCents("19.99")).toBe(1999);
    expect(toCents(25)).toBe(2500);
    expect(toCents("1.234")).toBeNull();
    expect(toCents("-5")).toBeNull();
    expect(toCents("1e3")).toBeNull();
    expect(toCents("abc")).toBeNull();
  });

  it("computes the 70% charity share, rounding down", () => {
    expect(charityCents(1000)).toBe(700);
    expect(charityCents(333)).toBe(233);
    expect(formatUsd(charityCents(1000))).toBe("$7.00");
  });

  it("accepts recommended and custom amounts within bounds", () => {
    for (const amount of [3, 5, 10, 25, 50, "1", "10000", "12.50"]) {
      expect(sponsorSchema.safeParse({ amount }).success).toBe(true);
    }
  });

  it("rejects amounts outside $1 – $10,000", () => {
    for (const amount of ["0.99", "0", "10000.01", "50000"]) {
      expect(sponsorSchema.safeParse({ amount }).success).toBe(false);
    }
  });

  it("keeps the public listing opt-in and cleans text", () => {
    const r = sponsorSchema.parse({ amount: 5, name: "  Raven ", message: "" });
    expect(r).toMatchObject({ amount: 500, name: "Raven", message: null, showPublicly: false });
  });

  it("blocks threats in sponsor messages", () => {
    expect(sponsorSchema.safeParse({ amount: 5, message: "I know where you live" }).success).toBe(
      false,
    );
  });
});
