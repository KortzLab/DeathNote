import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 text-center">
      <p className="text-muted font-serif text-xs tracking-[0.5em] uppercase">404</p>
      <h1 className="title-ember mt-4 max-w-2xl text-5xl sm:text-6xl">
        This name was not found in the notebook.
      </h1>
      <p className="text-muted mt-6 max-w-md font-serif italic">
        Perhaps it was never written. Perhaps the page was torn out.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-seal">
          Return to the void
        </Link>
        <Link href="/notebook" className="btn-ghost">
          Open the notebook
        </Link>
      </div>
    </div>
  );
}
