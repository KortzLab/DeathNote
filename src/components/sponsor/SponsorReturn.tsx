"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { InkText } from "@/components/notebook/InkText";
import { InkLink } from "@/components/ui/InkLink";
import { openSponsor } from "@/components/sponsor/SponsorModal";
import { formatUsd } from "@/lib/validation/sponsor";
import { useSound } from "@/components/providers/SoundProvider";

type Status = "pending" | "paying" | "paid" | "expired" | "failed" | "refunded";
type Data = {
  status: Status;
  amountCents: number;
  charityCents: number;
  name: string | null;
  paymentUrl: string | null;
};

// Status comes from our DB (set by the verified webhook only). Landing here proves nothing.
export function SponsorReturn() {
  const order = useSearchParams().get("order") ?? "";
  const { play } = useSound();
  const [data, setData] = useState<Data | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!order) return;
    let stop = false;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      tries++;
      const res = await fetch(`/api/sponsor/status?order=${encodeURIComponent(order)}`, {
        cache: "no-store",
      }).catch(() => null);
      if (stop) return;
      if (res?.status === 404) {
        setMissing(true);
        return;
      }
      const body = res?.ok ? ((await res.json()) as Data) : null;
      if (body) setData(body);
      const settled = body && ["paid", "expired", "failed", "refunded"].includes(body.status);
      // ~30 min total: 4s for the first 2 min, then every 10s.
      if (!settled && tries < 240) timer = setTimeout(poll, tries < 30 ? 4000 : 10000);
    };
    void poll();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [order]);

  useEffect(() => {
    if (data?.status === "paid") play("heartbeat", { volume: 0.6 });
  }, [data?.status, play]);

  if (!order || missing) {
    return (
      <Card>
        <h1 className="title-ember text-5xl">No such offering</h1>
        <p className="text-muted mt-4">This page needs a valid order reference.</p>
        <Actions />
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <p className="text-muted animate-pulse font-serif" role="status">
          Reading the ledger…
        </p>
      </Card>
    );
  }

  if (data.status === "paid") {
    const who = data.name || "A nameless benefactor";
    return (
      <Card>
        <p className="text-muted font-serif text-xs tracking-[0.4em] uppercase">
          The shinigami writes
        </p>
        <p
          className="font-hand mt-6 text-5xl sm:text-6xl"
          style={{ color: "#d4ae5a", textShadow: "0 0 18px rgba(212,174,90,0.45)" }}
        >
          <InkText text={who} animate stagger={0.09} className="text-gold" />
        </p>
        <p className="text-bone mt-6 font-serif text-lg">
          Thank you. Your {formatUsd(data.amountCents)} has been received, and{" "}
          <span className="text-gold">{formatUsd(data.charityCents)}</span> goes to charity.
        </p>
        <p className="text-muted mt-2 text-sm">
          This name is written in gold. Gold ink never kills.
        </p>
        <Actions />
      </Card>
    );
  }

  if (data.status === "pending" || data.status === "paying") {
    return (
      <Card>
        <h1 className="title-ember text-5xl">The ink is still wet</h1>
        <p className="text-muted mt-4" role="status">
          {data.status === "paying"
            ? "Your payment was seen on the network. Waiting for confirmation…"
            : "Waiting for your payment to be confirmed. This page updates on its own."}
        </p>
        <div className="bg-smoke mx-auto mt-6 h-1.5 w-48 overflow-hidden rounded-full">
          <div className="bg-bone h-full w-1/3 animate-[ink-slide_1.6s_ease-in-out_infinite] rounded-full" />
        </div>
        {data.paymentUrl && (
          <a href={data.paymentUrl} className="btn-ghost mt-6">
            Return to the payment page
          </a>
        )}
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="title-ember text-5xl">
        {data.status === "refunded" ? "Returned to you" : "The ink faded"}
      </h1>
      <p className="text-muted mt-4">
        {data.status === "expired"
          ? "The invoice expired before a payment arrived."
          : data.status === "refunded"
            ? "This payment was refunded."
            : "The payment did not go through."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" className="btn-seal" onClick={openSponsor}>
          Try again
        </button>
        <InkLink href="/" className="btn-ghost">
          Back home
        </InkLink>
      </div>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="border-smoke bg-abyss/80 rounded-2xl border p-8 text-center shadow-2xl backdrop-blur sm:p-12">
      {children}
    </section>
  );
}

function Actions() {
  return (
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      <InkLink href="/notebook" className="btn-seal">
        Open the notebook
      </InkLink>
      <InkLink href="/supporters" className="btn-ghost">
        Supporters
      </InkLink>
    </div>
  );
}
