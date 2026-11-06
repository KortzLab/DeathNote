import type { Metadata, Viewport } from "next";
import "./globals.css";
import { gothic, hand, scrawl, serif } from "@/app/fonts";
import { AppProviders } from "@/components/providers/AppProviders";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SvgDefs } from "@/components/fx/SvgDefs";
import { GothicBackdrop } from "@/components/fx/GothicBackdrop";
import { SponsorModal } from "@/components/sponsor/SponsorModal";
import { SponsorTrigger } from "@/components/sponsor/SponsorTrigger";
import { isOxapayEnabled } from "@/lib/env";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Death Note — the cursed notebook", template: "%s · Death Note" },
  description: SITE.description,
  applicationName: "Death Note",
  authors: [{ name: "h4sib.pro", url: "https://h4sib.pro" }],
  creator: "h4sib.pro",
  publisher: "kortzlab.pro",
  keywords: [
    "death note",
    "notebook",
    "interactive",
    "threejs",
    "gsap",
    "animation",
    "fan project",
  ],
  openGraph: {
    type: "website",
    siteName: "Death Note",
    title: "Death Note — the cursed notebook",
    description: SITE.description,
    url: SITE.url,
  },
  twitter: { card: "summary_large_image", title: "Death Note", description: SITE.description },
  robots: { index: true, follow: true },
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
        <SvgDefs />
        <GothicBackdrop />
        <div aria-hidden className="grain" />
        <AppProviders>
          <Header sponsorEnabled={sponsorEnabled} />
          <main id="main" className="relative z-10">
            {children}
          </main>
          <Footer />
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
