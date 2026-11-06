import { BarChart3, Languages, PenTool, Zap } from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";

const icons = [Zap, PenTool, Languages, BarChart3];

export function Benefits() {
  return (
    <section id="afzalliklar" className="border-t border-line bg-surface">
      <div className="container-page py-20 sm:py-28">
        <div className="max-w-2xl">
          <h2 className="text-balance font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {uz.landing.benefits.title}
          </h2>
          <p className="mt-3 text-[15px] font-semibold leading-relaxed text-muted">
            {uz.landing.benefits.subtitle}
          </p>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {uz.landing.benefits.items.map((item, index) => {
            const Icon = icons[index] ?? Zap;
            const featured = index === 0;
            const wide = index === 3;
            return (
              <article
                key={item.title}
                className={cn(
                  "card-hover rounded-[1.4rem] border-2 p-5 sm:p-6",
                  featured
                    ? "border-primary-800 bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-glow md:col-span-2"
                    : "border-white bg-white/90 text-ink",
                  wide ? "md:col-span-2" : "",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-control",
                    featured ? "bg-white/15 text-white" : "bg-primary-50 text-primary-600",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-extrabold">{item.title}</h3>
                <p
                  className={cn(
                    "mt-1.5 max-w-md text-sm leading-relaxed",
                    featured ? "text-primary-100" : "text-muted",
                  )}
                >
                  {item.body}
                </p>
                {featured ? (
                  <div className="mt-5 max-w-xs">
                    <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-primary-100">
                      <span>{uz.landing.benefits.personalPace}</span>
                      <span>72%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/20">
                      <div className="h-full w-[72%] rounded-full bg-white" />
                    </div>
                  </div>
                ) : null}
                {wide ? (
                  <div className="mt-5 max-w-sm">
                    <ProgressBar value={64} label={uz.landing.benefits.courseProgress} tone="primary" size="sm" />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
