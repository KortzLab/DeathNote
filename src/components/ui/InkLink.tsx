"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { useInkNavigate } from "@/components/providers/TransitionProvider";

type Props = ComponentProps<typeof Link> & { href: string };

export function InkLink({ href, onClick, ...rest }: Props) {
  const navigate = useInkNavigate();
  function handle(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!href.startsWith("/")) return;
    e.preventDefault();
    navigate(href, { x: e.clientX, y: e.clientY });
  }
  return <Link href={href} onClick={handle} {...rest} />;
}
