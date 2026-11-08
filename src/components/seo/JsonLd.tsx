import { jsonLd } from "@/lib/seo";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Structured data must be inline JSON; jsonLd() escapes "<".
      dangerouslySetInnerHTML={jsonLd({ "@context": "https://schema.org", ...data })}
    />
  );
}
