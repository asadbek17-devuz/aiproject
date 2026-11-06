"use client";

import { BookOpen, Clock3, Lightbulb, MessageCircleQuestion, Sparkles } from "lucide-react";
import type { FlatLessonStep, StepCode } from "@/server/ai/lesson-script.schema";
import { uz } from "@/lib/i18n/uz";
import { cn } from "@/lib/utils";
import { MentorAvatar, type MentorState } from "@/components/classroom/mentor-avatar";
import { Whiteboard } from "@/components/classroom/whiteboard";
import { simplifyBoardActions } from "@/components/classroom/board-actions";

export type ClassroomStageProps = {
  step: FlatLessonStep;
  stepIndex: number;
  mentorState: MentorState;
  active: boolean;
  speaking: boolean;
  progress: number;
  visibleCount: number;
  activeIndex: number;
  className?: string;
};

function SimpleCode({ code }: { code: StepCode }) {
  const lines = code.content.split("\n");
  const visibleLines = lines.slice(0, 14);
  const truncated = lines.length > visibleLines.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.7)]">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-3 py-2">
        <span className="truncate text-[11px] font-bold text-slate-200">{code.file}</span>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
          {code.language}
        </span>
      </div>
      <pre className="max-h-[218px] overflow-auto p-3 text-[11px] leading-5 text-slate-200">
        <code>
          {visibleLines.join("\n")}
          {truncated ? "\n…" : ""}
        </code>
      </pre>
    </div>
  );
}

const EXAMPLE_MARKERS = [
  "masalan",
  "misol",
  "tasavvur qiling",
  "xuddi",
  "o'xshaydi",
  "ko'z oldingizga",
  "hayotda",
];

function splitNarration(text: string): string[] {
  return text
    .split(/(?<=[.!?…])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function extractExample(step: FlatLessonStep): string | null {
  const sentences = splitNarration(step.narration);
  const example = sentences.find((sentence) =>
    EXAMPLE_MARKERS.some((marker) => sentence.toLowerCase().includes(marker)),
  );
  if (example) return example;

  const boardExample = step.boardActions.find(
    (action) => action.type === "text" || action.type === "note",
  );
  return boardExample && "text" in boardExample ? boardExample.text : null;
}

function extractQuestion(step: FlatLessonStep): string | null {
  return splitNarration(step.narration).find((sentence) => sentence.endsWith("?")) ?? null;
}

export function ClassroomStage({
  step,
  stepIndex,
  mentorState,
  active,
  speaking,
  progress,
  visibleCount,
  activeIndex,
  className,
}: ClassroomStageProps) {
  const actions = simplifyBoardActions(step.boardActions);
  const code = step.code ?? null;
  const example = extractExample(step);
  const question = extractQuestion(step);
  const shownVisible = Math.min(Math.max(0, visibleCount), actions.length);
  const shownActive = actions.length > 0 ? Math.min(Math.max(0, activeIndex), actions.length - 1) : -1;
  const stateLabel = uz.classroom.states[mentorState];
  const revealPercent = actions.length > 0 ? Math.round((shownVisible / actions.length) * 100) : 0;
  const voicePercent = active ? Math.round(Math.min(1, Math.max(0, progress)) * 100) : 0;

  return (
    <section
      aria-label={uz.classroom.stageAria}
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-lift",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_45%,#f0f9ff_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary-200/40 blur-3xl"
        aria-hidden="true"
      />

      <header className="relative flex flex-wrap items-center justify-between gap-3 border-b border-line/70 bg-white/60 px-3.5 py-3 backdrop-blur sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-white ring-1 ring-primary-100 shadow-soft">
            <MentorAvatar state={mentorState} className="size-11" />
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-white",
                speaking ? "bg-emerald-500" : active ? "bg-primary-400" : "bg-slate-300",
              )}
              aria-hidden="true"
            >
              {speaking ? (
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
              ) : null}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-display text-sm font-extrabold text-ink">Sardor</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-primary-700 ring-1 ring-primary-100">
                AI mentor
              </span>
            </div>
            <p className="mt-0.5 truncate text-[11px] font-semibold text-muted">
              {stateLabel} · {step.segmentTitle}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/80 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-muted">
            <BookOpen className="size-3" aria-hidden="true" />
            {uz.classroom.step} {stepIndex + 1}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/80 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-muted">
            <Clock3 className="size-3" aria-hidden="true" />
            {step.segmentDurationMin} {uz.classroom.minuteShort}
          </span>
        </div>
      </header>

      <div className="relative grid gap-4 p-3.5 sm:p-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(250px,0.65fr)]">
        <div className="min-w-0">
          <div className="mb-2.5 flex items-center justify-between gap-2 px-0.5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted">
              {uz.classroom.boardTitle}
            </p>
            <span className="text-[10px] font-extrabold text-primary-700">{revealPercent}%</span>
          </div>
          <Whiteboard
            actions={actions}
            activeIndex={shownActive}
            visibleCount={shownVisible}
            showHeader={false}
            className="min-h-[320px] rounded-[1.25rem] border-line/70 bg-white/90 shadow-none"
          />
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-sky-400 transition-[width] duration-500"
              style={{ width: `${revealPercent}%` }}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          {code ? (
            <SimpleCode code={code} />
          ) : (
            <div className="rounded-2xl border border-primary-100 bg-[linear-gradient(145deg,#eff6ff_0%,#ffffff_100%)] p-4">
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm ring-1 ring-primary-100">
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
              <p className="mt-3 font-display text-base font-extrabold leading-snug text-ink">
                {step.title}
              </p>
              <p className="mt-1.5 text-xs font-semibold leading-relaxed text-muted">
                Mentor tushuntirmoqda. Doskadagi asosiy fikrlarga e&apos;tibor bering.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted">
                {uz.classroom.step} {stepIndex + 1}
              </p>
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-extrabold text-primary-700">
                {revealPercent}%
              </span>
            </div>
            <p className="mt-1.5 font-display text-base font-extrabold leading-snug text-ink">
              {step.title}
            </p>
            <p className="mt-1 text-xs font-semibold text-muted">
              {step.segmentTitle} · {step.segmentDurationMin} {uz.classroom.minuteShort}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-300",
                  voicePercent > 0 ? "bg-primary-600" : "bg-primary-300",
                )}
                style={{ width: `${Math.max(voicePercent, shownVisible > 0 ? 6 : 0)}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5">
            <div className="flex items-center gap-1.5 text-amber-800">
              <Lightbulb className="size-3.5" aria-hidden="true" />
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em]">
                {uz.classroom.examplesTitle}
              </p>
            </div>
            <p className="mt-1.5 text-xs font-semibold leading-relaxed text-amber-950">
              {example ?? uz.classroom.examplesFallback}
            </p>
          </div>

          {question ? (
            <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-3.5">
              <div className="flex items-center gap-1.5 text-sky-800">
                <MessageCircleQuestion className="size-3.5" aria-hidden="true" />
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em]">
                  {uz.classroom.miniQuestionTitle}
                </p>
              </div>
              <p className="mt-1.5 text-xs font-semibold leading-relaxed text-sky-950">{question}</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
