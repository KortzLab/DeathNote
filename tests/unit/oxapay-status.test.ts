import { describe, expect, it } from "vitest";
import { canTransition, mapOxapayStatus, webhookPayloadSchema } from "@/lib/oxapay/status";

describe("OxaPay status mapping", () => {
  it("maps documented statuses case-insensitively", () => {
    expect(mapOxapayStatus("Paid")).toBe("paid");
    expect(mapOxapayStatus("paying")).toBe("paying");
    expect(mapOxapayStatus("Expired")).toBe("expired");
    expect(mapOxapayStatus("Manual_Accept")).toBe("paid");
    expect(mapOxapayStatus("Refunded")).toBe("refunded");
    expect(mapOxapayStatus("Failed")).toBe("failed");
    expect(mapOxapayStatus("something-else")).toBeNull();
  });

  it("never moves a payment backwards", () => {
    expect(canTransition("pending", "paying")).toBe(true);
    expect(canTransition("paying", "paid")).toBe(true);
    expect(canTransition("paid", "paying")).toBe(false);
    expect(canTransition("paid", "expired")).toBe(false);
    expect(canTransition("paid", "refunded")).toBe(true);
    expect(canTransition("expired", "paying")).toBe(false);
    expect(canTransition("expired", "paid")).toBe(true);
    expect(canTransition("paid", "paid")).toBe(false);
  });

  it("parses callback payloads with numeric track ids", () => {
    const p = webhookPayloadSchema.parse({ track_id: 987, status: "Paid", extra: 1 });
    expect(p.track_id).toBe("987");
  });
});
