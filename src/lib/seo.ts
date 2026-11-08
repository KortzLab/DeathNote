import type { Metadata } from "next";
import { SITE } from "@/lib/site";

// Search-intent keywords the site is built around. No volume data exists for these exact
// phrases, so they follow what people type: "death note online", "write in death note", etc.
export const KEYWORDS = [
  "death note",
  "death note online",
  "write in death note",
  "death note website",
  "interactive death note",
  "death note notebook",
  "death note rules",
  "how to use the death note",
  "death note simulator",
  "shinigami",
  "anime notebook",
  "death note fan project",
];

type PageSeo = {
  /** Full title; kept under ~60 characters so search results don't truncate it. */
  title: string;
  /** 120–160 characters reads best in results. */
  description: string;
  path: `/${string}`;
  keywords?: string[];
  noindex?: boolean;
};

/**
 * Every page sets its own canonical, Open Graph and Twitter tags. Without this, pages inherit
 * the layout's og:title and og:url, so links to /rules would preview as the home page.
 */
// A page that sets its own openGraph replaces the layout's, file-based image included, so
// point at the root preview image explicitly.
const SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Death Note — a dark, cinematic notebook",
};

export function pageMetadata({
  title,
  description,
  path,
  keywords = [],
  noindex,
}: PageSeo): Metadata {
  return {
    title: { absolute: title },
    description,
    keywords: [...keywords, ...KEYWORDS],
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      url: path,
      images: [SHARE_IMAGE],
      title,
      description,
      locale: "en_US",
    },
    twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Serialise JSON-LD safely: escape "<" so user text can never close the script tag. */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

export const organization = {
  "@type": "Organization",
  "@id": "https://kortzlab.pro/#org",
  name: "KortzLab",
  url: "https://kortzlab.pro",
  sameAs: [SITE.repo.replace(/\/[^/]+$/, "")],
};

export const website = {
  "@type": "WebSite",
  "@id": `${SITE.url}/#website`,
  name: SITE.name,
  alternateName: "Death Note Online",
  url: SITE.url,
  inLanguage: "en",
  publisher: { "@id": organization["@id"] },
};
