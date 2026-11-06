import Link from "next/link";
import { SITE } from "@/lib/site";

export function Footer() {
  const { credits } = SITE;
  return (
    <footer className="no-print border-smoke/60 bg-void/80 relative z-10 mt-24 border-t">
      <div className="text-muted mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm sm:px-6 md:grid-cols-3">
        <div className="space-y-2">
          <p className="font-gothic text-bone text-2xl">Death Note</p>
          <p className="italic">{SITE.safety}</p>
        </div>

        <div className="space-y-2">
          <p>
            Built by{" "}
            <a
              className="text-bone hover:text-ember underline-offset-4 hover:underline"
              href={credits.builtBy.href}
              rel="noopener"
              target="_blank"
            >
              {credits.builtBy.label}
            </a>
          </p>
          <p>
            Powered by{" "}
            <a
              className="text-bone hover:text-ember underline-offset-4 hover:underline"
              href={credits.poweredBy.href}
              rel="noopener"
              target="_blank"
            >
              {credits.poweredBy.label}
            </a>
          </p>
          <p>
            Social: <span className="text-bone">{credits.social}</span> · Discord:{" "}
            <span className="text-bone">{credits.discord}</span>
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap content-start gap-x-5 gap-y-2">
          <Link className="hover:text-bone" href="/about">
            About &amp; credits
          </Link>
          <Link className="hover:text-bone" href="/rules">
            Rules
          </Link>
          <Link className="hover:text-bone" href="/supporters">
            Supporters
          </Link>
          <Link className="hover:text-bone" href="/privacy">
            Privacy
          </Link>
          <Link className="hover:text-bone" href="/terms">
            Terms
          </Link>
          <a className="hover:text-bone" href={SITE.repo} rel="noopener" target="_blank">
            Source
          </a>
        </nav>
      </div>
      <p className="border-smoke/40 text-muted border-t px-4 py-4 text-center text-xs">
        {SITE.disclaimer}
      </p>
    </footer>
  );
}
