import { Check } from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { MentorShowcase } from "@/components/marketing/mentor-showcase";

export function MentorSection() {
  return (
    <section id="mentor" className="border-t border-line bg-canvas">
      <div className="container-page py-20 sm:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <h2 className="text-balance font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {uz.landing.mentor.title}
            </h2>
            <p className="mt-3 max-w-lg text-[15px] font-semibold leading-relaxed text-muted">
              {uz.landing.mentor.subtitle}
            </p>

            <ul className="mt-6 space-y-2.5">
              {uz.landing.mentor.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success-soft">
                    <Check className="size-3 text-success" aria-hidden="true" />
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>

            <div className="mt-7 space-y-2">
              <div className="ml-auto max-w-sm rounded-3xl rounded-br-md border-2 border-line bg-white px-4 py-3 text-sm font-semibold text-ink shadow-soft">
                {uz.landing.mentor.sampleQuestion}
              </div>
              <div className="max-w-md rounded-3xl rounded-bl-md bg-gradient-to-br from-primary-600 to-primary-700 px-4 py-3 text-sm font-semibold leading-relaxed text-white shadow-glow">
                {uz.landing.mentor.sampleAnswer}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <MentorShowcase />
          </div>
        </div>
      </div>
    </section>
  );
}
