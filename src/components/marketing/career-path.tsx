import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  MessagesSquare,
  Users,
} from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const icons = [GraduationCap, ClipboardCheck, MessagesSquare, Users];

export function CareerPath() {
  const career = uz.landing.career;

  return (
    <section id="karyera" className="border-t border-line bg-surface">
      <div className="container-page py-20 sm:py-28">
        <div className="relative overflow-hidden rounded-[2rem] border-2 border-white bg-gradient-to-br from-white via-white to-primary-50/60 p-5 shadow-lift sm:p-8 lg:p-10">
          <div
            className="pointer-events-none absolute inset-0 bg-dotted opacity-30 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_68%)]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary-200/40 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-primary-700">
                <Users className="size-3.5" aria-hidden="true" />
                {career.eyebrow}
              </span>
              <h2 className="mt-4 text-balance font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                {career.title}
              </h2>
              <p className="mt-3 max-w-xl text-[15px] font-semibold leading-relaxed text-muted">
                {career.subtitle}
              </p>
            </div>
            <Link href="/register" className={buttonStyles({ size: "lg" })}>
              {career.cta}
              <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
          </div>

          <ol className="relative mt-9 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {career.steps.map((step, index) => {
              const Icon = icons[index] ?? GraduationCap;
              const last = index === career.steps.length - 1;
              return (
                <li key={step.tag} className="relative">
                  <article
                    className={cn(
                      "card-hover flex h-full flex-col rounded-[1.4rem] border-2 p-5",
                      last
                        ? "border-primary-200 bg-primary-50/75 shadow-soft"
                        : "border-white bg-white/90 shadow-soft",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-extrabold tracking-widest text-primary-600">
                        {step.tag}
                      </span>
                      <span
                        className={cn(
                          "flex size-10 items-center justify-center rounded-control",
                          last ? "bg-primary-600 text-white" : "bg-primary-50 text-primary-600",
                        )}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-lg font-extrabold text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm font-semibold leading-relaxed text-muted">
                      {step.body}
                    </p>
                    {last ? (
                      <span className="mt-4 inline-flex w-fit items-center gap-1 rounded-full bg-primary-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
                        <CheckCircle2 className="size-3" aria-hidden="true" />
                        Team
                      </span>
                    ) : null}
                  </article>
                </li>
              );
            })}
          </ol>

          <div className="relative mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white/80 p-3">
            {career.highlights.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-2.5 py-1 text-[11px] font-bold text-slate-700"
              >
                <CheckCircle2 className="size-3.5 text-primary-600" aria-hidden="true" />
                {item}
              </span>
            ))}
            <p className="ml-auto text-[11px] font-semibold text-muted">{career.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
