import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { NotebookApp } from "@/components/notebook/NotebookApp";

export const metadata: Metadata = pageMetadata({
  title: "Write in the Death Note — Your Private Notebook",
  description:
    "Write a name in your own Death Note. Ink bleeds in, a 40-second clock starts and the page saves to your browser or your account. Free, no sign-up needed.",
  path: "/notebook",
  keywords: ["write a name in the death note", "death note writing", "death note 40 seconds"],
});

export default function NotebookPage() {
  return (
    <>
      <h1 className="sr-only">The Notebook</h1>
      <NotebookApp />
    </>
  );
}
