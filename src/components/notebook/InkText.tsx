"use client";

import { memo } from "react";

type Props = {
  text: string;
  animate?: boolean;
  /** seconds */
  stagger?: number;
  className?: string;
  /** chars before this index render without animation */
  fromIndex?: number;
};

// Per-character spans are aria-hidden; screen readers get the plain string.
export const InkText = memo(function InkText({
  text,
  animate = false,
  stagger = 0.045,
  className = "",
  fromIndex = 0,
}: Props) {
  const chars = Array.from(text);
  return (
    <span className={`ink ${className}`}>
      <span className="sr-only">{text}</span>
      {chars.map((ch, i) => {
        // Plain spaces between the animated glyphs give the browser somewhere to wrap.
        if (ch === " ")
          return (
            <span key={i} aria-hidden>
              {" "}
            </span>
          );
        const fresh = animate && i >= fromIndex;
        return (
          <span
            key={i}
            aria-hidden
            className={fresh ? "ink-char" : undefined}
            style={fresh ? { animationDelay: `${(i - fromIndex) * stagger}s` } : undefined}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
});
