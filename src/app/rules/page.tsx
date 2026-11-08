import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { RulesScroll } from "@/components/rules/RulesScroll";
import { JsonLd } from "@/components/seo/JsonLd";
import { RULES } from "@/content/rules";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Death Note Rules — How to Use the Notebook",
  description:
    "How to use the Death Note: eighteen original rules on names, faces, the forty seconds and causes of death, written in ink as you scroll. A fan-made rulebook.",
  path: "/rules",
  keywords: ["death note rules list", "death note how to use", "death note 40 second rule"],
});

export default function RulesPage() {
  return (
    <>
      <JsonLd
        data={{
          "@type": "ItemList",
          name: "Rules of the Death Note",
          url: `${SITE.url}/rules`,
          numberOfItems: RULES.en.length,
          itemListElement: RULES.en.map((r, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `Rule ${r.numeral}: ${r.title}`,
            description: r.body,
          })),
        }}
      />
      <RulesScroll />
    </>
  );
}
