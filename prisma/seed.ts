// Dev only. The demo password is random and printed once per run.
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { hash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

async function main() {
  if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed production.");

  const email = "demo@deathnote.local";
  const password = randomBytes(9).toString("base64url");
  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash: await hash(password) },
    create: { email, name: "Demo Scribe", passwordHash: await hash(password) },
  });

  const notebook =
    (await db.notebook.findFirst({ where: { ownerId: user.id } })) ??
    (await db.notebook.create({ data: { ownerId: user.id, title: "Death Note" } }));

  const page = await db.page.upsert({
    where: { notebookId_number: { notebookId: notebook.id, number: 1 } },
    update: {},
    create: { notebookId: notebook.id, number: 1 },
  });

  const entries = [
    {
      name: "Count Vellum Ashgrave",
      cause: "Swallowed by his own shadow",
      time: "At the stroke of midnight",
    },
    {
      name: "The Lantern Thief",
      cause: "Lost in a library with no exits",
      details: "Wandered the stacks until the candles burned out.",
    },
    {
      name: "Mirela of the Grey Coast",
      cause: "Old age, peacefully",
      time: "Ninety-nine winters from now",
    },
  ];
  await db.note.deleteMany({ where: { pageId: page.id } });
  await db.note.createMany({
    data: entries.map((e, i) => ({ ...e, pageId: page.id, position: i, sealedAt: new Date() })),
  });

  const sponsors = [
    {
      name: "A quiet raven",
      message: "Keep the candle burning.",
      amountCents: 1000,
      showPublicly: true,
    },
    { name: "Ink & Ash", message: null, amountCents: 2500, showPublicly: true },
    { name: null, message: null, amountCents: 500, showPublicly: false },
  ];
  for (const [i, s] of sponsors.entries()) {
    const orderId = `seed-${i + 1}`;
    await db.sponsorship.upsert({
      where: { orderId },
      update: {},
      create: {
        orderId,
        amountCents: s.amountCents,
        charityCents: Math.floor((s.amountCents * 70) / 100),
        status: "paid",
        paidAt: new Date(),
        name: s.name,
        message: s.message,
        showPublicly: s.showPublicly,
      },
    });
  }

  console.log("Seed complete.");
  console.log(`Demo account: ${email}`);
  console.log(`Demo password (local only, regenerated on every seed): ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
