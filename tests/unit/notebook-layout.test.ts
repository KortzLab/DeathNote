import { describe, expect, it } from "vitest";
import { bookLayout, groupByPage, tableOfContents } from "@/lib/notes/layout";
import { ENTRIES_PER_PAGE, type NoteRecord } from "@/lib/notes/types";
import { RULES } from "@/content/rules";

const note = (id: string, page: number): NoteRecord => ({
  id,
  page,
  name: id,
  cause: null,
  details: null,
  time: null,
  sealedAt: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
});

describe("notebook layout", () => {
  it("starts with one empty writing page", () => {
    const layout = bookLayout(groupByPage([]), RULES.en.length);
    expect(layout.writingPages).toBe(1);
    expect(layout.rulePages).toBe(6);
    // title + contents + 6 rule pages
    expect(layout.firstWritingIndex).toBe(8);
    expect(layout.currentWritingIndex).toBe(8);
  });

  it("opens a fresh page once the last one is full", () => {
    const full = Array.from({ length: ENTRIES_PER_PAGE }, (_, i) => note(`n${i}`, 1));
    expect(bookLayout(groupByPage(full), 18).writingPages).toBe(2);
    expect(bookLayout(groupByPage(full.slice(1)), 18).writingPages).toBe(1);
  });

  it("follows the highest page even with gaps", () => {
    const layout = bookLayout(groupByPage([note("a", 1), note("b", 4)]), 18);
    expect(layout.writingPages).toBe(4);
    expect(layout.currentWritingIndex).toBe(layout.firstWritingIndex + 3);
  });

  it("lists every rule page and the writing pages in the contents", () => {
    const layout = bookLayout(groupByPage([]), RULES.en.length);
    const toc = tableOfContents(RULES.en, layout);
    expect(toc[0]).toMatchObject({ label: "How to use it", target: 2 });
    expect(toc[1]?.label).toBe("Rules IV–VI");
    expect(toc.at(-1)).toMatchObject({ label: "Your names", target: layout.firstWritingIndex });
  });
});
