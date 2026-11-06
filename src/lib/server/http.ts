import "server-only";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { siteUrl } from "@/lib/env";

export function json<T>(data: T, init?: number | ResponseInit) {
  const options = typeof init === "number" ? { status: init } : init;
  return NextResponse.json(data, {
    ...options,
    headers: { "Cache-Control": "no-store", ...(options?.headers ?? {}) },
  });
}

export function error(status: number, message: string, details?: unknown) {
  return json({ error: message, ...(details ? { details } : {}) }, status);
}

export function zodError(err: z.ZodError) {
  const first = err.issues[0];
  return error(
    422,
    first?.message ?? "Invalid input",
    err.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    })),
  );
}

// CSRF: browsers always send Origin on cross-site writes, and a JSON content type cannot be
// sent cross-site without a preflight we never answer.
export function assertSameOrigin(req: Request): Response | null {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const allowed = new Set<string>([siteUrl()]);
  if (host) {
    const proto =
      req.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    allowed.add(`${proto}://${host}`);
  }
  if (!origin || !allowed.has(origin)) return error(403, "Cross-site request blocked");
  if (req.method !== "DELETE") {
    const type = req.headers.get("content-type") ?? "";
    if (!type.includes("application/json")) return error(415, "Expected application/json");
  }
  return null;
}

export async function readJson(req: Request, maxBytes = 64 * 1024): Promise<unknown> {
  const text = await req.text();
  if (text.length > maxBytes) throw new Error("Payload too large");
  return text ? (JSON.parse(text) as unknown) : {};
}
