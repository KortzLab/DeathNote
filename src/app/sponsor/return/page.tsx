import type { Metadata } from "next";
import { Suspense } from "react";
import { SponsorReturn } from "@/components/sponsor/SponsorReturn";

export const metadata: Metadata = { title: "Your offering", robots: { index: false } };

export default function SponsorReturnPage() {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col justify-center px-4 pt-24 pb-16">
      <Suspense>
        <SponsorReturn />
      </Suspense>
    </div>
  );
}
