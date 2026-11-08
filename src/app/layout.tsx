import type { Metadata, Viewport } from "next";
import "./globals.css";
import { gothic, hand, scrawl, serif } from "@/app/fonts";
import { AppProviders } from "@/components/providers/AppProviders";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SvgDefs } from "@/components/fx/SvgDefs";
import { GothicBackdrop } from "@/components/fx/GothicBackdrop";
import { SponsorModal } from "@/components/sponsor/SponsorModal";
import { ShareDialog } from "@/components/public/ShareDialog";
import { ReportDialog } from "@/components/public/ReportDialog";
import { SponsorTrigger } from "@/components/sponsor/SponsorTrigger";
import { isOxapayEnabled } from "@/lib/env";
import { SITE } from "@/lib/site";
import { KEYWORDS, organization, website } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

const HOME_TITLE = "Death Note Online — Write in the Interactive Notebook";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: HOME_TITLE, template: "%s · Death Note" },
  description: SITE.description,
  applicationName: "Death Note",
  authors: [{ name: "h4sib.pro", url: "https://h4sib.pro" }],
  creator: "h4sib.pro",
  publisher: "KortzLab",
  category: "entertainment",
  keywords: KEYWORDS,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Death Note",
    locale: "en_US",
    title: HOME_TITLE,
    description: SITE.description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: HOME_TITLE, description: SITE.description },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  // Set these in the hosting environment to verify the site in Search Console / Bing.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const sponsorEnabled = isOxapayEnabled();
  return (
    <html
      lang="en"
      className={`${gothic.variable} ${serif.variable} ${hand.variable} ${scrawl.variable}`}
      suppressHydrationWarning
    >
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <JsonLd data={{ "@graph": [organization, website] }} />
        <SvgDefs />
        <GothicBackdrop />
        <div aria-hidden className="grain" />
        <AppProviders>
          <Header sponsorEnabled={sponsorEnabled} />
          <main id="main" className="relative z-10">
            {children}
          </main>
          <Footer />
          <ShareDialog />
          <ReportDialog />
          {sponsorEnabled && (
            <>
              <SponsorTrigger variant="floating" />
              <SponsorModal />
            </>
          )}
        </AppProviders>
      </body>
    </html>
  );
}
