import type { Metadata } from "next";
import { Prose } from "@/components/ui/Prose";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What the notebook stores, where, and for how long.",
};

export default function PrivacyPage() {
  return (
    <Prose eyebrow="Privacy" title="What the notebook keeps">
      <p className="text-muted text-base">Last updated: November 2026</p>

      <h2 className="font-gothic text-bone text-3xl">As a guest</h2>
      <p>
        Without an account, everything you write stays in your own browser (localStorage). It never
        reaches our servers. Clearing your browser data erases it.
      </p>

      <h2 className="font-gothic text-bone text-3xl">With an account</h2>
      <p>
        When you sign in, your notes are stored in our database so they can sync across your
        devices. Notes are private: only you can read them. There is no public feed of names. Your
        password is stored only as an argon2id hash.
      </p>
      <p>
        Deleted notes are hidden immediately and kept briefly as a soft delete so mistakes can be
        recovered; ask us to remove your account and its notes entirely at any time.
      </p>

      <h2 className="font-gothic text-bone text-3xl">Sponsorships</h2>
      <p>
        If you sponsor, payment is handled by OxaPay. We store the amount, status, the OxaPay
        reference and the optional name and message you provide. Your name appears on the supporters
        page only if you tick the box to show it. Amounts are never shown publicly.
      </p>

      <h2 className="font-gothic text-bone text-3xl">Cookies and storage</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>A session cookie when you are signed in (Auth.js)</li>
        <li>localStorage for guest notes, your sound preference and the lighter-mode toggle</li>
        <li>No advertising or third-party tracking scripts</li>
      </ul>

      <h2 className="font-gothic text-bone text-3xl">Contact</h2>
      <p>
        Questions or deletion requests: Discord{" "}
        <span className="text-bone">{SITE.credits.discord}</span> or via{" "}
        <a
          className="text-ember hover:underline"
          href={SITE.credits.builtBy.href}
          rel="noopener"
          target="_blank"
        >
          {SITE.credits.builtBy.label}
        </a>
        .
      </p>
    </Prose>
  );
}
