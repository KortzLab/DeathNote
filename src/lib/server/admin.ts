import "server-only";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { adminEmails } from "@/lib/env";

export type AdminCheck =
  | { ok: true; userId: string }
  | { ok: false; reason: "signed-out" | "sign-in-again" | "forbidden" };

/**
 * Full check for admin pages and actions. The session role is only a hint; this also requires
 * the account to be marked ADMIN in the database (set by `npm run admin:create`, never by the
 * site) and the sign-in to be newer than the last password change, so a reset ends old sessions.
 */
export async function checkAdmin(): Promise<AdminCheck> {
  const session = await auth();
  const user = session?.user;
  if (!session || !user?.id) return { ok: false, reason: "signed-out" };

  const listed = adminEmails().includes(user.email?.toLowerCase() ?? "");
  if (!listed) return { ok: false, reason: "forbidden" };
  if (user.role !== "ADMIN" || !session.authAt) return { ok: false, reason: "sign-in-again" };

  const row = await db.user.findUnique({
    where: { id: user.id },
    select: { role: true, email: true, updatedAt: true },
  });
  if (!row || row.role !== "ADMIN" || row.email?.toLowerCase() !== user.email?.toLowerCase()) {
    return { ok: false, reason: "forbidden" };
  }
  if (row.updatedAt.getTime() > session.authAt) return { ok: false, reason: "sign-in-again" };
  return { ok: true, userId: user.id };
}
