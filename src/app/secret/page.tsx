import type { Metadata } from "next";
import { InkLink } from "@/components/ui/InkLink";

export const metadata: Metadata = {
  title: "The keeper's page",
  robots: { index: false, follow: false },
};

export default function SecretPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-28 pb-16">
      <article className="paper torn-right relative rounded-l-md p-8 shadow-2xl sm:p-12">
        <p
          className="font-scrawl text-ink -rotate-2 text-2xl"
          style={{ filter: "url(#ink-bleed)" }}
        >
          the keeper&apos;s page
        </p>
        <h1 className="font-gothic text-ink mt-4 text-5xl">You fed me.</h1>
        <div className="font-hand text-ink mt-6 space-y-4 text-2xl leading-9">
          <p>Heh. Few think to bring fruit. Most bring only questions.</p>
          <p>
            Since you were generous, a few things the rules forget to mention: the notebook prefers
            fiction, the candle burns brighter when you hurry, and the margins are never as empty as
            they look.
          </p>
          <p>
            One more secret. Somewhere in the human world there is a sequence: up, up, down, down,
            left, right, left, right… and then two letters. Press it, and you will see names the way
            I do.
          </p>
        </div>
        <ul className="text-ink/70 mt-8 space-y-1 font-serif text-sm">
          <li>Apples received: one more than yesterday</li>
          <li>Humans who noticed the apple: very few</li>
          <li>Boredom level: briefly lower</li>
        </ul>
        <div className="mt-10 flex flex-wrap gap-4">
          <InkLink href="/notebook" className="btn-seal">
            Back to the notebook
          </InkLink>
          <InkLink
            href="/rules"
            className="border-ink/30 text-ink hover:border-ink rounded-full border px-4 py-2 font-serif"
          >
            Read the rules again
          </InkLink>
        </div>
      </article>
    </div>
  );
}
