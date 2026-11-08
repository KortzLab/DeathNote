import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    /** When the password was last entered (ms since epoch). */
    authAt?: number;
    user: {
      id: string;
      role: "USER" | "ADMIN";
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: "USER" | "ADMIN";
    /** When the password was last entered (ms since epoch). */
    authAt?: number;
  }
}
