import type { Metadata } from "next";
import { Intro } from "@/components/intro/Intro";
import { HomeFeed } from "@/components/home/HomeFeed";
import { HomeIntro } from "@/components/home/HomeIntro";
import { JsonLd } from "@/components/seo/JsonLd";
import { organization, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Death Note Online — Write in the Interactive Notebook",
  description: SITE.description,
  path: "/",
  keywords: ["death note 3d", "free death note online"],
});

// Re-render at most every 30s so new shares show up without hitting the DB on every visit.
export const revalidate = 30;

const app = {
  "@type": "WebApplication",
  name: "Death Note Online",
  url: SITE.url,
  description: SITE.description,
  applicationCategory: "EntertainmentApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires a browser with WebGL",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Person", name: "h4sib.pro", url: "https://h4sib.pro" },
  publisher: { "@id": organization["@id"] },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={app} />
      <Intro />
      <HomeIntro />
      <HomeFeed />
    </>
  );
}
