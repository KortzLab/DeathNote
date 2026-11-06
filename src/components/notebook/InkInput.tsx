"use client";

import { useId, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { InkText } from "@/components/notebook/InkText";
import { emitTyping } from "@/lib/fx/eyes";
import { useSound } from "@/components/providers/SoundProvider";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength: number;
  multiline?: boolean;
  size?: "lg" | "md" | "sm";
  required?: boolean;
  placeholder?: string;
  onEnter?: () => void;
  inputClassName?: string;
  name?: string;
  autoFocus?: boolean;
};

const SIZES = { lg: "text-3xl", md: "text-2xl", sm: "text-xl" } as const;

// The real <input> stays (caret, IME, a11y) but is transparent; an overlay draws the glyphs
// so each newly typed character can animate in.
export function InkInput({
  label,
  value,
  onChange,
  maxLength,
  multiline,
  size = "md",
  required,
  placeholder,
  onEnter,
  inputClassName = "",
  name,
  autoFocus,
}: Props) {
  const id = useId();
  const { play } = useSound();
  const lastSound = useRef(0);
  const [dryUpTo, setDryUpTo] = useState(value.length);

  function handle(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const next = e.target.value.slice(0, maxLength);
    // Appending animates the new chars; any mid-string edit just redraws everything dry.
    setDryUpTo(next.startsWith(value) ? value.length : next.length);
    onChange(next);
    emitTyping();
    const now = performance.now();
    if (now - lastSound.current > 90) {
      lastSound.current = now;
      play("scratch", { volume: 0.18, rate: 0.9 + Math.random() * 0.3 });
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !multiline && onEnter) {
      e.preventDefault();
      onEnter();
    }
  }

  const shared = {
    id,
    name,
    value,
    onChange: handle,
    onKeyDown,
    maxLength,
    required,
    placeholder,
    autoFocus,
    spellCheck: false,
    autoComplete: "off",
    className: `peer relative z-10 w-full resize-none bg-transparent font-hand ${SIZES[size]} leading-[2.25rem] text-transparent caret-ink outline-none placeholder:text-ink/30 ${inputClassName}`,
  };

  return (
    <div className="group relative">
      <label
        htmlFor={id}
        className="text-ink/60 pointer-events-none block font-serif text-[0.7rem] tracking-[0.25em] uppercase"
      >
        {label}
        {required && <span aria-hidden> *</span>}
      </label>
      <div className="relative">
        {multiline ? <textarea {...shared} rows={2} /> : <input {...shared} type="text" />}
        <div
          aria-hidden
          className={`font-hand pointer-events-none absolute inset-0 overflow-hidden ${SIZES[size]} text-ink leading-[2.25rem] break-words whitespace-pre-wrap`}
        >
          <InkText text={value} animate fromIndex={dryUpTo} stagger={0} />
        </div>
        <span
          aria-hidden
          className="bg-ink/25 peer-focus:bg-ink/70 absolute inset-x-0 bottom-0 h-px transition-colors"
        />
      </div>
    </div>
  );
}
