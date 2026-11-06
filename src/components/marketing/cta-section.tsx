import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { buttonStyles } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="bg-canvas">
      <div className="container-page pb-20 sm:pb-28">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary-600 via-primary-600 to-primary-800 px-6 py-12 shadow-glow sm:px-12 sm:py-16">
          <div
            className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full border-[24px] border-white/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-16 right-24 size-40 rounded-full bg-white/5"
            aria-hidden="true"
          />
          <div className="relative max-w-xl">
            <h2 className="text-balance font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {uz.landing.cta.title}
            </h2>
            <p className="mt-3 text-[15px] font-semibold leading-relaxed text-primary-100">
              {uz.landing.cta.body}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className={buttonStyles({
                  variant: "secondary",
                  size: "lg",
                  className: "border-white/0 text-primary-700 shadow-[0_5px_0_0_#bfdbfe] hover:bg-white",
                })}
              >
                {uz.landing.cta.button}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <span className="text-xs font-medium text-primary-100">{uz.landing.cta.note}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
