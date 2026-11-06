"use client";

import { SealButton } from "@/components/ui/SealButton";
import { openSponsor } from "@/components/sponsor/SponsorModal";

export function SponsorCta({ label = "Leave an offering" }: { label?: string }) {
  return <SealButton onClick={openSponsor}>{label}</SealButton>;
}
