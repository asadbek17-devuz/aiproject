import Link from "next/link";
import { Compass } from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md rounded-card border border-line bg-surface p-8 text-center shadow-soft">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <Compass className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-4 text-sm font-semibold text-primary-700">404</p>
        <h1 className="mt-1 text-xl font-bold text-ink">{uz.errors.notFoundTitle}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{uz.errors.notFoundBody}</p>
        <Link href="/" className={buttonStyles({ className: "mt-6" })}>
          {uz.errors.goHome}
        </Link>
      </div>
    </main>
  );
}
