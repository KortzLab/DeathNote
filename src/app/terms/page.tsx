import type { Metadata } from "next";
import { Prose } from "@/components/ui/Prose";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "The rules for using this site (the human ones).",
};

export default function TermsPage() {
  return (
    <Prose eyebrow="Terms" title="The human rules">
      <p className="text-muted text-base">Last updated: November 2026</p>
      <ol className="list-decimal space-y-4 pl-6">
        <li>
          <strong className="text-bone">Fiction only.</strong> This notebook is an entertainment and
          art project. {SITE.safety}
        </li>
        <li>
          <strong className="text-bone">No harm.</strong> Do not write threats, harassment, hate
          speech or anyone&apos;s personal information (addresses, phone numbers, e-mails). The site
          blocks obvious cases and limits how fast you can write; accounts that abuse it may be
          removed.
        </li>
        <li>
          <strong className="text-bone">Your words are yours.</strong> You keep ownership of what
          you write. Your own notebook is private. What you write in the Open Book or choose to
          share is public; by publishing it you let us display it on this site. Fictional names
          only: entries naming real people are removed.
        </li>
        <li>
          <strong className="text-bone">Sponsorships are voluntary.</strong> They do not buy any
          feature or service. 70% of each sponsorship goes to charity. Crypto payments are processed
          by OxaPay and are generally non-refundable once confirmed on the network.
        </li>
        <li>
          <strong className="text-bone">As is.</strong> The site is provided without warranties. It
          may change, pause or disappear.
        </li>
        <li>
          <strong className="text-bone">Unofficial.</strong> {SITE.disclaimer}
        </li>
      </ol>
    </Prose>
  );
}
