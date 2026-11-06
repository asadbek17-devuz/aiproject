"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MessageCircleQuestion,
  RotateCcw,
  Square,
  Volume2,
} from "lucide-react";
import type { FlatLessonStep } from "@/server/ai/lesson-script.schema";
import { uz } from "@/lib/i18n/uz";
import {
  buildSegments,
  estimateElapsedMs,
  totalDurationMs,
} from "@/lib/lesson-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MentorState } from "@/components/classroom/mentor-avatar";
import { ClassroomStage } from "@/components/classroom/ClassroomStage";
import { PlaybackControls } from "@/components/classroom/PlaybackControls";
import { LessonRail } from "@/components/classroom/LessonRail";
import { LessonPanel, type LessonNote, type PanelTab } from "@/components/classroom/LessonPanel";
import { useMentorVoice } from "@/components/classroom/use-mentor-voice";
import { completeLessonAction } from "@/modules/learning/actions";

type ClassroomPlayerProps = {
  lessonId: string;
  lessonTitle: string;
  steps: FlatLessonStep[];
};

type AskResponse = {
  answer?: string;
  provider?: string;
  error?: string;
};

type Feedback = {
  ok: boolean;
  text: string;
};

function panelTabForStep(step: FlatLessonStep | undefined): PanelTab {
  if (!step) return "qa";
  if (step.exercise) return "practice";
  const phase = `${step.segmentType} ${step.segmentTitle}`.toLowerCase();
  if (phase.includes("savol") || phase.includes("qa") || phase.includes("suhbat")) return "qa";
  return "notes";
}

export function ClassroomPlayer({ lessonId, lessonTitle, steps }: ClassroomPlayerProps) {
  const voice = useMentorVoice();
  const stopVoice = voice.stop;
  const [stepIndex, setStepIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [stopConfirmOpen, setStopConfirmOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [mentorState, setMentorState] = useState<MentorState>("idle");
  const [speed, setSpeed] = useState(1);
  const [panelTab, setPanelTab] = useState<PanelTab>(() => panelTabForStep(steps[0]));
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [deepDive, setDeepDive] = useState<string | null>(null);
  const [deepDivePending, setDeepDivePending] = useState(false);
  const [deepDiveError, setDeepDiveError] = useState<string | null>(null);
  const [exerciseCode, setExerciseCode] = useState(steps[0]?.exercise?.starterCode ?? "");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [hintCount, setHintCount] = useState(0);
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [noteDraft, setNoteDraft] = useState("");

  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const qaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionRef = useRef({ active: false, paused: false });
  const stepFinishedRef = useRef(false);
  const stepIndexRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (revealTimer.current) clearTimeout(revealTimer.current);
    if (finishTimer.current) clearTimeout(finishTimer.current);
    if (qaTimer.current) clearTimeout(qaTimer.current);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    revealTimer.current = null;
    finishTimer.current = null;
    qaTimer.current = null;
    advanceTimer.current = null;
  }, []);

  const step = steps[stepIndex];
  const exercise = step?.exercise;
  const totalSteps = steps.length;
  const segments = buildSegments(steps);
  const totalMs = totalDurationMs(segments);
  const stepProgress = completed ? 1 : voice.progress;
  const elapsedMs = completed ? totalMs : estimateElapsedMs(segments, stepIndex, stepProgress);

  const prepareStep = useCallback(
    (index: number) => {
      clearTimers();
      stopVoice();
      const nextStep = steps[index];
      const previousSegment = steps[stepIndexRef.current]?.segmentType;
      stepIndexRef.current = index;
      setStepIndex(index);
      setVisibleCount(0);
      setActiveIndex(-1);
      setPlaying(false);
      setPaused(false);
      setStopped(false);
      setStopConfirmOpen(false);
      setCompleted(false);
      setMentorState("idle");
      sessionRef.current = { active: false, paused: false };
      stepFinishedRef.current = false;
      setAnswer(null);
      setProvider(null);
      setRequestError(null);
      setDeepDive(null);
      setDeepDivePending(false);
      setDeepDiveError(null);
      setExerciseCode(nextStep?.exercise?.starterCode ?? "");
      setFeedback(null);
      setHintCount(0);
      if (!previousSegment || previousSegment !== nextStep?.segmentType) {
        setPanelTab(panelTabForStep(nextStep));
      }
    },
    [clearTimers, steps, stopVoice],
  );

  function scheduleAdvance(delayMs = 1800) {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
    if (!sessionRef.current.active || sessionRef.current.paused) return;

    advanceTimer.current = setTimeout(() => {
      if (!sessionRef.current.active || sessionRef.current.paused) return;
      const current = stepIndexRef.current;
      if (current >= totalSteps - 1) {
        completeLesson();
        return;
      }
      playStep(current + 1);
    }, delayMs);
  }

  function completeLesson() {
    clearTimers();
    stopVoice();
    sessionRef.current = { active: false, paused: false };
    setPlaying(false);
    setPaused(false);
    setStopped(false);
    setCompleted(true);
    setMentorState("celebrating");
    const current = steps[stepIndexRef.current];
    setVisibleCount(current?.boardActions.length ?? 0);
    setActiveIndex((current?.boardActions.length ?? 0) - 1);
    void completeLessonAction(lessonId);
  }

  function finishStep() {
    if (stepFinishedRef.current) return;
    stepFinishedRef.current = true;
    const current = steps[stepIndexRef.current];
    const boardCount = current?.boardActions.length ?? 0;
    clearTimers();
    setVisibleCount(boardCount);
    setActiveIndex(boardCount - 1);
    setMentorState("waiting");

    if (current?.exercise) return;
    scheduleAdvance(1800);
  }

  async function playStep(index = stepIndexRef.current) {
    const current = steps[index];
    if (!current) return;

    prepareStep(index);
    sessionRef.current = { active: true, paused: false };
    setPlaying(true);
    setMentorState(current.code || current.boardActions.length > 0 ? "writing" : "speaking");

    const boardCount = current.boardActions.length;
    let revealed = 0;

    const reveal = () => {
      revealed += 1;
      setVisibleCount(revealed);
      setActiveIndex(revealed - 1);
      if (revealed < boardCount) {
        revealTimer.current = setTimeout(reveal, 1200);
      } else {
        setMentorState("speaking");
      }
    };

    if (boardCount > 0) {
      revealTimer.current = setTimeout(reveal, 400);
    }

    const result = await voice.speak(current.narration, {
      style: "mentor",
      rate: speed,
      onEnd: finishStep,
    });
    if (!sessionRef.current.active || sessionRef.current.paused) return;
    if (result === "blocked") {
      finishTimer.current = setTimeout(finishStep, 12000);
    }
  }

  function pauseLesson() {
    if (!sessionRef.current.active || sessionRef.current.paused) return;
    sessionRef.current.paused = true;
    setPaused(true);
    setPlaying(false);
    clearTimers();
    voice.pause();
    setMentorState("waiting");
  }

  async function resumeLesson() {
    if (!sessionRef.current.active) {
      playStep(stepIndexRef.current);
      return;
    }

    sessionRef.current.paused = false;
    setPaused(false);
    setPlaying(true);
    const current = steps[stepIndexRef.current];
    setVisibleCount(current?.boardActions.length ?? 0);
    setActiveIndex((current?.boardActions.length ?? 0) - 1);
    await voice.resume();

    if (stepFinishedRef.current) {
      scheduleAdvance(800);
    } else if (voice.blocked) {
      finishTimer.current = setTimeout(finishStep, 12000);
    } else if (voice.state === "idle") {
      setMentorState("speaking");
    }
  }

  function requestStop() {
    setStopConfirmOpen(true);
  }

  function confirmStop() {
    clearTimers();
    stopVoice();
    sessionRef.current = { active: false, paused: false };
    setPlaying(false);
    setPaused(false);
    setStopped(true);
    setStopConfirmOpen(false);
    setMentorState("waiting");
  }

  async function onAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = question.trim();
    if (clean.length < 2 || pending) return;

    if (sessionRef.current.active && !sessionRef.current.paused) {
      pauseLesson();
    }
    setPanelTab("qa");
    setPending(true);
    setRequestError(null);
    setAnswer(null);
    setMentorState("thinking");

    try {
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, stepIndex, question: clean }),
      });
      const data = (await response.json()) as AskResponse;
      if (!response.ok || !data.answer) {
        throw new Error(data.error ?? "ask_failed");
      }

      setAnswer(data.answer);
      setProvider(data.provider ?? null);
      setQuestion("");
      setMentorState("speaking");
      if (qaTimer.current) clearTimeout(qaTimer.current);
      qaTimer.current = setTimeout(() => setMentorState("waiting"), 20000);
      void voice.speak(data.answer, {
        style: "mentor",
        rate: speed,
        onEnd: () => {
          if (qaTimer.current) clearTimeout(qaTimer.current);
          setMentorState("waiting");
        },
      });
    } catch {
      setRequestError(uz.classroom.error);
      setMentorState("listening");
    } finally {
      setPending(false);
    }
  }

  async function onDeepDive() {
    if (deepDivePending) return;

    if (sessionRef.current.active && !sessionRef.current.paused) {
      pauseLesson();
    }
    setPanelTab("qa");
    setDeepDivePending(true);
    setDeepDiveError(null);
    setDeepDive(null);
    setMentorState("thinking");

    try {
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          stepIndex,
          intent: "deep_dive",
          question: `"${step.title}" mavzusini chuqurroq tushuntir: nima uchun muhim, ichki ishlash mexanizmi, hayotiy misol, tipik xato va chekka holat.`,
        }),
      });
      const data = (await response.json()) as AskResponse;
      if (!response.ok || !data.answer) {
        throw new Error(data.error ?? "deep_dive_failed");
      }

      setDeepDive(data.answer);
      setMentorState("speaking");
      void voice.speak(data.answer, {
        style: "mentor",
        rate: speed,
        onEnd: () => setMentorState("waiting"),
      });
    } catch {
      setDeepDiveError(uz.classroom.deepDiveError);
      setMentorState("listening");
    } finally {
      setDeepDivePending(false);
    }
  }

  function checkExercise() {
    if (!exercise) return;
    setPanelTab("practice");
    const missing = exercise.expectedKeywords.filter(
      (keyword) => !exerciseCode.toLowerCase().includes(keyword.toLowerCase()),
    );

    if (missing.length === 0) {
      setFeedback({ ok: true, text: uz.classroom.correct });
      setMentorState("celebrating");
      void voice.speak(uz.classroom.correct, {
        style: "celebrate",
        rate: speed,
        onEnd: () => scheduleAdvance(1200),
      });
      scheduleAdvance(3200);
      return;
    }

    setFeedback({
      ok: false,
      text: `${uz.classroom.missing} ${missing.join(", ")}`,
    });
    setMentorState("listening");
  }

  function showHint() {
    if (!exercise) return;
    setPanelTab("practice");
    const nextCount = Math.min(hintCount + 1, exercise.hints.length);
    setHintCount(nextCount);
    const hint = exercise.hints[nextCount - 1];
    if (hint) {
      setMentorState("speaking");
      void voice.speak(hint, {
        style: "hint",
        rate: speed,
        onEnd: () => setMentorState("waiting"),
      });
    }
  }

  function saveNote() {
    const clean = noteDraft.trim();
    if (clean.length < 2) return;
    setNotes((current) => [
      {
        id: `${Date.now()}-${current.length}`,
        text: clean,
        stepTitle: step?.title ?? "",
      },
      ...current,
    ]);
    setNoteDraft("");
  }

  function changeSpeed(next: number) {
    setSpeed(next);
    voice.setRate(next);
  }

  function playFromControl() {
    if (completed) {
      playStep(0);
      return;
    }
    if (stopped) {
      playStep(stepIndexRef.current);
      return;
    }
    if (paused) {
      void resumeLesson();
      return;
    }
    playStep(stepIndexRef.current);
  }

  function previousStep() {
    const target = Math.max(0, stepIndexRef.current - 1);
    playStep(target);
  }

  function nextStep() {
    const target = Math.min(totalSteps - 1, stepIndexRef.current + 1);
    playStep(target);
  }

  useEffect(() => {
    return () => {
      clearTimers();
      stopVoice();
    };
  }, [clearTimers, stopVoice]);

  if (!step) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-semibold text-muted">Dars skripti topilmadi.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-control text-sm font-medium text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {uz.classroom.back}
          </Link>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {lessonTitle}
          </h1>
          <p className="mt-1 text-sm font-semibold text-muted">{uz.classroom.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary">
            {uz.classroom.step} {stepIndex + 1} {uz.classroom.of} {totalSteps}
          </Badge>
          <Badge variant="outline">{step.segmentTitle}</Badge>
          <Badge variant="outline">
            <Clock3 className="size-3" aria-hidden="true" />
            {step.segmentDurationMin} {uz.classroom.minuteShort}
          </Badge>
        </div>
      </div>

      {stopped ? (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm font-semibold text-amber-900">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {uz.classroom.stopped}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.6fr)]">
        <div className="min-w-0 space-y-3">
          <ClassroomStage
            step={step}
            stepIndex={stepIndex}
            mentorState={mentorState}
            active={playing}
            speaking={voice.state === "speaking"}
            progress={voice.progress}
            visibleCount={visibleCount}
            activeIndex={activeIndex}
          />

          <PlaybackControls
            playing={playing}
            paused={paused}
            stopped={stopped}
            completed={completed}
            atStart={stepIndex === 0}
            atEnd={stepIndex >= totalSteps - 1}
            speed={speed}
            onPlay={playFromControl}
            onPause={pauseLesson}
            onResume={() => void resumeLesson()}
            onPrev={previousStep}
            onNext={nextStep}
            onReplay={() => playStep(stepIndexRef.current)}
            onSpeed={changeSpeed}
            onStop={requestStop}
          />

          {voice.blocked ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2.5">
              <p className="text-xs font-semibold text-amber-900">{uz.mentorDemo.voiceBlocked}</p>
              <Button type="button" variant="secondary" size="sm" onClick={() => void voice.resume()}>
                <Volume2 className="size-4" aria-hidden="true" />
                {uz.classroom.listen}
              </Button>
            </div>
          ) : null}

          {voice.error ? (
            <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-xs font-semibold text-red-700">
              {voice.error}
            </p>
          ) : null}

          {visibleCount > 0 && mentorState === "waiting" ? (
            <div className="flex items-start gap-2 rounded-2xl border border-primary-100 bg-primary-50 px-3.5 py-3 text-sm font-semibold text-primary-900">
              <MessageCircleQuestion className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden="true" />
              {uz.classroom.mentorQuestion}
            </div>
          ) : null}

          <LessonRail
            segments={segments}
            stepIndex={stepIndex}
            stepProgress={stepProgress}
            elapsedMs={elapsedMs}
            totalMs={totalMs}
          />
        </div>

        <LessonPanel
          tab={panelTab}
          onTab={setPanelTab}
          question={question}
          onQuestion={setQuestion}
          onAsk={onAsk}
          pending={pending}
          answer={answer}
          provider={provider}
          requestError={requestError}
          deepDive={deepDive}
          deepDivePending={deepDivePending}
          deepDiveError={deepDiveError}
          onDeepDive={() => void onDeepDive()}
          notes={notes}
          noteDraft={noteDraft}
          onNoteDraft={setNoteDraft}
          onSaveNote={saveNote}
          exercise={exercise}
          exerciseCode={exerciseCode}
          onExerciseCode={setExerciseCode}
          hintCount={hintCount}
          onHint={showHint}
          onCheck={checkExercise}
          feedback={feedback}
          className="min-h-[440px] xl:sticky xl:top-20 xl:max-h-[calc(100dvh-6rem)]"
        />
      </div>

      {completed ? (
        <Card className="border-success/40 bg-success-soft">
          <CardContent className="flex items-start gap-3 p-5">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
            <div>
              <p className="font-display text-lg font-extrabold text-ink">{uz.classroom.completed}</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => playStep(0)}
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                {uz.classroom.start}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {stopConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <Card className="w-full max-w-md shadow-2xl" role="dialog" aria-modal="true">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="size-5 text-amber-500" aria-hidden="true" />
                {uz.classroom.stopConfirmTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm font-semibold leading-relaxed text-slate-600">
                {uz.classroom.stopConfirmBody}
              </p>
              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setStopConfirmOpen(false)}>
                  {uz.classroom.cancel}
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={confirmStop}>
                  <Square className="size-3.5" aria-hidden="true" />
                  {uz.classroom.confirmStop}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
