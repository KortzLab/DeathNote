import NextAuth, { type NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { hash, verify } from "@node-rs/argon2";
import { db } from "@/lib/db";
import { credentialsSchema } from "@/lib/validation/auth";
import { adminEmails } from "@/lib/env";
import { rateLimit } from "@/lib/server/rate-limit";

// Verifying against a throwaway hash for unknown e-mails keeps response timing uniform.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= hash(crypto.randomUUID()));

const providers: Provider[] = [];

providers.push(
  Credentials({
    id: "credentials",
    name: "E-mail",
    credentials: {
      email: { label: "E-mail", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) return null;
      const { email, password } = parsed.data;

      const limited = await rateLimit(`login:${email}`, 10, 15 * 60);
      if (!limited.ok) return null;

      const user = await db.user.findUnique({ where: { email } });
      const ok = await verify(user?.passwordHash ?? (await getDummyHash()), password).catch(
        () => false,
      );
      if (!user || !user.passwordHash || !ok) return null;
      return { id: user.id, email: user.email, name: user.name, image: user.image };
    },
  }),
);

export const authConfig = {
  adapter: PrismaAdapter(db),
  // JWT sessions are required for the credentials (e-mail/password) provider.
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers,
  pages: { signIn: "/signin" },
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      if (user?.email || token.email) {
        const email = (user?.email ?? token.email ?? "").toLowerCase();
        token.role = adminEmails().includes(email) ? "ADMIN" : "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      session.user.role = token.role === "ADMIN" ? "ADMIN" : "USER";
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
