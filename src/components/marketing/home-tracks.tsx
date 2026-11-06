import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Boxes,
  Code2,
  Languages,
  Layers,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { TRACK_KEYS, TRACK_PLANS, type TrackKey } from "@/lib/curriculum";
import { cn } from "@/lib/utils";

const trackIcons: Record<TrackKey, typeof Code2> = {
  WEB_DEVELOPER: Code2,
  SOFTWARE_ENGINEER: Layers,
  MOBILE_DEVELOPER: Smartphone,
  CYBERSECURITY: ShieldCheck,
  SYSTEM_DESIGN: Boxes,
  AI_ENGINEER: Brain,
  MATH_ENGLISH: Languages,
};

const trackTones: Record<TrackKey, string> = {
  WEB_DEVELOPER: "from-primary-600 to-sky-500",
  SOFTWARE_ENGINEER: "from-violet-600 to-fuchsia-500",
  MOBILE_DEVELOPER: "from-emerald-600 to-teal-500",
  CYBERSECURITY: "from-rose-600 to-red-500",
  SYSTEM_DESIGN: "from-indigo-600 to-blue-500",
  AI_ENGINEER: "from-fuchsia-600 to-pink-500",
  MATH_ENGLISH: "from-teal-600 to-emerald-500",
};

export function HomeTracks() {
  return (
    <section id="yonalishlar" className="border-t border-line bg-canvas">
      <div className="container-page py-16 sm:py-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary-700 shadow-soft">
              <Sparkles className="size-3.5" aria-hidden="true" />
              7 yo&apos;nalish
            </span>
            <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Bir platforma, butun IT yo&apos;li
            </h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-muted sm:text-[15px]">
              Web, mobil, security, system design, AI va poydevor fanlar. Har bir yo&apos;nalish
              amaliy loyiha va yakuniy imtihon bilan tugaydi.
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex w-fit items-center gap-1.5 rounded-full border-2 border-line bg-white px-4 py-2.5 text-xs font-extrabold text-ink shadow-soft transition-colors hover:border-primary-300 hover:text-primary-700"
          >
            Barcha kurslar
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {TRACK_KEYS.map((key, index) => {
            const plan = TRACK_PLANS[key];
            const Icon = trackIcons[key];
            const featured = index === 0;

            return (
              <Link
                key={key}
                href="/courses"
                className={cn(
                  "group relative flex min-h-[11rem] flex-col overflow-hidden rounded-[1.5rem] border-2 p-5 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-lift",
                  featured
                    ? "border-primary-800 bg-ink text-white md:col-span-2 xl:col-span-2"
                    : "border-white bg-white/90 text-ink hover:border-primary-200",
                )}
              >
                {featured ? (
                  <div
                    className="pointer-events-none absolute -right-10 -top-16 size-52 rounded-full bg-primary-500/30 blur-3xl"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-2xl",
                      featured
                        ? "bg-white/15 text-white"
                        : `bg-gradient-to-br text-white ${trackTones[key]}`,
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                      featured ? "bg-white/10 text-sky-200" : "bg-canvas text-muted",
                    )}
                  >
                    {plan.courseSlugs.length} kurs
                  </span>
                </div>
                <h3 className="relative mt-3 font-display text-lg font-extrabold leading-tight">
                  {plan.title}
                </h3>
                <p
                  className={cn(
                    "relative mt-1.5 line-clamp-3 text-xs font-semibold leading-relaxed",
                    featured ? "text-slate-300" : "text-muted",
                  )}
                >
                  {plan.description}
                </p>
                <span
                  className={cn(
                    "relative mt-auto inline-flex items-center gap-1 pt-3 text-[11px] font-extrabold",
                    featured ? "text-sky-300" : "text-primary-700",
                  )}
                >
                  Yo&apos;nalishni ko&apos;rish
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
