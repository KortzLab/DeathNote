import { hash } from "@node-rs/argon2";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validation/auth";
import { assertSameOrigin, error, json, readJson, zodError } from "@/lib/server/http";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

export async function POST(req: Request) {
  const blocked = assertSameOrigin(req);
  if (blocked) return blocked;

  const limit = await rateLimit(`register:${clientIp(req)}`, 5, 60 * 60);
  if (!limit.ok) return error(429, "Too many attempts. Try again later.");

  let body: unknown;
  try {
    body = await readJson(req, 4096);
  } catch {
    return error(400, "Invalid JSON");
  }
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const { email, password, name } = parsed.data;
  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  // Same response either way: never reveal whether an e-mail is registered.
  if (!existing) {
    const passwordHash = await hash(password, { memoryCost: 19456, timeCost: 2, parallelism: 1 });
    await db.user.create({ data: { email, name: name ?? null, passwordHash } });
  }
  return json({ ok: true }, 201);
}
