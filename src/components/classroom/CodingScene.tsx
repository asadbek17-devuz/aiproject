"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Blocks,
  Bug,
  Files,
  GitBranch,
  Monitor,
  Play,
  Search,
} from "lucide-react";
import type { StepCode } from "@/server/ai/lesson-script.schema";
import { uz } from "@/lib/i18n/uz";
import { cn } from "@/lib/utils";
import { MentorAvatar } from "@/components/classroom/mentor-avatar";
import { CodeSurface } from "@/components/classroom/coding/CodeSurface";
import { buildPreviewDoc } from "@/components/classroom/coding/preview";
import {
  TypewriterController,
  estimateSpeechDurationMs,
  type TypewriterStatus,
} from "@/components/classroom/coding/typewriter";

const FILES = ["index.html", "style.css", "script.js"] as const;

const LANGUAGE_LABEL: Record<string, string> = {
  html: "HTML",
  css: "CSS",
  javascript: "JavaScript",
  js: "JavaScript",
  typescript: "TypeScript",
  bash: "Shell",
  json: "JSON",
  markdown: "Markdown",
};

function FileIcon({ file }: { file: string }) {
  if (file.endsWith(".html")) {
    return <span className="text-[8px] font-black text-orange-400">{"<>"}</span>;
  }
  if (file.endsWith(".css")) {
    return <span className="text-[8px] font-black text-sky-400">#</span>;
  }
  if (file.endsWith(".js")) {
    return <span className="text-[8px] font-black text-amber-300">JS</span>;
  }
  return <span className="text-[8px] font-black text-slate-400">{"{}"}</span>;
}

export type CodingSceneProps = {
  code: StepCode;
  narration: string;
  stepKey: string | number;
  active: boolean;
  speaking?: boolean;
  className?: string;
};

export function CodingScene({
  code,
  narration,
  stepKey,
  active,
  speaking = false,
  className,
}: CodingSceneProps) {
  const reduceMotion = useReducedMotion();
  const resetKey = `${stepKey}:${code.file}:${code.content}`;
  const estimated = useMemo(() => estimateSpeechDurationMs(narration), [narration]);

  const [visible, setVisible] = useState(code.typing === "instant" ? code.content : "");
  const [status, setStatus] = useState<TypewriterStatus>(
    code.typing === "instant" ? "complete" : "idle",
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const controllerRef = useRef<TypewriterController | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    controllerRef.current = new TypewriterController({
      text: code.content,
      durationMs: estimated,
      typing: code.typing,
      corrections: code.language === "html",
      seed: code.content.length + code.file.length,
    });
    setVisible(controllerRef.current.visibleText);
    setStatus(controllerRef.current.status);
    setPreviewOpen(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, [resetKey, code.content, code.typing, code.language, code.file, estimated]);

  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller) return;

    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (controller.status === "typing") {
        controller.pause(performance.now());
        setStatus(controller.status);
      }
      return;
    }

    if (controller.status === "complete") return;
    if (controller.status === "idle") {
      controller.start(performance.now());
    } else if (controller.status === "paused") {
      controller.resume(performance.now());
    }

    let last = controller.visibleText;
    const tick = (now: number) => {
      const current = controllerRef.current;
      if (!current) return;
      const next = current.update(now);
      if (next !== last) {
        last = next;
        setVisible(next);
      }
      setStatus(current.status);
      if (current.status === "typing") {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [active, resetKey]);

  useEffect(() => {
    if (status !== "complete" || !code.run) return;
    const timer = setTimeout(() => setPreviewOpen(true), reduceMotion ? 0 : 650);
    return () => clearTimeout(timer);
  }, [status, code.run, reduceMotion]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const typing = active && status === "typing" && code.typing !== "instant";
  const activeLine = visible.split("\n").length;
  const activeColumn = visible.length - visible.lastIndexOf("\n");
  const files = FILES.includes(code.file as (typeof FILES)[number]) ? [...FILES] : [code.file, ...FILES];
  const preview = previewOpen ? buildPreviewDoc(visible || code.content, code.language) : null;

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-[1.4rem] bg-[radial-gradient(circle_at_18%_8%,#e0f2fe_0%,transparent_46%),linear-gradient(180deg,#f8fbff_0%,#eaf2ff_100%)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_80%_18%,rgba(37,99,235,0.10),transparent_34%)]" />
      <div className="pointer-events-none absolute -right-10 top-8 size-40 rounded-full bg-blue-200/20 blur-2xl" />

      <div className="absolute left-3 top-3 z-30 inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-2.5 py-1 shadow-sm backdrop-blur">
        <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
        <span className="text-[10px] font-extrabold text-slate-600">{uz.classroom.liveCode}</span>
      </div>

      <div className="absolute bottom-[13%] left-[1.5%] z-10 w-[30%] max-w-[190px] min-w-[92px] sm:left-[2%]">
        <MentorAvatar
          state={typing ? "writing" : active || speaking ? "speaking" : "waiting"}
          className="size-full drop-shadow-[0_16px_24px_rgba(15,23,42,0.16)]"
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 h-[18%] bg-[linear-gradient(180deg,#e7d3ba_0%,#c9a57f_100%)] shadow-[inset_0_6px_10px_-8px_rgba(15,23,42,0.55)]">
        <div className="h-1.5 w-full bg-white/30" />
        <div className="mx-auto mt-2 h-1 w-28 rounded-full bg-amber-900/10" />
      </div>

      <div className="absolute bottom-[11%] left-[18%] right-[4%] top-[5%] z-20 sm:left-[20%] sm:right-[5%]">
        <div className="relative h-full w-full [perspective:1600px]">
          <div className="absolute inset-0 flex flex-col overflow-hidden rounded-[0.9rem] border-[5px] border-slate-800 bg-[#1e1e1e] shadow-[0_28px_60px_-20px_rgba(15,23,42,0.55)] ring-1 ring-black/40 [transform:rotateY(-4deg)]">
            <div className="flex h-6 shrink-0 items-center gap-2 border-b border-black/40 bg-[#323233] px-2">
              <div className="flex items-center gap-1" aria-hidden="true">
                <span className="size-1.5 rounded-full bg-rose-400" />
                <span className="size-1.5 rounded-full bg-amber-300" />
                <span className="size-1.5 rounded-full bg-emerald-400" />
              </div>
              <p className="min-w-0 flex-1 truncate text-center text-[8px] font-semibold text-slate-300">
                {code.file} — AI Academy
              </p>
              {code.run ? (
                <button
                  type="button"
                  onClick={() => setPreviewOpen((open) => !open)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[8px] font-bold transition-colors",
                    previewOpen
                      ? "bg-slate-600 text-white"
                      : "bg-emerald-600 text-white hover:bg-emerald-500",
                  )}
                  aria-label={previewOpen ? uz.classroom.hidePreview : uz.classroom.runShort}
                >
                  <Play className="size-2" aria-hidden="true" />
                  {previewOpen ? uz.classroom.hidePreview : uz.classroom.runShort}
                </button>
              ) : (
                <span className="size-8" aria-hidden="true" />
              )}
            </div>

            <div className="flex min-h-0 flex-1">
              <div className="hidden w-7 shrink-0 flex-col items-center gap-2.5 border-r border-black/30 bg-[#333333] py-2 min-[380px]:flex">
                <Files className="size-3 text-slate-200" aria-hidden="true" />
                <Search className="size-3 text-slate-500" aria-hidden="true" />
                <GitBranch className="size-3 text-slate-500" aria-hidden="true" />
                <Bug className="size-3 text-slate-500" aria-hidden="true" />
                <Blocks className="size-3 text-slate-500" aria-hidden="true" />
              </div>

              <div className="hidden w-[72px] shrink-0 flex-col border-r border-black/30 bg-[#252526] py-1.5 min-[380px]:flex">
                <p className="px-2 pb-1 text-[7px] font-bold uppercase tracking-wider text-slate-500">
                  {uz.classroom.filesLabel}
                </p>
                {files.map((file) => {
                  const isActive = file === code.file;
                  return (
                    <span
                      key={file}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 text-[8px] font-medium",
                        isActive ? "bg-[#37373d] text-white" : "text-slate-400",
                      )}
                    >
                      <FileIcon file={file} />
                      <span className="truncate">{file}</span>
                    </span>
                  );
                })}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex h-5 shrink-0 items-stretch overflow-hidden bg-[#2d2d2d]">
                  {files.map((file) => {
                    const isActive = file === code.file;
                    return (
                      <span
                        key={file}
                        className={cn(
                          "flex items-center gap-1 border-r border-black/30 px-2 text-[8px] font-medium",
                          isActive
                            ? "border-t-2 border-t-blue-500 bg-[#1e1e1e] text-white"
                            : "text-slate-500",
                        )}
                      >
                        <FileIcon file={file} />
                        <span className="max-w-16 truncate">{file}</span>
                      </span>
                    );
                  })}
                </div>

                <div className={cn("grid min-h-0 flex-1", previewOpen && "grid-cols-2")}>
                  <div className="relative min-w-0 overflow-hidden bg-[#1e1e1e]">
                    {visible.length === 0 && code.typing !== "instant" ? (
                      <div className="flex h-full items-center justify-center px-3 text-center text-[9px] font-medium text-slate-500">
                        {uz.classroom.mentorTyping}
                      </div>
                    ) : (
                      <CodeSurface
                        code={visible}
                        language={code.language}
                        highlightLines={code.highlightLines}
                        activeLine={activeLine}
                        caret={typing}
                      />
                    )}
                    {!typing && status === "paused" ? (
                      <span className="absolute bottom-1 right-1 rounded bg-slate-700/80 px-1.5 py-0.5 text-[7px] font-bold text-slate-300">
                        {uz.classroom.pause}
                      </span>
                    ) : null}
                  </div>

                  {previewOpen ? (
                    <div className="flex min-w-0 flex-col border-l border-black/40 bg-white">
                      <div className="flex h-4 shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-1.5">
                        <span className="flex items-center gap-1 text-[7px] font-bold text-slate-500">
                          <Monitor className="size-2" aria-hidden="true" />
                          {uz.classroom.preview}
                        </span>
                        <span className="flex gap-0.5" aria-hidden="true">
                          <span className="size-1 rounded-full bg-rose-300" />
                          <span className="size-1 rounded-full bg-amber-300" />
                          <span className="size-1 rounded-full bg-emerald-300" />
                        </span>
                      </div>
                      <iframe
                        title={uz.classroom.preview}
                        sandbox="allow-scripts"
                        srcDoc={preview ?? ""}
                        className="min-h-0 w-full flex-1 bg-white"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex h-4 shrink-0 items-center justify-between bg-[#007acc] px-2 text-[7px] font-semibold text-white/90">
              <span className="flex items-center gap-2">
                <span>{LANGUAGE_LABEL[code.language] ?? code.language}</span>
                <span className="hidden min-[380px]:inline">UTF-8</span>
              </span>
              <span>
                {uz.classroom.lineShort} {activeLine}, {uz.classroom.colShort} {activeColumn}
              </span>
            </div>
          </div>

          <div className="absolute -bottom-[7%] left-[-3%] right-[-3%] h-[9%] [clip-path:polygon(3%_0,97%_0,100%_100%,0_100%)] bg-[linear-gradient(180deg,#64748b_0%,#334155_100%)] shadow-[0_10px_18px_-8px_rgba(15,23,42,0.7)]">
            <div className="mx-auto mt-[3%] grid h-[55%] w-[82%] grid-cols-12 gap-[1px] rounded-sm bg-slate-700/70 p-0.5">
              {Array.from({ length: 36 }, (_, index) => (
                <span key={index} className="rounded-[1px] bg-slate-500/40" />
              ))}
            </div>
            <div className="mx-auto mt-[3%] h-[22%] w-[28%] rounded-sm bg-slate-800/50" />
          </div>

          <div className="pointer-events-none absolute -bottom-[1%] left-[36%] right-[22%] z-30 flex justify-center gap-[18%]">
            {[0, 1].map((hand) => (
              <motion.span
                key={hand}
                className="h-3 w-5 rounded-[55%_55%_45%_45%] bg-[#edb98f] shadow-sm sm:h-4 sm:w-7"
                animate={
                  typing && !reduceMotion
                    ? { y: [0, -3, 0], rotate: hand === 0 ? [0, -3, 0] : [0, 3, 0] }
                    : { y: 0 }
                }
                transition={
                  typing && !reduceMotion
                    ? { duration: 0.42, repeat: Infinity, ease: "easeInOut", delay: hand * 0.12 }
                    : { duration: 0.2 }
                }
                aria-hidden="true"
              >
                <span className="mx-auto mt-1 flex w-[70%] justify-between">
                  {[0, 1, 2, 3].map((finger) => (
                    <span key={finger} className="h-1.5 w-0.5 rounded-full bg-[#d9a279]" />
                  ))}
                </span>
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
