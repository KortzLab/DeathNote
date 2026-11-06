import { ENTRIES_PER_PAGE, type NoteRecord } from "@/lib/notes/types";
import type { Rule } from "@/content/rules";

export const RULES_PER_PAGE = 3;

// Book order: title, contents, rule pages, then the user's writing pages.
const FIRST_RULES_INDEX = 2;

export type BookLayout = {
  rulePages: number;
  writingPages: number;
  /** book index of writing page 1 */
  firstWritingIndex: number;
  /** book index of the page you should be writing on */
  currentWritingIndex: number;
};

export function groupByPage(notes: NoteRecord[]): Map<number, NoteRecord[]> {
  const pages = new Map<number, NoteRecord[]>();
  for (const note of notes) {
    const page = pages.get(note.page);
    if (page) page.push(note);
    else pages.set(note.page, [note]);
  }
  return pages;
}

export function bookLayout(byPage: Map<number, NoteRecord[]>, ruleCount: number): BookLayout {
  const lastPage = Math.max(1, ...byPage.keys());
  const lastIsFull = (byPage.get(lastPage)?.length ?? 0) >= ENTRIES_PER_PAGE;
  const writingPages = lastIsFull ? lastPage + 1 : lastPage;
  const rulePages = Math.ceil(ruleCount / RULES_PER_PAGE);
  const firstWritingIndex = FIRST_RULES_INDEX + rulePages;
  return {
    rulePages,
    writingPages,
    firstWritingIndex,
    currentWritingIndex: firstWritingIndex + writingPages - 1,
  };
}

export function rulePageIndex(i: number) {
  return FIRST_RULES_INDEX + i;
}

export type TocEntry = { label: string; target: number; hint: string };

export function tableOfContents(rules: Rule[], layout: BookLayout): TocEntry[] {
  const chunks = Array.from({ length: layout.rulePages }, (_, i) =>
    rules.slice(i * RULES_PER_PAGE, (i + 1) * RULES_PER_PAGE),
  );

  const entries: TocEntry[] = [{ label: "How to use it", target: rulePageIndex(0), hint: "I" }];
  chunks.slice(1).forEach((chunk, i) => {
    const first = chunk[0]?.numeral ?? "";
    const last = chunk.at(-1)?.numeral ?? "";
    entries.push({
      label: `Rules ${first}–${last}`,
      target: rulePageIndex(i + 1),
      hint: String(rulePageIndex(i + 1) + 1),
    });
  });
  entries.push({ label: "Your names", target: layout.firstWritingIndex, hint: "1" });
  if (layout.writingPages > 1) {
    entries.push({
      label: "The latest page",
      target: layout.currentWritingIndex,
      hint: String(layout.writingPages),
    });
  }
  return entries;
}
