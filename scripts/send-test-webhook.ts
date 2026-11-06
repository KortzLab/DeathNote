// Signs a fake OxaPay callback with the key from .env and posts it to the local server.
//   npm run webhook:test -- <order_id> [status=Paid] [url]
import "dotenv/config";
import { createHmac } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

async function main() {
  const [orderId, status = "Paid", url = "http://localhost:3000/api/webhooks/oxapay"] =
    process.argv.slice(2);
  if (!orderId) {
    console.error("Usage: npm run webhook:test -- <order_id> [status] [url]");
    process.exit(1);
  }
  const key = process.env.OXAPAY_MERCHANT_API_KEY;
  if (!key) throw new Error("OXAPAY_MERCHANT_API_KEY is not set in .env");

  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
  });
  const s = await db.sponsorship.findUnique({ where: { orderId } });
  await db.$disconnect();
  if (!s) throw new Error(`No sponsorship with order_id ${orderId}`);

  const body = JSON.stringify({
    track_id: s.oxapayTrackId ?? `local-${orderId}`,
    status,
    type: "invoice",
    order_id: orderId,
    amount: s.amountCents / 100,
    currency: "USD",
    date: Math.floor(Date.now() / 1000),
  });
  const hmac = createHmac("sha512", key).update(body).digest("hex");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", HMAC: hmac },
    body,
  });
  console.log(`${res.status} ${await res.text()}`);
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
