import type { Metadata } from "next";
import { NotebookApp } from "@/components/notebook/NotebookApp";

export const metadata: Metadata = {
  title: "The Notebook",
  description:
    "Write in the notebook. Your entries are private and stay in your browser or your account.",
};

export default function NotebookPage() {
  return (
    <>
      <h1 className="sr-only">The Notebook</h1>
      <NotebookApp />
    </>
  );
}
