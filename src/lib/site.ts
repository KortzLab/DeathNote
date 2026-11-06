export const SITE = {
  name: "Death Note",
  tagline: "Every name is a door. Some only open once.",
  description:
    "A dark, cinematic, interactive notebook. Open the cursed book, read its rules and write in ink. An unofficial fan-inspired art project.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  repo: "https://github.com/KortzLab/DeathNote",
  credits: {
    builtBy: { label: "h4sib.pro", href: "https://h4sib.pro" },
    poweredBy: { label: "kortzlab.pro", href: "https://kortzlab.pro" },
    social: "hasibwth",
    discord: "kirawth",
  },
  disclaimer:
    "Unofficial fan project. Not affiliated with the creators or publishers of Death Note.",
  safety: "For fiction and fun only. Don't use this to threaten or harass real people.",
} as const;

export const NAV = [
  { href: "/notebook", label: "The Notebook" },
  { href: "/rules", label: "Rules" },
  { href: "/supporters", label: "Supporters" },
  { href: "/about", label: "About" },
] as const;
