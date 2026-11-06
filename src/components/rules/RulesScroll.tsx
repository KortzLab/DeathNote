"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { LANGUAGES, RULES, type RuleLanguage } from "@/content/rules";
import { InkLink } from "@/components/ui/InkLink";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function RulesScroll() {
  const [lang, setLang] = useState<RuleLanguage>("en");
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const rules = RULES[lang];

  useGSAP(
    () => {
      if (reduced) {
        gsap.utils.toArray<HTMLElement>(".rule").forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            duration: 0.8,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });
        return;
      }

      gsap.from(".rules-hero-char", {
        opacity: 0,
        y: () => gsap.utils.random(-8, 8),
        rotate: () => gsap.utils.random(-12, 12),
        filter: "blur(6px)",
        stagger: 0.06,
        duration: 0.9,
        ease: "power3.out",
      });

      gsap.utils.toArray<HTMLElement>(".rule").forEach((el) => {
        const text = el.querySelector<HTMLElement>(".rule-text");
        const numeral = el.querySelector(".rule-numeral");
        const stroke = el.querySelector(".rule-stroke");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top 78%",
            end: "bottom 60%",
            scrub: 0.6,
            // One CSS var per rule instead of ~30 tweens per rule; per-word tweens cost ~900ms TBT.
            onUpdate: (self) => text?.style.setProperty("--p", self.progress.toFixed(3)),
          },
        });
        tl.fromTo(
          numeral,
          { opacity: 0, scale: 1.6, filter: "blur(10px)" },
          { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.3, ease: "power2.out" },
        ).fromTo(stroke, { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "none" }, 0.1);
      });

      gsap.to(".rules-sigil", {
        yPercent: -40,
        rotate: 40,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });
    },
    { scope: root, dependencies: [reduced, lang], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="relative">
      <div
        aria-hidden
        className="rules-sigil border-bone/10 pointer-events-none fixed top-1/4 -right-32 h-[60vh] w-[60vh] rounded-full border"
      />
      <div
        aria-hidden
        className="rules-sigil border-bone/5 pointer-events-none fixed top-2/3 -left-40 h-[40vh] w-[40vh] rounded-full border"
      />

      <header className="flex min-h-[90dvh] flex-col items-center justify-center px-4 pt-24 text-center">
        <p className="text-muted font-serif text-xs tracking-[0.5em] uppercase">
          The rules of the notebook
        </p>
        <h1
          className="font-scrawl text-bone mt-6 -rotate-2 text-5xl sm:text-7xl"
          style={{ filter: "url(#ink-bleed)" }}
          aria-label="How to use it"
        >
          {Array.from("HOW TO USE IT").map((ch, i) => (
            <span key={i} aria-hidden className="rules-hero-char inline-block whitespace-pre">
              {ch}
            </span>
          ))}
        </h1>
        <div className="mt-10 flex items-center gap-2" role="group" aria-label="Language">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              disabled={!l.available}
              aria-pressed={lang === l.code}
              onClick={() => l.available && setLang(l.code as RuleLanguage)}
              className={`rounded-full border px-3 py-1 text-xs tracking-widest uppercase ${
                lang === l.code ? "border-ember text-ember" : "border-smoke text-muted"
              } disabled:opacity-40`}
              title={l.available ? undefined : "Coming later"}
            >
              {l.label}
              {!l.available && " · soon"}
            </button>
          ))}
        </div>
        <p className="text-muted mt-16 animate-bounce font-serif text-sm italic">
          Scroll, and the rules will write themselves.
        </p>
      </header>

      <ol className="mx-auto max-w-3xl space-y-[28vh] px-6 pb-[20vh]">
        {rules.map((rule) => (
          <li key={rule.numeral} className="rule relative">
            <div className="flex items-end gap-4">
              <span className="rule-numeral font-gothic text-bone text-6xl drop-shadow-[0_0_18px_rgba(220,235,245,0.25)] sm:text-7xl">
                {rule.numeral}
              </span>
              <h2 className="text-muted pb-2 font-serif text-lg tracking-[0.2em] uppercase">
                {rule.title}
              </h2>
            </div>
            <span
              aria-hidden
              className="rule-stroke from-bone via-bone/40 mt-2 block h-[3px] w-full origin-left rounded-full bg-gradient-to-r to-transparent"
            />
            <p
              className="rule-text text-bone mt-6 font-serif text-2xl leading-relaxed sm:text-3xl"
              style={
                {
                  "--n": rule.body.split(" ").length,
                  "--p": reduced ? 1 : 0,
                } as React.CSSProperties
              }
            >
              <span className="sr-only">{rule.body}</span>
              {rule.body.split(" ").map((w, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="rule-word inline-block"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  {w}&nbsp;
                </span>
              ))}
            </p>
          </li>
        ))}
      </ol>

      <section className="flex min-h-[60dvh] flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="font-scrawl text-bone text-3xl" style={{ filter: "url(#ink-bleed)" }}>
          Now you know.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <InkLink href="/notebook" className="btn-seal">
            Write in the notebook
          </InkLink>
          <InkLink href="/" className="btn-ghost">
            Watch it fall again
          </InkLink>
        </div>
      </section>
    </div>
  );
}
