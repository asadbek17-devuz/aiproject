"use client";

import { useState, type FormEvent } from "react";
import { Send, Sparkles, Square, Volume2 } from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MentorAvatar, type MentorState } from "@/components/classroom/mentor-avatar";
import { useMentorVoice } from "@/components/classroom/use-mentor-voice";
import { Whiteboard } from "@/components/classroom/whiteboard";
import type { BoardAction } from "@/server/ai/lesson-script.schema";

export type MentorDemoProps = {
  lessonId: string;
  lessonTitle: string;
  stepIndex: number;
  stepTitle: string;
  narration: string;
  boardActions: BoardAction[];
};

type AskResponse = {
  answer?: string;
  provider?: string;
  model?: string;
  error?: string;
};

export function MentorDemo({
  lessonId,
  lessonTitle,
  stepIndex,
  stepTitle,
  narration,
  boardActions,
}: MentorDemoProps) {
  const voice = useMentorVoice();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const mentorState: MentorState = pending
    ? "thinking"
    : voice.state === "speaking"
      ? "speaking"
      : answer
        ? "waiting"
        : "idle";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = question.trim();
    if (clean.length < 2 || pending) return;

    setPending(true);
    setRequestError(null);
    setAnswer(null);

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
      void voice.speak(data.answer);
    } catch {
      setRequestError(uz.mentorDemo.error);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="overflow-hidden">
        <div className="flex flex-col items-center gap-3 border-b border-line bg-primary-50/50 p-6">
          <MentorAvatar state={mentorState} className="size-28" />
          <div className="text-center">
            <p className="text-sm font-semibold text-ink">Sardor — AI mentor</p>
            <p className="mt-0.5 text-xs text-muted">
              {pending
                ? uz.mentorDemo.loading
                : mentorState === "speaking"
                  ? uz.landing.hero.preview.mentorState
                  : uz.landing.mentor.states.idle}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void voice.speak(narration)}
            >
              <Volume2 className="size-4" aria-hidden="true" />
              {uz.mentorDemo.speakNarration}
            </Button>
            {voice.state !== "idle" ? (
              <Button type="button" variant="ghost" size="sm" onClick={voice.stop}>
                <Square className="size-3.5" aria-hidden="true" />
                {uz.mentorDemo.stop}
              </Button>
            ) : null}
          </div>
          {voice.blocked ? (
            <div className="flex flex-col items-center gap-1.5">
              <Button type="button" variant="secondary" size="sm" onClick={() => void voice.resume()}>
                <Volume2 className="size-4" aria-hidden="true" />
                {uz.mentorDemo.listenAnswer}
              </Button>
              <p className="text-center text-xs font-medium text-muted">
                {uz.mentorDemo.voiceBlocked}
              </p>
            </div>
          ) : null}
          {voice.error ? (
            <p role="alert" className="text-center text-xs font-medium text-danger">
              {voice.error}
            </p>
          ) : null}
        </div>

        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{lessonTitle}</Badge>
            {provider ? (
              <Badge variant="primary">
                {uz.mentorDemo.providerLabel}: {provider}
              </Badge>
            ) : null}
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
            {uz.mentorDemo.stepLabel}
          </p>
          <h2 className="mt-1 text-base font-semibold text-ink">{stepTitle}</h2>
          <p className="mt-2 rounded-control border border-line bg-canvas p-3 text-sm leading-relaxed text-slate-700">
            {narration}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{uz.mentorDemo.title}</CardTitle>
          <p className="text-sm text-muted">{uz.mentorDemo.subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={onSubmit} className="space-y-3">
            <Textarea
              label={uz.mentorDemo.questionLabel}
              name="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={uz.mentorDemo.questionPlaceholder}
              maxLength={1000}
              rows={3}
            />
            <Button type="submit" loading={pending} disabled={question.trim().length < 2}>
              <Send className="size-4" aria-hidden="true" />
              {uz.mentorDemo.ask}
            </Button>
          </form>

          {requestError ? (
            <p role="alert" className="rounded-control bg-danger-soft px-3 py-2 text-sm text-red-700">
              {requestError}
            </p>
          ) : null}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {uz.mentorDemo.answerLabel}
            </p>
            {answer ? (
              <div className="mt-2 rounded-card rounded-tl-sm bg-primary-600 px-4 py-3 text-sm leading-relaxed text-white shadow-soft">
                {answer}
              </div>
            ) : (
              <div className="mt-2 flex items-start gap-2 rounded-control border border-dashed border-line-strong bg-canvas px-3 py-3 text-sm text-muted">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary-500" aria-hidden="true" />
                {uz.mentorDemo.empty}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <Whiteboard
          actions={boardActions}
          activeIndex={answer ? boardActions.length - 1 : -1}
          visibleCount={boardActions.length}
        />
      </div>
    </div>
  );
}
