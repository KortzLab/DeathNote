"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 text-center">
      <h1 className="title-ember text-5xl">The ink spilled.</h1>
      <p className="text-muted mt-4 font-serif">Something went wrong while turning this page.</p>
      <button type="button" onClick={reset} className="btn-seal mt-8">
        Try again
      </button>
    </div>
  );
}
