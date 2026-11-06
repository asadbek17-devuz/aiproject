"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Code2, Lightbulb, Play, RotateCcw } from "lucide-react";
import type { Exercise } from "@/server/ai/lesson-script.schema";
import { uz } from "@/lib/i18n/uz";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MonacoCodeEditor } from "@/components/classroom/coding/MonacoCodeEditor";
import { buildPreviewDoc } from "@/components/classroom/coding/preview";

export type PracticeFeedback = {
  ok: boolean;
  text: string;
};

export type PracticeEditorProps = {
  exercise: Exercise;
  code: string;
  onCodeChange: (code: string) => void;
  hintCount: number;
  onHint: () => void;
  onCheck: () => void;
  feedback: PracticeFeedback | null;
  className?: string;
};

export function PracticeEditor({
  exercise,
  code,
  onCodeChange,
  hintCount,
  onHint,
  onCheck,
  feedback,
  className,
}: PracticeEditorProps) {
  const reduceMotion = useReducedMotion();
  const [preview, setPreview] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  function run() {
    setPreview(buildPreviewDoc(code, exercise.language));
    setPreviewOpen(true);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <p className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-[13px] font-medium leading-relaxed text-slate-700">
        {exercise.prompt}
      </p>

      <div className={cn("grid gap-3", previewOpen && "lg:grid-cols-[1.15fr_0.85fr]")}>
        <div className="h-[280px] overflow-hidden rounded-xl">
          <MonacoCodeEditor
            value={code}
            language={exercise.language}
            onChange={onCodeChange}
            ariaLabel={uz.classroom.exerciseTitle}
          />
        </div>

        {previewOpen ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.24 }}
            className="flex h-[280px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-1.5">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="size-2 rounded-full bg-rose-300" />
                <span className="size-2 rounded-full bg-amber-300" />
                <span className="size-2 rounded-full bg-emerald-300" />
              </div>
              <span className="text-[10px] font-semibold text-muted">{uz.classroom.preview}</span>
            </div>
            <iframe
              title={uz.classroom.preview}
              sandbox="allow-scripts"
              srcDoc={preview ?? ""}
              className="h-full w-full flex-1 bg-white"
            />
          </motion.div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={run}>
          <Play className="size-4" aria-hidden="true" />
          {uz.classroom.runCode}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onHint} disabled={hintCount >= exercise.hints.length}>
          <Lightbulb className="size-4" aria-hidden="true" />
          {uz.classroom.hint}
        </Button>
        <span className="text-xs font-semibold text-muted">
          {uz.classroom.hintsProgress} {hintCount}/{exercise.hints.length}
        </span>
        <Button type="button" variant="secondary" size="sm" onClick={onCheck}>
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {uz.classroom.check}
        </Button>
        {exercise.starterCode ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onCodeChange(exercise.starterCode ?? "");
              setPreviewOpen(false);
            }}
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            {uz.classroom.resetCode}
          </Button>
        ) : null}
      </div>

      {previewOpen ? (
        <p className="text-[11px] font-medium text-muted">{uz.classroom.exerciseRunSandbox}</p>
      ) : (
        <p className="text-[11px] font-medium text-muted">{uz.classroom.runHint}</p>
      )}

      {hintCount > 0 ? (
        <div className="space-y-1.5">
          {exercise.hints.slice(0, hintCount).map((hint, index) => (
            <motion.p
              key={hint}
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900"
            >
              <span className="font-bold">{index + 1}.</span>
              {hint}
            </motion.p>
          ))}
        </div>
      ) : null}

      {feedback ? (
        <p
          role="status"
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-semibold",
            feedback.ok ? "bg-success-soft text-green-800" : "bg-amber-50 text-amber-900",
          )}
        >
          {feedback.text}
        </p>
      ) : null}

      {!exercise.starterCode ? (
        <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted">
          <Code2 className="size-3.5" aria-hidden="true" />
          {uz.classroom.exerciseSubtitle}
        </p>
      ) : null}
    </div>
  );
}
