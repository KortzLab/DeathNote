// Original wording. Do not paste rule text from the manga/anime here.

export type Rule = { numeral: string; title: string; body: string };
export type RuleLanguage = "en";

export const LANGUAGES: Array<{ code: RuleLanguage | "ja"; label: string; available: boolean }> = [
  { code: "en", label: "English", available: true },
  { code: "ja", label: "日本語", available: false },
];

const en: Rule[] = [
  {
    numeral: "I",
    title: "Of names and faces",
    body: "Whosoever has their true name set down in these pages, while the hand that writes holds their face in mind, shall die. A name without a face is only ink, and the notebook lets it dry.",
  },
  {
    numeral: "II",
    title: "Of the forty seconds",
    body: "If no cause is written, the named one's heart shall simply stop. The notebook keeps its own clock: forty seconds after the final stroke of the name.",
  },
  {
    numeral: "III",
    title: "Of causes and circumstance",
    body: "A cause written within those forty seconds binds the death to it. The writer may then describe the circumstances, and the notebook will bend the world gently to make them so.",
  },
  {
    numeral: "IV",
    title: "Of the impossible",
    body: "The notebook will not command what cannot be. Places the named could never reach, deeds they could never do, are quietly struck from the record, and the heart is chosen instead.",
  },
  {
    numeral: "V",
    title: "Of true names",
    body: "Nicknames, titles, borrowed names and lies carry no weight here. The notebook knows each soul by one name only, and it does not answer to anything else.",
  },
  {
    numeral: "VI",
    title: "Of what is written",
    body: "What has been written cannot be unwritten. Erasers, knives, water and flame change the page, never the outcome.",
  },
  {
    numeral: "VII",
    title: "Of ink, blood and graphite",
    body: "Any mark will do. Ink, graphite, ash, even blood. A torn page, a single scrap, carries the full weight of the whole book.",
  },
  {
    numeral: "VIII",
    title: "Of tongues",
    body: "The notebook reads every language living or dead, so long as the hand that writes is certain of what it means.",
  },
  {
    numeral: "IX",
    title: "Of possession",
    body: "The notebook belongs to whoever holds it once it has fallen into the world of the living. It does not care how it came to them.",
  },
  {
    numeral: "X",
    title: "Of the bound shinigami",
    body: "Every notebook drags a shinigami behind it. Whoever touches the book will see its keeper and hear its voice, whether they wish to or not.",
  },
  {
    numeral: "XI",
    title: "Of the watcher's oath",
    body: "The bound shinigami will follow the owner until the end. It will neither save nor condemn them. It watches, it is entertained, and it waits.",
  },
  {
    numeral: "XII",
    title: "Of relinquishing",
    body: "An owner may give the notebook up. When they do, every memory of its pages leaves with it, like a dream forgotten before breakfast.",
  },
  {
    numeral: "XIII",
    title: "Of the appointed hour",
    body: "A time may be named for the death, but the notebook is impatient. It will not wait longer than one full turning of the moon.",
  },
  {
    numeral: "XIV",
    title: "Of bargains",
    body: "The shinigami may offer a bargain. Listen carefully: every bargain costs more than it says, and the price is always paid in time.",
  },
  {
    numeral: "XV",
    title: "Of the ledger",
    body: "Whoever writes in these pages will one day be written. The notebook keeps its own ledger, and no one has ever balanced it.",
  },
  {
    numeral: "XVI",
    title: "Of restless pages",
    body: "A notebook left unwritten grows restless. Its pages turn on their own, and in the margins something whispers names it would like to learn.",
  },
  {
    numeral: "XVII",
    title: "Of red fruit",
    body: "The keeper of this notebook can be soothed. It is especially fond of red apples, and it never forgets who fed it.",
  },
  {
    numeral: "XVIII",
    title: "Of this notebook",
    body: "This notebook binds only fiction. Real names belong to real lives: never write them in anger, and never use these pages to frighten anyone.",
  },
];

export const RULES: Record<RuleLanguage, Rule[]> = { en };
