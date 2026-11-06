import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  const safeCallback =
    callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/notebook";
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-4 pt-24 pb-12">
      <h1 className="title-ember text-center text-5xl">Bind your name</h1>
      <p className="text-muted mt-3 text-center">
        Sign in to keep your notebook forever and carry it across devices.
      </p>
      <SignInForm callbackUrl={safeCallback} initialError={error} />
    </div>
  );
}
