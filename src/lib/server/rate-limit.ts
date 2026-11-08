import "server-only";
import { db } from "@/lib/db";

export type RateLimitResult = { ok: boolean; remaining: number; resetAt: Date };

// Fixed window in Postgres so it works across serverless instances. One atomic upsert per call.
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  try {
    const rows = await db.$queryRaw<Array<{ count: number; reset_at: Date }>>`
      INSERT INTO rate_limits (key, count, reset_at)
      VALUES (${key}, 1, now() + make_interval(secs => ${windowSeconds}))
      ON CONFLICT (key) DO UPDATE SET
        count = CASE WHEN rate_limits.reset_at < now() THEN 1 ELSE rate_limits.count + 1 END,
        reset_at = CASE WHEN rate_limits.reset_at < now()
          THEN now() + make_interval(secs => ${windowSeconds}) ELSE rate_limits.reset_at END
      RETURNING count, reset_at`;
    const row = rows[0];
    if (!row) return { ok: true, remaining: limit, resetAt: new Date() };
    return {
      ok: row.count <= limit,
      remaining: Math.max(0, limit - row.count),
      resetAt: row.reset_at,
    };
  } catch {
    // Fail open: a limiter outage should not take writes down with it.
    return { ok: true, remaining: limit, resetAt: new Date() };
  }
}

// The left-most X-Forwarded-For entry is whatever the client sent, so never trust it.
// Vercel and nginx (proxy_set_header X-Real-IP) set X-Real-IP; otherwise take the entry our
// own proxy appended last.
export function clientIp(req: Request): string {
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const hops = req.headers.get("x-forwarded-for")?.split(",") ?? [];
  return hops.at(-1)?.trim() || "unknown";
}
