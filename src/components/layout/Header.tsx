"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { InkLink } from "@/components/ui/InkLink";
import { Sigil } from "@/components/ui/Sigil";
import { SoundToggle } from "@/components/layout/SoundToggle";
import { SponsorTrigger } from "@/components/sponsor/SponsorTrigger";
import { NAV } from "@/lib/site";

export function Header({ sponsorEnabled }: { sponsorEnabled: boolean }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="no-print from-void via-void/80 fixed inset-x-0 top-0 z-50 bg-gradient-to-b to-transparent">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <InkLink
          href="/"
          className="group text-bone flex items-center gap-2"
          aria-label="Death Note, home"
        >
          <Sigil className="text-bone h-8 w-8 transition-transform duration-500 group-hover:rotate-180" />
          <span className="font-gothic text-2xl tracking-wide">Death Note</span>
        </InkLink>

        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <InkLink
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className="text-muted hover:text-bone aria-[current=page]:text-ember text-sm tracking-widest uppercase transition-colors"
            >
              {item.label}
            </InkLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {sponsorEnabled && <SponsorTrigger variant="header" />}
          <SoundToggle />
          <div className="hidden md:block">
            {status === "authenticated" ? (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn-ghost px-3 py-1.5 text-xs"
                title={session.user.email ?? undefined}
              >
                Sign out
              </button>
            ) : (
              <InkLink href="/signin" className="btn-ghost px-3 py-1.5 text-xs">
                Sign in
              </InkLink>
            )}
          </div>
          <button
            type="button"
            className="btn-ghost px-3 py-1.5 text-xs md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a,button")) setOpen(false);
          }}
          className="border-smoke bg-abyss/95 mx-4 rounded-xl border p-4 backdrop-blur md:hidden"
        >
          <ul className="flex flex-col gap-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <InkLink href={item.href} className="text-bone block py-1">
                  {item.label}
                </InkLink>
              </li>
            ))}
            <li>
              {status === "authenticated" ? (
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-muted py-1"
                >
                  Sign out
                </button>
              ) : (
                <InkLink href="/signin" className="text-muted block py-1">
                  Sign in
                </InkLink>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
