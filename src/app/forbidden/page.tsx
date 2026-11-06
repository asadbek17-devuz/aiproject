import type { Metadata } from "next";
import Link from "next/link";
import { ShieldX } from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { buttonStyles } from "@/components/ui/button";

export const metadata: Metadata = {
  title: uz.errors.forbiddenTitle,
  robots: { index: false, follow: false },
};

export default function ForbiddenPage() {
  return (
    <main id="main" className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md rounded-card border border-line bg-surface p-8 text-center shadow-soft">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger">
          <ShieldX className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-ink">{uz.errors.forbiddenTitle}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{uz.errors.forbiddenBody}</p>
        <Link href="/" className={buttonStyles({ className: "mt-6" })}>
          {uz.errors.goHome}
        </Link>
      </div>
    </main>
  );
}
