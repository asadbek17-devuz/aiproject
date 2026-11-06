"use client";

import type { FormEvent } from "react";
import {
  Brain,
  Code2,
  MessageCircleQuestion,
  NotebookPen,
  Send,
  Sparkles,
} from "lucide-react";
import type { Exercise } from "@/server/ai/lesson-script.schema";
import { uz } from "@/lib/i18n/uz";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PracticeEditor, type PracticeFeedback } from "@/components/classroom/PracticeEditor";

export type PanelTab = "qa" | "notes" | "practice";

export type LessonNote = {
  id: string;
  text: string;
  stepTitle: string;
};

export type LessonPanelProps = {
  tab: PanelTab;
  onTab: (tab: PanelTab) => void;
  question: string;
  onQuestion: (value: string) => void;
  onAsk: (event: FormEvent<HTMLFormElement>) => void;
  pending: boolean;
  answer: string | null;
  provider: string | null;
  requestError: string | null;
  deepDive: string | null;
  deepDivePending: boolean;
  deepDiveError: string | null;
  onDeepDive: () => void;
  notes: LessonNote[];
  noteDraft: string;
  onNoteDraft: (value: string) => void;
  onSaveNote: () => void;
  exercise?: Exercise;
  exerciseCode: string;
  onExerciseCode: (code: string) => void;
  hintCount: number;
  onHint: () => void;
  onCheck: () => void;
  feedback: PracticeFeedback | null;
  className?: string;
};

const TABS: Array<{ id: PanelTab; label: string; icon: typeof Code2 }> = [
  { id: "qa", label: uz.classroom.questionsTab, icon: MessageCircleQuestion },
  { id: "notes", label: uz.classroom.notesTab, icon: NotebookPen },
  { id: "practice", label: uz.classroom.practiceTab, icon: Code2 },
];

const PANEL_META: Record<
  PanelTab,
  { title: string; subtitle: string; icon: typeof Code2 }
> = {
  qa: {
    title: uz.classroom.qaTitle,
    subtitle: uz.classroom.qaSubtitle,
    icon: MessageCircleQuestion,
  },
  notes: {
    title: uz.classroom.notesTitle,
    subtitle: uz.classroom.notesEmpty,
    icon: NotebookPen,
  },
  practice: {
    title: uz.classroom.exerciseTitle,
    subtitle: uz.classroom.exerciseSubtitle,
    icon: Code2,
  },
};

export function LessonPanel({
  tab,
  onTab,
  question,
  onQuestion,
  onAsk,
  pending,
  answer,
  provider,
  requestError,
  deepDive,
  deepDivePending,
  deepDiveError,
  onDeepDive,
  notes,
  noteDraft,
  onNoteDraft,
  onSaveNote,
  exercise,
  exerciseCode,
  onExerciseCode,
  hintCount,
  onHint,
  onCheck,
  feedback,
  className,
}: LessonPanelProps) {
  const meta = PANEL_META[tab];
  const MetaIcon = meta.icon;

  return (
    <aside
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-[1.5rem] border border-line bg-white shadow-lift",
        className,
      )}
    >
      <div className="shrink-0 border-b border-line bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_100%)] p-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
            <MetaIcon className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-sm font-extrabold text-ink">{meta.title}</p>
            <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-relaxed text-muted">
              {meta.subtitle}
            </p>
          </div>
        </div>

        <div
          role="tablist"
          aria-label={uz.classroom.mentor}
          className="mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-canvas/80 p-1 ring-1 ring-line/70"
        >
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                onClick={() => onTab(item.id)}
                aria-selected={active}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-extrabold transition-all",
                  active
                    ? "bg-white text-primary-700 shadow-soft ring-1 ring-primary-100"
                    : "text-muted hover:bg-white/70 hover:text-ink",
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3.5 sm:p-4">
        {tab === "qa" ? (
          <div className="space-y-3.5">
            <form onSubmit={onAsk} className="space-y-2">
              <Textarea
                name="classroom-question"
                value={question}
                onChange={(event) => onQuestion(event.target.value)}
                placeholder={uz.classroom.questionPlaceholder}
                maxLength={1000}
                rows={3}
                aria-label={uz.classroom.qaTitle}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="submit"
                  size="sm"
                  loading={pending}
                  disabled={question.trim().length < 2}
                >
                  <Send className="size-4" aria-hidden="true" />
                  {uz.classroom.ask}
                </Button>
                {provider ? <Badge variant="outline">{provider}</Badge> : null}
              </div>
            </form>

            {requestError ? (
              <p
                role="alert"
                className="rounded-xl bg-danger-soft px-3 py-2 text-xs font-semibold text-red-700"
              >
                {requestError}
              </p>
            ) : null}

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-muted">
                {uz.classroom.answerLabel}
              </p>
              {answer ? (
                <div className="mt-1.5 rounded-2xl rounded-tl-sm bg-primary-600 px-3.5 py-2.5 text-xs font-semibold leading-relaxed text-white shadow-soft">
                  {answer}
                </div>
              ) : (
                <div className="mt-1.5 flex items-start gap-2 rounded-xl border border-dashed border-line-strong bg-canvas px-3 py-2.5 text-xs text-muted">
                  <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary-500" aria-hidden="true" />
                  {uz.mentorDemo.empty}
                </div>
              )}
            </div>

            <div className="border-t border-line pt-3.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onDeepDive}
                loading={deepDivePending}
                className="w-full"
              >
                <Brain className="size-4" aria-hidden="true" />
                {uz.classroom.deepDive}
              </Button>
              {deepDivePending ? (
                <p className="mt-2 text-xs font-semibold text-muted">{uz.classroom.deepDiveLoading}</p>
              ) : deepDiveError ? (
                <p
                  role="alert"
                  className="mt-2 rounded-xl bg-danger-soft px-3 py-2 text-xs font-semibold text-red-700"
                >
                  {deepDiveError}
                </p>
              ) : deepDive ? (
                <div className="mt-2 rounded-2xl border border-primary-100 bg-primary-50/50 p-3 text-xs font-semibold leading-relaxed text-slate-700">
                  {deepDive}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {tab === "notes" ? (
          <div className="space-y-3">
            <Textarea
              value={noteDraft}
              onChange={(event) => onNoteDraft(event.target.value)}
              placeholder={uz.classroom.notePlaceholder}
              rows={3}
              maxLength={600}
              aria-label={uz.classroom.notesTitle}
            />
            <Button
              type="button"
              size="sm"
              onClick={onSaveNote}
              disabled={noteDraft.trim().length < 2}
              className="w-full"
            >
              <NotebookPen className="size-4" aria-hidden="true" />
              {uz.classroom.saveNote}
            </Button>

            {notes.length > 0 ? (
              <div className="space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-2xl border border-line bg-canvas/60 p-3"
                  >
                    <p className="text-xs font-semibold leading-relaxed text-slate-700">{note.text}</p>
                    <p className="mt-1 text-[10px] font-bold text-muted">{note.stepTitle}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {tab === "practice" ? (
          exercise ? (
            <PracticeEditor
              exercise={exercise}
              code={exerciseCode}
              onCodeChange={onExerciseCode}
              hintCount={hintCount}
              onHint={onHint}
              onCheck={onCheck}
              feedback={feedback}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-line-strong bg-canvas p-5 text-center">
              <p className="text-sm font-semibold text-muted">{uz.classroom.noExercise}</p>
              <p className="mt-1 text-xs text-muted">{uz.classroom.noExerciseHint}</p>
            </div>
          )
        ) : null}
      </div>
    </aside>
  );
}
