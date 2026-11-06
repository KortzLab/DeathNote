"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { SealButton } from "@/components/ui/SealButton";

type Props = {
  callbackUrl: string;
  initialError?: string;
};

export function SignInForm({ callbackUrl, initialError }: Props) {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(
    initialError ? "The notebook could not recognise you. Try again." : null,
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "");
    try {
      if (mode === "register") {
        const res = await fetch("/api/account/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, ...(name ? { name } : {}) }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setMessage(data.error ?? "Could not create the account.");
          return;
        }
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setMessage("Those details did not match. Check them and try again.");
        return;
      }
      window.location.assign(callbackUrl);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-smoke bg-abyss/80 mt-10 space-y-6 rounded-2xl border p-6 shadow-2xl backdrop-blur">
      <div role="tablist" aria-label="Account" className="grid grid-cols-2 gap-2 text-sm">
        {(["signin", "register"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            type="button"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`rounded-full py-2 ${mode === m ? "bg-smoke text-bone" : "text-muted hover:text-bone"}`}
          >
            {m === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
        {mode === "register" && (
          <Field
            label="Name (optional)"
            name="name"
            type="text"
            autoComplete="nickname"
            maxLength={60}
          />
        )}
        <Field
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          required
          minLength={10}
          maxLength={200}
        />
        {message && (
          <p role="alert" className="text-blood-bright text-sm">
            {message}
          </p>
        )}
        <SealButton type="submit" className="w-full" disabled={busy}>
          {busy ? "Binding…" : mode === "signin" ? "Sign in" : "Create account"}
        </SealButton>
      </form>
    </div>
  );
}

function Field({
  label,
  ...input
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm">
      <span className="text-muted mb-1 block">{label}</span>
      <input
        {...input}
        className="border-smoke bg-void text-bone placeholder:text-muted/60 focus:border-ember w-full rounded-lg border px-3 py-2"
      />
    </label>
  );
}
