"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { Button, buttonStyles } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error", error.digest);
  }, [error]);

  return (
    <main id="main" className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md rounded-card border border-line bg-surface p-8 text-center shadow-soft">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-warning-soft text-warning">
          <TriangleAlert className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-ink">{uz.errors.serverTitle}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{uz.errors.serverBody}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button type="button" onClick={reset}>
            {uz.common.retry}
          </Button>
          <Link href="/" className={buttonStyles({ variant: "secondary" })}>
            {uz.errors.goHome}
          </Link>
        </div>
      </div>
    </main>
  );
}
