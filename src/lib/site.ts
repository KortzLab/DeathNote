export const LIVE_URL = "https://deathnote.kortzlab.pro";

function defaultUrl() {
  return process.env.NODE_ENV === "production" ? LIVE_URL : "http://localhost:3000";
}

export const SITE = {
  name: "Death Note",
  tagline: "Every name is a door. Some only open once.",
  description:
    "Write in the Death Note online: a free, interactive 3D notebook. Watch it fall, learn its rules, write a name in ink and share the page. Unofficial fan project.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || defaultUrl()).replace(/\/$/, ""),
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
  { href: "/public", label: "Open Book" },
  { href: "/rules", label: "Rules" },
  { href: "/supporters", label: "Supporters" },
  { href: "/about", label: "About" },
] as const;
