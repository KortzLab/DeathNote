import type { Metadata } from "next";
import { PublicBook } from "@/components/public/PublicBook";
import { publicStats } from "@/lib/server/public";

export const metadata: Metadata = {
  title: "The Open Book",
  description: "One notebook shared by everyone. Write a fictional name; it stays in ink.",
  // Entries are user-written and may be removed after review; keep them out of search indexes.
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function PublicBookPage() {
  const stats = await publicStats().catch(() => ({ total: 0, today: 0, pages: 1 }));
  return <PublicBook initialStats={stats} />;
}
