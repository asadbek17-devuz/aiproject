"use client";

import { useState } from "react";
import { uz } from "@/lib/i18n/uz";
import { cn } from "@/lib/utils";
import { MentorAvatar, type MentorState } from "@/components/classroom/mentor-avatar";

const states: { value: MentorState; label: string }[] = [
  { value: "idle", label: uz.landing.mentor.states.idle },
  { value: "thinking", label: uz.landing.mentor.states.thinking },
  { value: "speaking", label: uz.landing.mentor.states.speaking },
];

export function MentorShowcase() {
  const [state, setState] = useState<MentorState>("speaking");

  return (
    <div className="rounded-card border border-line bg-surface p-5 shadow-soft sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink">{uz.landing.mentor.statesTitle}</p>
        <span className="size-2 rounded-full bg-success" aria-hidden="true" />
      </div>
      <div className="mt-4 flex justify-center rounded-control bg-primary-50/60 p-5">
        <MentorAvatar state={state} className="size-32 sm:size-40" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-1.5" role="group" aria-label={uz.landing.mentor.statesTitle}>
        {states.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setState(item.value)}
            aria-pressed={state === item.value}
            className={cn(
              "rounded-control px-2 py-2 text-xs font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
              state === item.value
                ? "bg-primary-600 text-white shadow-soft"
                : "bg-slate-100 text-muted hover:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-muted">{uz.landing.mentor.statesHint}</p>
    </div>
  );
}
