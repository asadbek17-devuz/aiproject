"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const KEYWORDS = new Set([
  "const",
  "let",
  "var",
  "function",
  "return",
  "if",
  "else",
  "for",
  "while",
  "class",
  "new",
  "import",
  "export",
  "from",
  "true",
  "false",
  "null",
  "undefined",
  "async",
  "await",
  "document",
  "window",
  "addEventListener",
]);

function tokenClass(token: string, language: string): string | null {
  if (
    token.startsWith("<!--") ||
    token.startsWith("//") ||
    token.startsWith("/*") ||
    (token.startsWith("#") && language === "bash")
  ) {
    return "text-slate-500 italic";
  }
  if (/^<\/?[a-zA-Z][\w-]*$/.test(token) || token === ">" || token === "/>") {
    return "text-sky-300";
  }
  if (/^["'`].*["'`]$/.test(token)) {
    return "text-amber-200";
  }
  if (KEYWORDS.has(token)) {
    return "text-emerald-300";
  }
  if (/^#[0-9a-fA-F]{3,8}$/.test(token) || /^\d+(?:\.\d+)?(?:px|rem|em|%|s|ms)?$/.test(token)) {
    return "text-rose-300";
  }
  if (/^[a-zA-Z-]+$/.test(token) && language === "css") {
    return "text-sky-300";
  }
  return null;
}

function highlightDark(line: string, language: string): ReactNode[] {
  const parts = line.split(
    /(<!--[\s\S]*?-->|\/\/.*$|\/\*[\s\S]*?\*\/|<\/?[a-zA-Z][\w-]*|\/?>|"[^"]*"|'[^']*'|`[^`]*`|\b(?:const|let|var|function|return|if|else|for|while|class|new|import|export|from|true|false|null|undefined|async|await|document|window|addEventListener)\b|#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|%|s|ms)?\b)/g,
  );

  return parts.map((part, index) => {
    if (!part) return null;
    const className = tokenClass(part, language);
    return className ? (
      <span key={`${part}-${index}`} className={className}>
        {part}
      </span>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    );
  });
}

export type CodeSurfaceProps = {
  code: string;
  language: string;
  highlightLines?: number[];
  activeLine?: number;
  caret?: boolean;
  className?: string;
};

export function CodeSurface({
  code,
  language,
  highlightLines = [],
  activeLine = 1,
  caret = false,
  className,
}: CodeSurfaceProps) {
  const lines = code.split("\n");
  const highlighted = new Set(highlightLines);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const container = scrollRef.current;
    const current = lineRefs.current[Math.max(0, activeLine - 1)];
    if (!container || !current) return;
    const top = current.offsetTop - container.clientHeight / 2 + 16;
    container.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [activeLine]);

  return (
    <div ref={scrollRef} className={cn("coding-scroll h-full overflow-auto py-2", className)}>
      <code className="block font-mono text-[10px] leading-[18px] text-slate-300 sm:text-[11px]">
        {lines.map((line, index) => {
          const lineNumber = index + 1;
          const isActive = lineNumber === activeLine;
          const isHighlighted = highlighted.has(lineNumber) && lineNumber <= activeLine;
          return (
            <span
              key={lineNumber}
              ref={(node) => {
                lineRefs.current[index] = node;
              }}
              className={cn(
                "flex min-h-[18px] px-2",
                isHighlighted && "bg-sky-400/10",
                isActive && "bg-slate-700/30",
              )}
            >
              <span className="mr-2.5 w-5 shrink-0 select-none text-right text-slate-600">{lineNumber}</span>
              <span className="whitespace-pre">
                {highlightDark(line, language)}
                {caret && isActive ? (
                  <span className="ml-px inline-block h-[12px] w-[5px] translate-y-[2px] animate-pulse bg-sky-300" />
                ) : null}
              </span>
            </span>
          );
        })}
      </code>
    </div>
  );
}
