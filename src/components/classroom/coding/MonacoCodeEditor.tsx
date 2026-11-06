"use client";

import dynamic from "next/dynamic";
import type { Monaco } from "@monaco-editor/react";
import { cn } from "@/lib/utils";

const Editor = dynamic(() => import("@monaco-editor/react").then((module) => module.default), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-52 items-center justify-center rounded-xl bg-[#1e1e1e] text-xs font-semibold text-slate-400">
      Muharrir yuklanmoqda...
    </div>
  ),
});

export type MonacoCodeEditorProps = {
  value: string;
  language: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
  height?: string;
  ariaLabel?: string;
};

function beforeMount(monaco: Monaco) {
  monaco.editor.defineTheme("ai-academy-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6b7b8f", fontStyle: "italic" },
      { token: "keyword", foreground: "6ee7b7" },
      { token: "string", foreground: "fcd34d" },
      { token: "tag", foreground: "7dd3fc" },
      { token: "attribute.name", foreground: "93c5fd" },
      { token: "number", foreground: "fda4af" },
    ],
    colors: {
      "editor.background": "#1e1e1e",
      "editor.foreground": "#d4d4d4",
      "editorLineNumber.foreground": "#5b6472",
      "editorLineNumber.activeForeground": "#cbd5e1",
      "editor.lineHighlightBackground": "#2a3441",
      "editor.selectionBackground": "#2563eb55",
      "editorCursor.foreground": "#60a5fa",
      "editorIndentGuide.background1": "#33415580",
      "editorGutter.background": "#1e1e1e",
    },
  });
}

export function MonacoCodeEditor({
  value,
  language,
  onChange,
  readOnly = false,
  className,
  height = "100%",
  ariaLabel,
}: MonacoCodeEditorProps) {
  return (
    <div className={cn("h-full w-full overflow-hidden rounded-xl border border-slate-800", className)}>
      <Editor
        height={height}
        language={language}
        value={value}
        theme="ai-academy-dark"
        beforeMount={beforeMount}
        onChange={(next) => onChange?.(next ?? "")}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 12,
          lineHeight: 20,
          fontFamily: '"JetBrains Mono Variable", ui-monospace, monospace',
          fontLigatures: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: "on",
          tabSize: 2,
          padding: { top: 10, bottom: 10 },
          renderLineHighlight: "all",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          ariaLabel: ariaLabel ?? "Kod muharriri",
        }}
        loading={
          <div className="flex h-full items-center justify-center bg-[#1e1e1e] text-xs font-semibold text-slate-400">
            Muharrir yuklanmoqda...
          </div>
        }
      />
    </div>
  );
}
