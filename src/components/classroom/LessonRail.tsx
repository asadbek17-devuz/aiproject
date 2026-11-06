"use client";

import { Check } from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { cn } from "@/lib/utils";
import {
  formatClock,
  segmentState,
  type LessonSegment,
} from "@/lib/lesson-timeline";

export type LessonRailProps = {
  segments: LessonSegment[];
  stepIndex: number;
  stepProgress: number;
  elapsedMs: number;
  totalMs: number;
  className?: string;
};

export function LessonRail({
  segments,
  stepIndex,
  stepProgress,
  elapsedMs,
  totalMs,
  className,
}: LessonRailProps) {
  const remainingMs = Math.max(0, totalMs - elapsedMs);
  const overall = totalMs > 0 ? Math.min(100, (elapsedMs / totalMs) * 100) : 0;

  return (
    <div className={cn("rounded-2xl border border-line bg-white p-3 shadow-soft sm:p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <p className="text-xs font-extrabold text-ink">{uz.classroom.lessonProgress}</p>
          <span className="text-[11px] font-semibold text-muted">
            {formatClock(elapsedMs)} {uz.classroom.timelineElapsed} · {formatClock(remainingMs)}{" "}
            {uz.classroom.timelineLeft}
          </span>
        </div>
        <span className="text-[11px] font-extrabold text-primary-700">{Math.round(overall)}%</span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-primary-600 transition-[width] duration-500"
          style={{ width: `${overall}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(overall)}
          aria-label={uz.classroom.lessonProgress}
        />
      </div>

      <div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {segments.map((segment) => {
          const state = segmentState(segment, stepIndex);
          const within = Math.min(
            1,
            Math.max(0, (stepIndex - segment.startStep + stepProgress) / Math.max(1, segment.stepCount)),
          );
          const percent =
            state === "done" ? 100 : state === "active" ? Math.round(within * 100) : 0;

          return (
            <div
              key={segment.type}
              className={cn(
                "min-w-[132px] flex-1 snap-start rounded-xl border px-2.5 py-2 transition-colors sm:min-w-[150px]",
                state === "active"
                  ? "border-primary-300 bg-primary-50/70"
                  : state === "done"
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-line bg-canvas/60",
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className={cn(
                    "text-[10px] font-extrabold",
                    state === "active"
                      ? "text-primary-700"
                      : state === "done"
                        ? "text-emerald-700"
                        : "text-muted",
                  )}
                >
                  {segment.durationMin} {uz.classroom.minuteShort}
                </span>
                {state === "done" ? (
                  <Check className="size-3 text-emerald-600" aria-hidden="true" />
                ) : state === "active" ? (
                  <span className="size-1.5 animate-pulse rounded-full bg-primary-600" aria-hidden="true" />
                ) : null}
              </div>
              <p
                className={cn(
                  "mt-0.5 truncate text-[11px] font-extrabold",
                  state === "upcoming" ? "text-slate-500" : "text-ink",
                )}
              >
                {segment.title}
              </p>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line/80">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-500",
                    state === "done" ? "bg-emerald-500" : "bg-primary-600",
                  )}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
