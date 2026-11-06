"use client";

import { useActionState, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  ExternalLink,
  FileUp,
  GraduationCap,
  Sparkles,
  Timer,
} from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { formatDateUz } from "@/lib/utils";
import { submitHomeworkAction, type HomeworkState } from "@/modules/homework/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type HomeworkItem = {
  id: string;
  title: string;
  description: string;
  tasks: string[];
  dueAt: Date;
  maxScore: number;
  submission: {
    content: string;
    status: string;
    score: number | null;
    feedback: { summary: string; suggestions: string[] } | null;
    submittedAt: Date;
  } | null;
};

const initialState: HomeworkState = { error: null, success: false, review: null };

export function HomeworkCard({ homework }: { homework: HomeworkItem }) {
  const [state, formAction, pending] = useActionState(submitHomeworkAction, initialState);
  const [open, setOpen] = useState(!homework.submission);
  const review = state.review ?? homework.submission?.feedback ?? null;
  const score = state.review?.score ?? homework.submission?.score ?? null;

  return (
    <article className="overflow-hidden rounded-[1.5rem] border-2 border-white bg-white/90 shadow-soft">
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="primary">{uz.homework.open}</Badge>
              <Badge variant="outline">
                <Timer className="mr-1 size-3" aria-hidden="true" />
                {formatDateUz(homework.dueAt)}
              </Badge>
              {homework.submission ? (
                <Badge variant="success">{uz.homework.submitted}</Badge>
              ) : null}
            </div>
            <h2 className="mt-2 line-clamp-2 font-display text-lg font-extrabold tracking-tight text-ink sm:text-xl">
              {homework.title}
            </h2>
            <p className="mt-1 line-clamp-2 max-w-2xl text-xs font-semibold leading-relaxed text-muted sm:text-sm">
              {homework.description}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] font-bold text-muted">
              <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1">
                <ClipboardList className="size-3" aria-hidden="true" />
                {homework.tasks.length} topshiriq
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1">
                <Sparkles className="size-3 text-primary-600" aria-hidden="true" />
                AI tekshiruv
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-line bg-canvas/70 p-2.5 sm:flex-col sm:px-4">
            <p className="font-display text-2xl font-extrabold text-ink">
              {score ?? "—"}
              <span className="text-sm text-muted">/{homework.maxScore}</span>
            </p>
            <p className="text-[9px] font-bold uppercase tracking-wide text-muted">
              {uz.homework.score}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-extrabold transition-all",
              open
                ? "border-2 border-line bg-white text-ink hover:bg-canvas"
                : "bg-ink text-white hover:-translate-y-0.5",
            )}
          >
            {open ? "Yopish" : homework.submission ? "Qayta tekshirish" : "Topshiriqni yuborish"}
            <ChevronDown
              className={cn("size-3.5 transition-transform", open ? "rotate-180" : "")}
              aria-hidden="true"
            />
          </button>
          {homework.submission ? (
            <span className="text-[11px] font-semibold text-muted">
              Yuborilgan: {formatDateUz(homework.submission.submittedAt)}
            </span>
          ) : null}
        </div>
      </div>

      {open ? (
        <div className="border-t border-line/70 bg-canvas/40 p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="rounded-[1.25rem] border border-line/80 bg-white p-4">
              <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-muted">
                <ClipboardList className="size-3.5" aria-hidden="true" />
                {uz.homework.tasks}
              </p>
              <ul className="mt-2.5 space-y-2">
                {homework.tasks.length === 0 ? (
                  <li className="text-sm font-semibold text-muted">—</li>
                ) : (
                  homework.tasks.map((task) => (
                    <li key={task} className="flex items-start gap-2 text-xs font-semibold leading-relaxed text-slate-700">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden="true" />
                      {task}
                    </li>
                  ))
                )}
              </ul>
              <p className="mt-3 rounded-xl border border-dashed border-line-strong bg-canvas px-3 py-2 text-[11px] font-semibold leading-relaxed text-muted">
                {uz.homework.demoNote}
              </p>
            </div>

            <form action={formAction} className="space-y-3">
              <input type="hidden" name="homeworkId" value={homework.id} />
              {state.error ? (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-danger/20 bg-danger-soft px-3 py-2.5 text-sm text-red-700"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{state.error}</span>
                </div>
              ) : null}
              {state.success ? (
                <div
                  role="status"
                  className="flex items-start gap-2 rounded-xl border border-success/30 bg-success-soft px-3 py-2.5 text-sm font-semibold text-green-800"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{uz.homework.success}</span>
                </div>
              ) : null}

              <Textarea
                label={uz.homework.contentLabel}
                name="content"
                placeholder={uz.homework.contentPlaceholder}
                defaultValue={homework.submission?.content ?? ""}
                rows={5}
                maxLength={20000}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label={uz.homework.fileName}
                  name="link"
                  placeholder="https://github.com/..."
                  defaultValue={
                    homework.submission?.content.match(/https?:\/\/\S+/)?.[0] ?? ""
                  }
                />
                <div>
                  <label
                    htmlFor={`file-${homework.id}`}
                    className="mb-2 flex items-center gap-1.5 text-sm font-extrabold text-ink"
                  >
                    <FileUp className="size-4 text-primary-600" aria-hidden="true" />
                    {uz.homework.fileLabel}
                  </label>
                  <input
                    id={`file-${homework.id}`}
                    name="file"
                    type="file"
                    accept=".html,.css,.js,.ts,.tsx,.jsx,.json,.md,.txt"
                    className="block w-full cursor-pointer rounded-xl border-2 border-line bg-surface px-3 py-2.5 text-xs font-semibold text-muted file:mr-3 file:rounded-full file:border-0 file:bg-primary-100 file:px-3 file:py-1.5 file:text-xs file:font-extrabold file:text-primary-700"
                  />
                </div>
              </div>

              <Button type="submit" loading={pending} className="w-full sm:w-auto">
                <Sparkles className="size-4" aria-hidden="true" />
                {homework.submission ? uz.homework.reviewButton : uz.homework.submitButton}
              </Button>
            </form>
          </div>
        </div>
      ) : null}

      {review ? (
        <div className="border-t border-line/70 bg-gradient-to-br from-primary-50/60 to-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary-600 text-white">
              <GraduationCap className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-ink">{uz.homework.feedback}</p>
              {homework.submission ? (
                <p className="text-[11px] font-semibold text-muted">
                  {formatDateUz(homework.submission.submittedAt)}
                </p>
              ) : null}
            </div>
            <Badge variant="success">
              {score ?? "—"}/{homework.maxScore} {uz.homework.points}
            </Badge>
          </div>
          <p className="mt-2.5 text-sm font-semibold leading-relaxed text-slate-700">
            {review.summary || uz.homework.noFeedback}
          </p>
          {review.suggestions.length > 0 ? (
            <ul className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
              {review.suggestions.map((suggestion) => (
                <li
                  key={suggestion}
                  className="flex items-start gap-1.5 rounded-xl bg-white/80 px-2.5 py-2 text-xs font-semibold leading-relaxed text-slate-700"
                >
                  <ExternalLink className="mt-0.5 size-3 shrink-0 text-primary-600" aria-hidden="true" />
                  {suggestion}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
