import { InkText } from "@/components/notebook/InkText";

export type CardNote = {
  name: string | null;
  nameLength: number;
  cause: string | null;
  details?: string | null;
  time: string | null;
  penName: string | null;
  createdAt?: string;
};

/** An ink blot standing in for a hidden name. Same width as the name, nothing else. */
export function BlottedName({ length }: { length: number }) {
  return (
    <span
      role="img"
      aria-label="Name blotted out"
      className="bg-ink inline-block h-[0.8em] translate-y-[0.1em] rounded-sm align-baseline"
      style={{ width: `${Math.max(4, length) * 0.55}em`, filter: "url(#ink-bleed)" }}
    />
  );
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function PaperCard({
  note,
  size = "md",
  animate = false,
  className = "",
}: {
  note: CardNote;
  size?: "md" | "lg";
  animate?: boolean;
  className?: string;
}) {
  const big = size === "lg";
  const sub = [note.cause, note.time].filter(Boolean).join(" — ");

  return (
    <article
      className={`paper paper-lines relative overflow-hidden rounded-md shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] ${big ? "p-8 sm:p-12" : "p-5"} ${className}`}
    >
      <div aria-hidden className="bg-ink/15 absolute top-0 bottom-0 left-4 w-px" />
      <p
        className={`font-hand text-ink leading-tight ${big ? "text-5xl sm:text-6xl" : "text-3xl"}`}
      >
        {note.name ? (
          <InkText text={note.name} animate={animate} stagger={0.08} className="eyes-name" />
        ) : (
          <BlottedName length={note.nameLength} />
        )}
      </p>
      {sub && (
        <p className={`font-hand text-ink-soft mt-2 ${big ? "text-3xl" : "text-xl"}`}>
          <InkText text={sub} animate={animate} stagger={0.03} />
        </p>
      )}
      {note.details && (
        <p
          className={`font-hand text-ink-soft/90 mt-2 ${big ? "text-2xl" : "line-clamp-3 text-lg"}`}
        >
          {note.details}
        </p>
      )}
      {(note.penName || note.createdAt) && (
        <p className="text-ink/60 mt-4 font-serif text-xs tracking-widest uppercase">
          {note.penName && <>— {note.penName}</>}
          {note.penName && note.createdAt && " · "}
          {note.createdAt && (
            <time dateTime={note.createdAt}>{dateFormat.format(new Date(note.createdAt))}</time>
          )}
        </p>
      )}
    </article>
  );
}
