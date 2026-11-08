import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PublicBook } from "@/components/public/PublicBook";
import { publicStats } from "@/lib/server/public";

export const metadata: Metadata = pageMetadata({
  title: "The Open Book — A Public Death Note Anyone Can Write In",
  description:
    "One shared Death Note with unlimited pages. Write a fictional name, add a cause and pen name, and it stays in ink for every visitor to read.",
  path: "/public",
  // Entries are user-written and may be removed after review; keep them out of search indexes.
  noindex: true,
});

export const dynamic = "force-dynamic";

export default async function PublicBookPage() {
  const stats = await publicStats().catch(() => ({ total: 0, today: 0, pages: 1 }));
  return <PublicBook initialStats={stats} />;
}
