import { Code2, PlayCircle, Target } from "lucide-react";
import { uz } from "@/lib/i18n/uz";

const icons = [Target, PlayCircle, Code2];

export function HowItWorks() {
  return (
    <section id="qanday-ishlaydi" className="border-t border-line bg-surface">
      <div className="container-page py-20 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-balance font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {uz.landing.how.title}
            </h2>
            <p className="mt-3 max-w-md text-[15px] font-semibold leading-relaxed text-muted">
              {uz.landing.how.subtitle}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-medium text-muted">
              <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
              {uz.landing.hero.trust}
            </div>
          </div>

          <ol className="relative space-y-4 before:absolute before:left-6 before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-line">
            {uz.landing.how.steps.map((step, index) => {
              const Icon = icons[index] ?? Target;
              return (
                <li key={step.title} className="relative pl-16">
                  <span className="absolute left-0 top-1 flex size-12 items-center justify-center rounded-2xl border-2 border-white bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-glow">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="card-hover rounded-[1.4rem] border-2 border-white bg-white/90 p-5 shadow-soft backdrop-blur">
                    <h3 className="font-display text-lg font-extrabold text-ink">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
