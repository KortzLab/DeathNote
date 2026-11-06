export function Prose({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-28 pb-16">
      <p className="text-muted font-serif text-xs tracking-[0.5em] uppercase">{eyebrow}</p>
      <h1 className="title-ember mt-3 text-5xl sm:text-6xl">{title}</h1>
      <div className="prose-dark mt-10 space-y-6 text-lg leading-relaxed">{children}</div>
    </div>
  );
}
