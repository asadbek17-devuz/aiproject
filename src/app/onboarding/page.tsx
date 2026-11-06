import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { requireUser } from "@/server/auth/session";
import { AppHeader } from "@/components/ui/app-header";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export const metadata: Metadata = {
  title: uz.onboarding.title,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await requireUser();

  if (user.role !== "STUDENT") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader user={{ name: user.name, role: user.role }} variant="app" />
      <main id="main" className="container-page flex-1 py-8 sm:py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-control text-sm font-semibold text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {uz.onboarding.back}
        </Link>

        <div className="mx-auto mt-5 max-w-3xl">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-primary-700">
              <Sparkles className="size-3.5" aria-hidden="true" />
              {uz.onboarding.badge}
            </span>
            <h1 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {uz.onboarding.title}
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-relaxed text-muted">
              {uz.onboarding.subtitle}
            </p>
          </div>

          <div className="mt-7">
            <OnboardingForm name={user.name.split(" ")[0] ?? user.name} />
          </div>
        </div>
      </main>
    </div>
  );
}
