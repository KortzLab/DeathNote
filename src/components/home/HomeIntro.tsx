import Link from "next/link";

// Plain, crawlable copy under the 3D scene. The intro is a canvas, so without this the home
// page would have almost no text for search engines (or screen readers) to work with.
const STEPS = [
  {
    href: "/notebook",
    title: "Write in your own notebook",
    body: "Type a name and watch the ink bleed into the page. A forty-second clock starts; add a cause and the circumstances before it runs out. Pages save in your browser, or to your account.",
  },
  {
    href: "/rules",
    title: "Learn how to use it",
    body: "Eighteen original rules explain names and faces, the forty seconds, causes and what the notebook refuses to do. They write themselves as you scroll.",
  },
  {
    href: "/public",
    title: "Leave a name in the Open Book",
    body: "One shared notebook with unlimited pages. Everything written there stays in ink for every visitor, and any page can be shared as a link with its own preview.",
  },
] as const;

export function HomeIntro() {
  return (
    <section aria-labelledby="home-intro" className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
      <p className="text-muted font-serif text-xs tracking-[0.4em] uppercase">
        An interactive fan notebook
      </p>
      <h2 id="home-intro" className="title-ember mt-2 text-4xl sm:text-5xl">
        Write in the Death Note, online
      </h2>
      <p className="text-muted mt-4 max-w-3xl">
        A free, browser-based Death Note: a black notebook falls out of the sky, you open it, read
        its rules and write in ink. No download and no sign-up. Everything is fiction, and the site
        is an unofficial fan project.
      </p>
      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {STEPS.map((s) => (
          <li key={s.href} className="border-smoke bg-abyss/70 rounded-2xl border p-6">
            <h3 className="font-gothic text-bone text-2xl">
              <Link href={s.href} className="hover:underline">
                {s.title}
              </Link>
            </h3>
            <p className="text-muted mt-3 text-sm leading-relaxed">{s.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
