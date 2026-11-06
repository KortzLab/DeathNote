"use client";

import { SessionProvider } from "next-auth/react";
import { SoundProvider } from "@/components/providers/SoundProvider";
import { TransitionProvider } from "@/components/providers/TransitionProvider";
import { QuillCursor } from "@/components/fx/QuillCursor";
import { Shinigami } from "@/components/fx/Shinigami";
import { Whispers } from "@/components/fx/Whispers";
import { Konami } from "@/components/fx/Konami";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SoundProvider>
        <TransitionProvider>
          <Shinigami />
          <Whispers />
          {children}
          <QuillCursor />
          <Konami />
        </TransitionProvider>
      </SoundProvider>
    </SessionProvider>
  );
}
