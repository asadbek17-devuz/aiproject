import type { FlatLessonStep } from "@/server/ai/lesson-script.schema";

export type LessonSegment = {
  type: string;
  title: string;
  durationMin: number;
  startStep: number;
  stepCount: number;
};

export function buildSegments(steps: FlatLessonStep[]): LessonSegment[] {
  const segments: LessonSegment[] = [];
  steps.forEach((step, index) => {
    const existing = segments.find((segment) => segment.type === step.segmentType);
    if (existing) {
      existing.stepCount += 1;
      return;
    }
    segments.push({
      type: step.segmentType,
      title: step.segmentTitle,
      durationMin: step.segmentDurationMin,
      startStep: index,
      stepCount: 1,
    });
  });
  return segments;
}

export function totalDurationMs(segments: LessonSegment[]): number {
  return segments.reduce((total, segment) => total + segment.durationMin * 60_000, 0);
}

export function estimateElapsedMs(
  segments: LessonSegment[],
  stepIndex: number,
  stepProgress = 0,
): number {
  let elapsed = 0;
  for (const segment of segments) {
    const segmentMs = segment.durationMin * 60_000;
    if (stepIndex >= segment.startStep + segment.stepCount) {
      elapsed += segmentMs;
      continue;
    }
    if (stepIndex >= segment.startStep) {
      const within = stepIndex - segment.startStep + Math.min(1, Math.max(0, stepProgress));
      elapsed += (within / Math.max(1, segment.stepCount)) * segmentMs;
    }
    break;
  }
  return elapsed;
}

export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function segmentState(
  segment: LessonSegment,
  stepIndex: number,
): "done" | "active" | "upcoming" {
  if (stepIndex >= segment.startStep + segment.stepCount) return "done";
  if (stepIndex >= segment.startStep) return "active";
  return "upcoming";
}
