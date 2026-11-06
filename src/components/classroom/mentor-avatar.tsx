"use client";

import { Bot, CircleHelp, LoaderCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type MentorState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "waiting"
  | "pointing"
  | "writing"
  | "celebrating";

export type MentorAvatarProps = {
  state?: MentorState;
  className?: string;
  label?: string;
};

const ringColors: Record<MentorState, string> = {
  idle: "border-white/70",
  listening: "border-sky-300",
  thinking: "border-amber-300",
  speaking: "border-sky-400",
  waiting: "border-white/70",
  pointing: "border-primary-300",
  writing: "border-primary-300",
  celebrating: "border-amber-300",
};

export function MentorAvatar({ state = "idle", className, label }: MentorAvatarProps) {
  const speaking = state === "speaking";
  const thinking = state === "thinking";
  const waiting = state === "waiting";
  const celebrating = state === "celebrating";

  return (
    <div
      className={cn("relative aspect-square select-none", className)}
      role="img"
      aria-label={label ?? "AI mentor Sardor"}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-200 via-primary-100 to-primary-200" />
      <div className={cn("absolute inset-0 rounded-full border-2", ringColors[state])} />

      <div className="absolute inset-[7%] flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 shadow-[inset_0_-14px_30px_rgba(15,23,42,0.25)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.55),transparent_45%)]" />
        <Bot
          className="relative size-[52%] text-white drop-shadow-[0_2px_6px_rgba(15,23,42,0.35)]"
          strokeWidth={1.7}
          aria-hidden="true"
        />
        <span className="absolute left-[18%] top-[64%] size-[6%] rounded-full bg-sky-200/80" />
        <span className="absolute right-[22%] top-[28%] size-[5%] rounded-full bg-white/60" />
      </div>

      {speaking ? (
        <span
          className="absolute inset-0 animate-ping rounded-full border-2 border-sky-300/60"
          aria-hidden="true"
        />
      ) : null}

      {thinking ? (
        <span className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full bg-white p-[0.35em] shadow-soft">
          <LoaderCircle className="size-[1.15em] animate-spin text-primary-600" aria-hidden="true" />
        </span>
      ) : null}

      {waiting ? (
        <span className="absolute -right-1 -top-1 flex size-[26%] items-center justify-center rounded-full bg-white text-primary-700 shadow-soft">
          <CircleHelp className="size-[68%]" aria-hidden="true" />
        </span>
      ) : null}

      {celebrating ? (
        <span className="absolute -right-1 -top-1 flex size-[26%] items-center justify-center rounded-full bg-amber-300 text-amber-950 shadow-soft">
          <Sparkles className="size-[60%]" aria-hidden="true" />
        </span>
      ) : null}
    </div>
  );
}
