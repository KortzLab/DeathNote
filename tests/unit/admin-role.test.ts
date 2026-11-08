import { describe, expect, it } from "vitest";
import { ADMIN_SESSION_MS, parseAdminEmails, roleFor } from "@/lib/auth/role";

describe("parseAdminEmails", () => {
  it("trims, lowercases, drops quotes and empty entries", () => {
    expect(parseAdminEmails(' "Boss@Example.com" , ,second@example.com ')).toEqual([
      "boss@example.com",
      "second@example.com",
    ]);
    expect(parseAdminEmails(undefined)).toEqual([]);
  });
});

describe("roleFor", () => {
  const admins = ["boss@example.com"];
  const now = 1_000_000_000_000;

  it("grants ADMIN to a listed e-mail with a fresh sign-in", () => {
    expect(roleFor("Boss@Example.com", now - 1000, admins, now)).toBe("ADMIN");
  });

  it("drops to USER once the admin window has passed", () => {
    expect(roleFor("boss@example.com", now - ADMIN_SESSION_MS, admins, now)).toBe("USER");
  });

  it("never grants ADMIN without a sign-in time or to unlisted e-mails", () => {
    expect(roleFor("boss@example.com", undefined, admins, now)).toBe("USER");
    expect(roleFor("someone@example.com", now, admins, now)).toBe("USER");
    expect(roleFor(null, now, admins, now)).toBe("USER");
  });
});
