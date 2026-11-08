// Fills the Open Book and the shared pages with a few original, fictional entries so a fresh
// deployment doesn't look empty. Safe to run more than once and safe in production:
// every row has a fixed id, so re-running only refreshes them.
//   npm run seed:public
import "dotenv/config";
import { createHash, randomBytes } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

// Seeded rows have no owner: a random hash that no browser holds a token for.
const orphan = () => createHash("sha256").update(randomBytes(32)).digest("hex");
const SEED_VISITOR = createHash("sha256").update("seed").digest("hex");

const DAY = 24 * 60 * 60 * 1000;
const ago = (days: number, hours = 0) => new Date(Date.now() - days * DAY - hours * 3_600_000);

type Entry = {
  name: string;
  cause?: string;
  details?: string;
  time?: string;
  penName?: string;
  candles: number;
};

const OPEN_BOOK: Entry[] = [
  {
    name: "Count Vellum Ashgrave",
    cause: "Swallowed by his own shadow",
    time: "At the stroke of midnight",
    penName: "The first hand",
    candles: 14,
  },
  {
    name: "Mirela of the Grey Coast",
    cause: "Old age, peacefully",
    time: "Ninety-nine winters from now",
    penName: "A kind stranger",
    candles: 31,
  },
  {
    name: "The Lantern Thief",
    cause: "Lost in a library with no exits",
    details: "Wandered the stacks until every candle burned out.",
    candles: 9,
  },
  {
    name: "Brother Osric Venn",
    cause: "Fell silent mid-sermon",
    details: "The bells rang on without him.",
    penName: "Choir boy",
    candles: 6,
  },
  {
    name: "Lady Corvina Hale",
    cause: "Choked on a secret she swore to keep",
    time: "The night of the masquerade",
    candles: 12,
  },
  {
    name: "Old Man Pellow",
    cause: "Fell asleep in the orchard and never woke",
    details: "The apples kept falling around him.",
    penName: "A grey raven",
    candles: 22,
  },
  {
    name: "Sergeant Ivo Marsh",
    cause: "Marched into the fog",
    time: "Before the morning roll call",
    candles: 4,
  },
  {
    name: "The Clockmaker of Wend",
    cause: "Ran out of time",
    details: "Every clock in the shop stopped at once.",
    penName: "Tick",
    candles: 18,
  },
  { name: "Silas Thorne", cause: "Bitten by his own ink pen", candles: 3 },
  {
    name: "Madame Ossery",
    cause: "Lost to the tide",
    time: "When the moon is full",
    penName: "Salt",
    candles: 11,
  },
  { name: "Eldric Fane", cause: "Heart attack", penName: "A quiet raven", candles: 2 },
  {
    name: "The Bellringer of Vey",
    cause: "Fell from the tower at dusk",
    penName: "A grey raven",
    candles: 8,
  },
  {
    name: "Wren Halloway",
    cause: "Danced until dawn and then a little longer",
    details: "The music never actually stopped.",
    candles: 15,
  },
  {
    name: "Captain Morrow Black",
    cause: "Went down with a ship made of paper",
    time: "In the third storm of winter",
    penName: "Deckhand",
    candles: 7,
  },
  {
    name: "Lord Thistlewaite",
    cause: "Choked on his own pride",
    penName: "A grey raven",
    candles: 19,
  },
];

type Shared = Entry & {
  id: string;
  blurName: boolean;
  source: "notebook" | "public";
  views: number;
};

const SHARED: Shared[] = [
  {
    id: "SeedVellum",
    source: "public",
    blurName: false,
    views: 214,
    name: "Count Vellum Ashgrave",
    cause: "Swallowed by his own shadow",
    time: "At the stroke of midnight",
    penName: "The first hand",
    candles: 27,
  },
  {
    id: "SeedMirela",
    source: "public",
    blurName: false,
    views: 389,
    name: "Mirela of the Grey Coast",
    cause: "Old age, peacefully",
    time: "Ninety-nine winters from now",
    penName: "A kind stranger",
    candles: 52,
  },
  {
    id: "SeedClocks",
    source: "public",
    blurName: false,
    views: 167,
    name: "The Clockmaker of Wend",
    cause: "Ran out of time",
    details: "Every clock in the shop stopped at once.",
    penName: "Tick",
    candles: 33,
  },
  {
    id: "SeedGhostA",
    source: "notebook",
    blurName: true,
    views: 96,
    name: "Agatha Wrenfield",
    cause: "Tripped over a lie she told",
    time: "Sunday, after supper",
    penName: "Nobody",
    candles: 11,
  },
  {
    id: "SeedGhostB",
    source: "notebook",
    blurName: true,
    views: 58,
    name: "Theodric Gale",
    cause: "Lost in his own maze",
    details: "He built it to keep others out.",
    candles: 5,
  },
  {
    id: "SeedOrchrd",
    source: "public",
    blurName: false,
    views: 142,
    name: "Old Man Pellow",
    cause: "Fell asleep in the orchard and never woke",
    details: "The apples kept falling around him.",
    penName: "A grey raven",
    candles: 24,
  },
  {
    id: "SeedWrenHa",
    source: "public",
    blurName: false,
    views: 121,
    name: "Wren Halloway",
    cause: "Danced until dawn and then a little longer",
    penName: "Pianist",
    candles: 18,
  },
  {
    id: "SeedGhostC",
    source: "notebook",
    blurName: true,
    views: 73,
    name: "Mortimer Quill",
    cause: "Ink poisoning",
    time: "While signing the last page",
    penName: "Scribe",
    candles: 9,
  },
  {
    id: "SeedCaptMB",
    source: "public",
    blurName: false,
    views: 88,
    name: "Captain Morrow Black",
    cause: "Went down with a ship made of paper",
    time: "In the third storm of winter",
    penName: "Deckhand",
    candles: 12,
  },
  {
    id: "SeedLantrn",
    source: "notebook",
    blurName: false,
    views: 64,
    name: "The Lantern Thief",
    cause: "Lost in a library with no exits",
    details: "Wandered the stacks until every candle burned out.",
    candles: 7,
  },
];

async function main() {
  // Oldest first, a few hours apart, ending about a day ago.
  for (const [i, e] of OPEN_BOOK.entries()) {
    const id = `seed_public_${String(i + 1).padStart(2, "0")}`;
    const data = {
      name: e.name,
      cause: e.cause ?? null,
      details: e.details ?? null,
      time: e.time ?? null,
      penName: e.penName ?? null,
      candles: e.candles,
      createdAt: ago(OPEN_BOOK.length - i, i * 3),
    };
    await db.publicEntry.upsert({
      where: { id },
      update: data,
      create: { id, ...data, ownerHash: orphan(), ipHash: SEED_VISITOR },
    });
  }

  for (const [i, s] of SHARED.entries()) {
    const { id, ...rest } = s;
    const data = {
      name: rest.name,
      cause: rest.cause ?? null,
      details: rest.details ?? null,
      time: rest.time ?? null,
      penName: rest.penName ?? null,
      blurName: rest.blurName,
      source: rest.source,
      candles: rest.candles,
      views: rest.views,
      createdAt: ago(SHARED.length - i, 5),
    };
    await db.sharedNote.upsert({
      where: { id },
      update: data,
      create: { id, ...data, ownerHash: orphan(), ipHash: SEED_VISITOR },
    });
  }

  console.log(`Seeded ${OPEN_BOOK.length} Open Book entries and ${SHARED.length} shared pages.`);
}

main()
  .catch((e: unknown) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
