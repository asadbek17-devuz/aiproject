"use client";

import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Square,
} from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type PlaybackControlsProps = {
  playing: boolean;
  paused: boolean;
  stopped: boolean;
  completed: boolean;
  atStart: boolean;
  atEnd: boolean;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onPrev: () => void;
  onNext: () => void;
  onReplay: () => void;
  onSpeed: (speed: number) => void;
  onStop: () => void;
  className?: string;
};

const SPEEDS = [0.8, 1, 1.2] as const;

export function PlaybackControls({
  playing,
  paused,
  stopped,
  completed,
  atStart,
  atEnd,
  speed,
  onPlay,
  onPause,
  onResume,
  onPrev,
  onNext,
  onReplay,
  onSpeed,
  onStop,
  className,
}: PlaybackControlsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-3 py-2.5 shadow-soft sm:px-4",
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onPrev}
          disabled={atStart}
          aria-label={uz.classroom.prevStep}
          title={uz.classroom.prevStep}
        >
          <SkipBack className="size-4" aria-hidden="true" />
        </Button>

        {playing ? (
          <Button
            type="button"
            size="icon"
            onClick={onPause}
            aria-label={uz.classroom.pause}
            title={uz.classroom.pause}
          >
            <Pause className="size-4" aria-hidden="true" />
          </Button>
        ) : paused ? (
          <Button
            type="button"
            size="icon"
            onClick={onResume}
            aria-label={uz.classroom.resume}
            title={uz.classroom.resume}
          >
            <Play className="size-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            onClick={onPlay}
            aria-label={completed ? uz.classroom.repeat : uz.classroom.start}
            title={completed ? uz.classroom.repeat : stopped ? uz.classroom.continueLesson : uz.classroom.start}
          >
            {completed ? (
              <RotateCcw className="size-4" aria-hidden="true" />
            ) : (
              <Play className="size-4" aria-hidden="true" />
            )}
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onNext}
          disabled={atEnd}
          aria-label={uz.classroom.nextStep}
          title={uz.classroom.nextStep}
        >
          <SkipForward className="size-4" aria-hidden="true" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onReplay}
          aria-label={uz.classroom.replayStep}
          title={uz.classroom.replayStep}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden text-[11px] font-bold text-muted sm:inline">{uz.classroom.speed}</span>
        <div className="flex rounded-xl border border-line bg-canvas p-0.5" role="group" aria-label={uz.classroom.speed}>
          {SPEEDS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onSpeed(value)}
              aria-pressed={speed === value}
              className={cn(
                "rounded-lg px-2 py-1 text-[11px] font-extrabold transition-colors",
                speed === value ? "bg-primary-600 text-white shadow-sm" : "text-muted hover:text-ink",
              )}
            >
              {value}x
            </button>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onStop}
          disabled={!playing && !paused}
          aria-label={uz.classroom.stop}
          title={uz.classroom.stop}
        >
          <Square className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
