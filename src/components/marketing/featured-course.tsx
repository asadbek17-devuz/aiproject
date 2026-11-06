import Link from "next/link";
import { ArrowRight, BookOpen, Check, Clock } from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { buttonStyles } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const course = uz.landing.courses;

export function FeaturedCourse() {
  return (
    <section id="kurslar" className="border-t border-line bg-surface">
      <div className="container-page py-20 sm:py-28">
        <div className="max-w-2xl">
          <h2 className="text-balance font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {course.title}
          </h2>
          <p className="mt-3 text-[15px] font-semibold leading-relaxed text-muted">{course.subtitle}</p>
        </div>

        <div className="mt-8 overflow-hidden rounded-[1.6rem] border-2 border-white bg-gradient-to-br from-white to-primary-50/60 shadow-lift ring-1 ring-primary-100">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary">{course.badge}</Badge>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {course.meta}
                </span>
              </div>
              <h3 className="mt-4 text-balance font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                {course.courseTitle}
              </h3>
              <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-muted">
                {course.courseDescription}
              </p>

              <ul className="mt-5 flex flex-wrap gap-2">
                {course.features.map((feature) => (
                  <li
                    key={feature}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium text-slate-600"
                  >
                    <Check className="size-3 text-success" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/register" className={buttonStyles({ size: "md" })}>
                  {course.cta}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/login"
                  className={buttonStyles({ variant: "ghost", size: "md" })}
                >
                  {uz.common.login}
                </Link>
              </div>
            </div>

            <div className="border-t border-line bg-surface p-5 sm:p-6 lg:border-l lg:border-t-0">
              <div className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
                <BookOpen className="size-4 text-primary-600" aria-hidden="true" />
                {course.lessonListTitle}
              </div>
              <ol className="mt-4 space-y-1.5">
                {course.lessonTitles.map((lesson, index) => {
                  const ready = index < 2;
                  return (
                    <li
                      key={lesson}
                      className="flex items-center gap-3 rounded-2xl px-2.5 py-2 transition-colors hover:bg-white"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-ink">{lesson}</span>
                      <span
                        className={
                          ready
                            ? "shrink-0 rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-semibold text-green-700"
                            : "shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500"
                        }
                      >
                        {ready ? course.lessonReady : course.lessonPlanned}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
