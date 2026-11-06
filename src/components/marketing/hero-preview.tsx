"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MentorAvatar, type MentorState } from "@/components/classroom/mentor-avatar";

const preview = uz.landing.hero.preview;
const codeLines = preview.code.split("\n");
const revealCounts = [4, 7, codeLines.length];

export function HeroPreview({ className }: { className?: string }) {
  const [step, setStep] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      setStep((current) => (current + 1) % preview.steps.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const mentorState: MentorState = step === 0 ? "thinking" : "speaking";
  const visible = revealCounts[step] ?? codeLines.length;
  const highlighted = new Set<number>(preview.highlightLines);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-card border-2 border-white bg-surface shadow-lift ring-1 ring-primary-100",
        className,
      )}
    >
      <div className="flex h-11 items-center justify-between border-b border-line bg-gradient-to-r from-slate-50 to-primary-50/60 px-4">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-green-400" />
        </div>
        <span className="truncate text-xs font-medium text-muted">{preview.lesson}</span>
        <Badge variant="outline" className="text-[10px]">
          {uz.common.demo}
        </Badge>
      </div>

      <div className="grid gap-0 sm:grid-cols-[1.45fr_1fr]">
        <div className="border-b border-line p-4 sm:border-b-0 sm:border-r">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">{preview.boardTitle}</h3>
            <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
              HTML
            </span>
          </div>

          <div className="mt-3 overflow-hidden rounded-2xl border-2 border-line/80 bg-slate-50/70 shadow-press">
            <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
              <span className="font-mono text-[11px] text-muted">{preview.codeCaption}</span>
              <span className="text-[10px] font-medium text-muted">live</span>
            </div>
            <pre className="overflow-hidden px-3 py-2 font-mono text-[11px] leading-5 text-slate-700">
              <code>
                {codeLines.map((line, index) => {
                  const shown = index < visible;
                  const isHighlighted = highlighted.has(index + 1);
                  return (
                    <motion.span
                      key={`${line}-${index}`}
                      className={cn(
                        "flex min-h-5 gap-3 rounded px-1",
                        isHighlighted && shown ? "bg-primary-100/70" : "",
                      )}
                      animate={{ opacity: shown ? 1 : 0.15 }}
                      transition={{ duration: 0.25 }}
                    >
                      <span className="w-4 select-none text-right text-slate-400">
                        {index + 1}
                      </span>
                      <span className="whitespace-pre">{line || " "}</span>
                    </motion.span>
                  );
                })}
              </code>
            </pre>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-2xl border border-primary-100 bg-primary-50 px-3 py-2.5">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary-600" aria-hidden="true" />
            <AnimatePresence mode="wait">
              <motion.p
                key={step}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-[11px] leading-relaxed text-primary-900"
              >
                {preview.steps[step]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-primary-50/70 to-sky-50/60 p-4">
          <div className="relative">
            <MentorAvatar state={mentorState} className="size-24 sm:size-28" />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-line bg-surface px-2 py-0.5 text-[10px] font-semibold text-primary-700 shadow-soft">
              {mentorState === "speaking" ? preview.mentorState : "..."}
            </span>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-ink">{preview.mentorName}</p>
            <div className="mt-1 flex items-center justify-center gap-1" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((bar) => (
                <motion.span
                  key={bar}
                  className="w-0.5 rounded-full bg-primary-500"
                  animate={
                    mentorState === "speaking" && !reduceMotion
                      ? { height: [3, 10, 5, 12, 4] }
                      : { height: 3 }
                  }
                  transition={{ duration: 0.8, repeat: Infinity, delay: bar * 0.08 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line bg-slate-50/70 px-4 py-2.5">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white">
          <MessageCircle className="size-3" aria-hidden="true" />
        </span>
        <p className="min-w-0 flex-1 truncate text-[11px] text-slate-600">{preview.subtitle}</p>
        <span className="hidden shrink-0 rounded-full border border-line bg-surface px-2.5 py-1 text-[10px] font-medium text-muted sm:inline">
          {preview.hint}
        </span>
      </div>
    </div>
  );
}
