/** Admin powers lapse this long after the password was last entered; sign in again to renew. */
export const ADMIN_SESSION_MS = 12 * 60 * 60 * 1000;

export function parseAdminEmails(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((e) =>
      e
        .trim()
        .replace(/^["']|["']$/g, "")
        .toLowerCase(),
    )
    .filter(Boolean);
}

/**
 * A session is ADMIN only while its e-mail is on the list and the sign-in is recent. Users keep
 * their long notebook session; only the admin role expires.
 */
export function roleFor(
  email: string | null | undefined,
  authAt: number | undefined,
  admins: string[],
  now = Date.now(),
): "ADMIN" | "USER" {
  if (!email || !authAt) return "USER";
  if (!admins.includes(email.toLowerCase())) return "USER";
  return now - authAt < ADMIN_SESSION_MS ? "ADMIN" : "USER";
}
