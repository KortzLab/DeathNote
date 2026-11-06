import type { Metadata } from "next";
import { RulesScroll } from "@/components/rules/RulesScroll";

export const metadata: Metadata = {
  title: "Rules — How to use it",
  description:
    "Eighteen original rules of the notebook, written in a dark, legalistic, gothic tone. Scroll and watch them write themselves.",
};

export default function RulesPage() {
  return <RulesScroll />;
}
