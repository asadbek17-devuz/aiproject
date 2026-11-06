import { BookOpen, Clock, Code2, MessagesSquare } from "lucide-react";
import { uz } from "@/lib/i18n/uz";

const icons = [BookOpen, Code2, MessagesSquare];

function toMinutes(duration: string) {
  const value = Number.parseInt(duration, 10);
  return Number.isNaN(value) ? 0 : value;
}

export function MethodologyTimeline() {
  const { title, subtitle, total, segments } = uz.landing.methodology;
  const starts = segments.map((_, index) =>
    segments.slice(0, index).reduce((sum, item) => sum + toMinutes(item.duration), 0),
  );

  return (
    <section id="metodologiya" className="border-t border-line bg-canvas">
      <div className="container-page py-20 sm:py-28">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-extrabold text-primary-700">
              <Clock className="size-3.5" aria-hidden="true" />
              {total}
            </span>
            <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 max-w-xl text-[15px] font-semibold leading-relaxed text-muted">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-[1.75rem] border-2 border-white bg-white/90 shadow-soft">
          <div className="flex h-2" aria-hidden="true">
            {segments.map((segment, index) => (
              <div
                key={segment.title}
                className={
                  index === 0
                    ? "flex-1 bg-primary-600"
                    : index === 1
                      ? "flex-1 border-l-2 border-white bg-primary-500"
                      : "flex-1 border-l-2 border-white bg-primary-400"
                }
              />
            ))}
          </div>

          <div className="grid md:grid-cols-3">
            {segments.map((segment, index) => {
              const Icon = icons[index] ?? BookOpen;
              const start = starts[index] ?? 0;
              const end = start + toMinutes(segment.duration);

              return (
                <article
                  key={segment.title}
                  className="group relative border-t border-line p-6 transition-colors first:border-t-0 hover:bg-primary-50/40 sm:p-7 md:border-l md:border-t-0 md:first:border-l-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex size-8 items-center justify-center rounded-full border-2 border-primary-100 bg-primary-50 text-xs font-extrabold text-primary-700">
                      {index + 1}
                    </span>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary-600">
                      {segment.duration}
                    </span>
                  </div>

                  <h3 className="mt-5 flex items-center gap-2.5 font-display text-lg font-extrabold text-ink">
                    <Icon className="size-5 text-primary-600" aria-hidden="true" />
                    {segment.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{segment.body}</p>

                  <div className="mt-6 flex items-center gap-2 text-[11px] font-bold text-muted">
                    <span className="h-px flex-1 bg-line" aria-hidden="true" />
                    {start}–{end} daq
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
