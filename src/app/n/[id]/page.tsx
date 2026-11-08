import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { db } from "@/lib/db";
import { sharedNote } from "@/lib/server/public";
import { SHARE_ID } from "@/lib/public/shared";
import { PaperCard } from "@/components/public/PaperCard";
import { ItemActions } from "@/components/public/ItemActions";
import { InkLink } from "@/components/ui/InkLink";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

async function load(id: string) {
  return SHARE_ID.test(id) ? sharedNote(id) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const note = await load(id);
  if (!note) return { title: "Page not found" };

  const title = `${note.name ?? "A name, blotted out"} — a page from the Death Note`;
  const description =
    [note.cause, note.time].filter(Boolean).join(" · ") || "A page torn from the notebook.";

  // Spell out the share tags: otherwise the layout's site-wide title and URL leak into
  // link previews. The images come from opengraph-image.tsx / twitter-image.tsx here.
  return {
    title,
    description,
    alternates: { canonical: `/n/${id}` },
    openGraph: { type: "article", title, description, url: `/n/${id}`, siteName: "Death Note" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: false, follow: true },
  };
}

export default async function SharedNotePage({ params }: Props) {
  const { id } = await params;
  const note = await load(id);
  if (!note) notFound();

  // Count the view after the response is sent; it never slows the page down.
  after(() =>
    db.sharedNote.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {}),
  );

  return (
    <div className="mx-auto max-w-2xl px-4 pt-28 pb-16">
      <p className="text-muted text-center font-serif text-xs tracking-[0.4em] uppercase">
        {note.source === "public"
          ? "A page from the open book"
          : "A page torn from someone's notebook"}
      </p>

      <PaperCard note={note} size="lg" animate className="mt-6 -rotate-1" />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <ItemActions type="shared_note" id={id} candles={note.candles} tone="dark" />
        <p className="text-muted text-xs">
          {note.views.toLocaleString("en-US")} {note.views === 1 ? "view" : "views"}
        </p>
      </div>

      <div className="border-smoke mt-12 border-t pt-8 text-center">
        <p className="font-scrawl text-bone text-xl" style={{ filter: "url(#ink-bleed)" }}>
          your turn
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <InkLink href="/public" className="btn-seal">
            Write in the open book
          </InkLink>
          <InkLink href="/notebook" className="btn-ghost">
            Keep your own notebook
          </InkLink>
        </div>
      </div>
    </div>
  );
}
