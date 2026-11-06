"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Info, Lightbulb, TriangleAlert } from "lucide-react";
import type { BoardAction } from "@/server/ai/lesson-script.schema";
import { cn } from "@/lib/utils";
import { uz } from "@/lib/i18n/uz";
import { filterBoardActions } from "@/components/classroom/board-actions";

type WhiteboardProps = {
  actions: BoardAction[];
  activeIndex?: number;
  visibleCount?: number;
  showHeader?: boolean;
  className?: string;
};

const noteStyles = {
  info: {
    icon: Info,
    className: "border-sky-200 bg-sky-50 text-sky-900",
    iconClassName: "text-sky-600",
  },
  tip: {
    icon: Lightbulb,
    className: "border-emerald-200 bg-emerald-50 text-emerald-900",
    iconClassName: "text-emerald-600",
  },
  warning: {
    icon: TriangleAlert,
    className: "border-amber-200 bg-amber-50 text-amber-900",
    iconClassName: "text-amber-600",
  },
} as const;

function tokenClassName(token: string, language: string): string | null {
  if (token.startsWith("<!--") || token.startsWith("//") || token.startsWith("/*")) {
    return "text-slate-500 italic";
  }
  if (/^<\/?[a-zA-Z][\w-]*$/.test(token) || token === ">" || token === "/>") {
    return "text-sky-300";
  }
  if (/^["'].*["']$/.test(token)) {
    return "text-amber-200";
  }
  if (
    /^(const|let|var|function|return|if|else|for|while|class|new|import|export|from|true|false|null|undefined|async|await)$/.test(
      token,
    )
  ) {
    return "text-emerald-300";
  }
  if (/^#[0-9a-fA-F]{3,8}$/.test(token) || /^\d+(?:\.\d+)?(?:px|rem|em|%|s|ms)?$/.test(token)) {
    return "text-rose-300";
  }
  if (/^[a-zA-Z-]+(?=:)/.test(token) && language === "css") {
    return "text-sky-300";
  }
  return null;
}

function highlightLine(line: string, language: string): ReactNode[] {
  const parts = line.split(
    /(<!--[\s\S]*?-->|\/\/.*$|\/\*[\s\S]*?\*\/|<\/?[a-zA-Z][\w-]*|\/?>|"[^"]*"|'[^']*'|\b(?:const|let|var|function|return|if|else|for|while|class|new|import|export|from|true|false|null|undefined|async|await)\b|#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|%|s|ms)?\b)/g,
  );

  return parts.map((part, index) => {
    if (!part) return null;
    const className = tokenClassName(part, language);
    return className ? (
      <span key={`${part}-${index}`} className={className}>
        {part}
      </span>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    );
  });
}

function CodeBoard({
  action,
}: {
  action: Extract<BoardAction, { type: "code" }>;
}) {
  const lines = action.code.split("\n");
  const highlighted = new Set(action.highlightLines);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-soft">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-rose-400" />
          <span className="size-2 rounded-full bg-amber-300" />
          <span className="size-2 rounded-full bg-emerald-400" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {action.language}
        </span>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-6 text-slate-200">
        <code>
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            return (
              <span
                key={lineNumber}
                className={cn(
                  "flex min-h-6 rounded px-2",
                  highlighted.has(lineNumber) && "bg-amber-400/10 ring-1 ring-inset ring-amber-400/30",
                )}
              >
                <span className="mr-4 w-6 shrink-0 select-none text-right text-slate-600">
                  {lineNumber}
                </span>
                <span className="whitespace-pre">{highlightLine(line, action.language)}</span>
              </span>
            );
          })}
        </code>
      </pre>
      {action.caption ? (
        <p className="border-t border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400">
          {action.caption}
        </p>
      ) : null}
    </div>
  );
}

function DiagramBoard({
  action,
}: {
  action: Extract<BoardAction, { type: "diagram" }>;
}) {
  const edges = action.mermaid
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.includes("-->"))
    .map((line) => {
      const labels = [...line.matchAll(/\[([^\]]+)\]/g)].map((match) => match[1]);
      return labels.length >= 2 ? { from: labels[0], to: labels[1] } : null;
    })
    .filter((edge): edge is { from: string; to: string } => Boolean(edge));

  if (edges.length === 0) {
    return (
      <pre className="overflow-x-auto rounded-2xl border border-line bg-canvas p-4 text-xs leading-6 text-slate-600">
        {action.mermaid}
      </pre>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-canvas p-4">
      <div className="flex flex-col gap-2">
        {edges.map((edge, index) => (
          <div key={`${edge.from}-${edge.to}-${index}`} className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-extrabold text-primary-800">
              {edge.from}
            </span>
            <span className="text-sm font-black text-primary-400" aria-hidden="true">
              →
            </span>
            <span className="rounded-xl border border-line-strong bg-surface px-3 py-1.5 text-xs font-extrabold text-ink">
              {edge.to}
            </span>
          </div>
        ))}
      </div>
      {action.caption ? (
        <p className="mt-3 text-xs font-semibold text-muted">{action.caption}</p>
      ) : null}
    </div>
  );
}

function BoardBlock({ action }: { action: BoardAction }) {
  if (action.type === "heading") {
    return (
      <h3 className="font-display text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
        {action.text}
      </h3>
    );
  }

  if (action.type === "text") {
    return <p className="text-sm font-semibold leading-relaxed text-slate-700">{action.text}</p>;
  }

  if (action.type === "note") {
    const style = noteStyles[action.tone];
    const Icon = style.icon;
    return (
      <div className={cn("flex items-start gap-2.5 rounded-2xl border px-3.5 py-3", style.className)}>
        <Icon className={cn("mt-0.5 size-4 shrink-0", style.iconClassName)} aria-hidden="true" />
        <p className="text-sm font-semibold leading-relaxed">{action.text}</p>
      </div>
    );
  }

  if (action.type === "code") {
    return <CodeBoard action={action} />;
  }

  if (action.type === "table") {
    return (
      <div className="overflow-hidden rounded-2xl border border-line">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-canvas">
            <tr>
              {action.headers.map((header) => (
                <th key={header} className="border-b border-line px-3 py-2 font-extrabold text-ink">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {action.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="odd:bg-white even:bg-canvas/60">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border-b border-line/70 px-3 py-2 font-semibold text-slate-700 last:border-b-0"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {action.caption ? (
          <p className="border-t border-line bg-canvas px-3 py-2 text-xs font-semibold text-muted">
            {action.caption}
          </p>
        ) : null}
      </div>
    );
  }

  return <DiagramBoard action={action} />;
}

export function Whiteboard({
  actions,
  activeIndex = -1,
  visibleCount = actions.length,
  showHeader = true,
  className,
}: WhiteboardProps) {
  const reduceMotion = useReducedMotion();
  const prepared = filterBoardActions(actions);
  const visible = prepared.slice(0, Math.max(0, visibleCount));

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card border border-line bg-white shadow-soft",
        className,
      )}
    >
      {showHeader ? (
        <div className="flex items-center gap-2 border-b border-line bg-canvas/80 px-4 py-3">
          <span className="flex size-2.5 items-center justify-center rounded-full bg-primary-600">
            <span className="size-1.5 rounded-full bg-white" />
          </span>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
            {uz.classroom.boardTitle}
          </p>
        </div>
      ) : null}

      <div className="relative min-h-[260px] bg-[#fffdf8] p-4 sm:min-h-[320px] sm:p-5">
        <div className="relative z-10 flex flex-col gap-3.5">
          {visible.length === 0 ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-line-strong bg-white/70 p-6 text-center">
              <p className="max-w-xs text-sm font-semibold text-muted">
                Mentor tushuntirishni boshlasa, doska shu yerda jonlanadi.
              </p>
            </div>
          ) : (
            visible.map((action, index) => {
              const isActive = index === activeIndex;
              return (
                <motion.div
                  key={`${action.type}-${index}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.06 }}
                  className={cn(
                    "relative rounded-2xl bg-white/80 p-1 transition-shadow",
                    isActive && "ring-2 ring-primary-400 ring-offset-2 ring-offset-white",
                  )}
                >
                  <BoardBlock action={action} />
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
