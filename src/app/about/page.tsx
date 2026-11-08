import type { Metadata } from "next";
import { Prose } from "@/components/ui/Prose";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About & credits",
  description: "Who made this notebook, how it was built, and the credits.",
};

export default function AboutPage() {
  const { credits } = SITE;
  return (
    <Prose eyebrow="About & credits" title="Who left this here?">
      <p>
        <strong className="text-bone">Death Note</strong> is an interactive art piece: a cursed
        black notebook you can open, read and write in. It is a love letter to a concept, built with
        original visuals, original rules and procedural effects. No official artwork, characters,
        logos or fonts are used.
      </p>

      <section
        aria-labelledby="credits"
        className="border-smoke bg-abyss/70 rounded-2xl border p-6"
      >
        <h2 id="credits" className="font-gothic text-bone text-3xl">
          Credits
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-muted text-xs tracking-widest uppercase">Built by</dt>
            <dd>
              <a
                className="text-ember hover:underline"
                href={credits.builtBy.href}
                rel="noopener"
                target="_blank"
              >
                {credits.builtBy.label}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-muted text-xs tracking-widest uppercase">Powered by</dt>
            <dd>
              <a
                className="text-ember hover:underline"
                href={credits.poweredBy.href}
                rel="noopener"
                target="_blank"
              >
                {credits.poweredBy.label}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-muted text-xs tracking-widest uppercase">Social</dt>
            <dd className="text-bone">{credits.social}</dd>
          </div>
          <div>
            <dt className="text-muted text-xs tracking-widest uppercase">Discord</dt>
            <dd className="text-bone">{credits.discord}</dd>
          </div>
        </dl>
      </section>

      <h2 className="font-gothic text-bone text-3xl">How it was made</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>Next.js App Router, TypeScript and Tailwind CSS</li>
        <li>Three.js through React Three Fiber for the falling book, curling pages and ash</li>
        <li>GSAP ScrollTrigger and Motion for the written rules and ink transitions</li>
        <li>PostgreSQL with Prisma, Auth.js for accounts, OxaPay for crypto sponsorships</li>
        <li>Every sound is synthesised in your browser; no recordings are shipped</li>
        <li>
          Fonts: UnifrakturCook, IM Fell English, Caveat and Homemade Apple (all SIL Open Font
          License)
        </li>
      </ul>

      <h2 className="font-gothic text-bone text-3xl">Safety</h2>
      <p>
        {SITE.safety} Your own notebook is private. The Open Book and shared pages are public, so
        every entry there can be reported, and reported entries are hidden for review.
      </p>
      <p>
        Found something that should not be here, or a security issue? Reach out on Discord (
        <span className="text-bone">{credits.discord}</span>) or through{" "}
        <a
          className="text-ember hover:underline"
          href={credits.builtBy.href}
          rel="noopener"
          target="_blank"
        >
          {credits.builtBy.label}
        </a>
        .
      </p>

      <p className="border-smoke text-muted border-t pt-6 text-base">{SITE.disclaimer}</p>
    </Prose>
  );
}
