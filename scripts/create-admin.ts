// Creates the admin account, or resets its password. Run it on the server, never on a shared
// machine:
//   npm run admin:create -- you@example.com
// The e-mail must be listed in ADMIN_EMAILS. The password is typed at a hidden prompt (or piped
// on stdin); it is never printed, logged or stored anywhere but as an argon2id hash.
import "dotenv/config";
import { createInterface } from "node:readline";
import { hash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { parseAdminEmails } from "../src/lib/auth/role.ts";

const MIN_LENGTH = 8;

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

/** Reads one line; on a terminal, nothing typed is echoed. */
function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    const tty = process.stdin.isTTY;
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: tty });
    if (tty) {
      // Swallow echoed keystrokes; only the prompt itself is written.
      const write = (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput;
      (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s) => {
        if (s.includes(question)) write.call(rl, question);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (tty) process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function main() {
  const email = (process.argv[2] ?? "").trim().toLowerCase();
  if (!email) fail("Usage: npm run admin:create -- you@example.com");
  if (!parseAdminEmails(process.env.ADMIN_EMAILS).includes(email)) {
    fail("That e-mail is not in ADMIN_EMAILS. Add it to the environment first.");
  }
  if (!process.env.DATABASE_URL) fail("DATABASE_URL is not set.");

  const password = await ask("New admin password: ");
  if (password.length < MIN_LENGTH) fail(`Use at least ${MIN_LENGTH} characters.`);
  if (process.stdin.isTTY && (await ask("Repeat it: ")) !== password) {
    fail("The passwords did not match.");
  }

  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  const passwordHash = await hash(password, { memoryCost: 19456, timeCost: 2, parallelism: 1 });
  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  await db.user.upsert({
    where: { email },
    // The role column is what the site trusts; only this script ever sets it.
    create: { email, passwordHash, role: "ADMIN" },
    update: { passwordHash, role: "ADMIN" },
  });
  await db.$disconnect();
  // If someone else registered this e-mail earlier, their password is gone now, and sessions
  // signed in before this change no longer pass the admin check.
  console.log(existing ? "Admin password reset." : "Admin account created.");
}

main().catch(() => fail("Could not create the admin account."));
