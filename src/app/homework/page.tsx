import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  FileUp,
  GraduationCap,
  Sparkles,
  Timer,
} from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { requireUser } from "@/server/auth/session";
import { db } from "@/server/db";
import { AppHeader } from "@/components/ui/app-header";
import { HomeworkCard, type HomeworkItem } from "@/components/homework/homework-card";

export const metadata: Metadata = {
  title: uz.homework.title,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function tasksFromJson(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  const items = (value as { items?: unknown }).items;
  if (!Array.isArray(items)) return [];
  return items.filter((item): item is string => typeof item === "string");
}

function feedbackFromJson(value: unknown): { summary: string; suggestions: string[] } | null {
  if (!value || typeof value !== "object") return null;
  const feedback = value as { summary?: unknown; suggestions?: unknown };
  return {
    summary: typeof feedback.summary === "string" ? feedback.summary : "",
    suggestions: Array.isArray(feedback.suggestions)
      ? feedback.suggestions.filter((item): item is string => typeof item === "string")
      : [],
  };
}

export default async function HomeworkPage() {
  const user = await requireUser();

  const homeworks = await db.homework.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { dueAt: "asc" },
    include: {
      submissions: {
        where: { studentId: user.id },
        take: 1,
      },
    },
  });

  const items: HomeworkItem[] = homeworks.map((homework) => {
    const submission = homework.submissions[0] ?? null;
    return {
      id: homework.id,
      title: homework.title,
      description: homework.description,
      tasks: tasksFromJson(homework.tasks),
      dueAt: homework.dueAt,
      maxScore: homework.maxScore,
      submission: submission
        ? {
            content: submission.content,
            status: submission.status,
            score: submission.score,
            feedback: feedbackFromJson(submission.aiFeedback),
            submittedAt: submission.submittedAt,
          }
        : null,
    };
  });

  const submittedCount = items.filter((item) => item.submission).length;
  const reviewedCount = items.filter((item) => item.submission?.score !== null).length;
  const average =
    reviewedCount > 0
      ? Math.round(
          items.reduce((sum, item) => sum + (item.submission?.score ?? 0), 0) / reviewedCount,
        )
      : 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader user={{ name: user.name, role: user.role }} variant="app" />
      <main id="main" className="container-page flex-1 py-6 sm:py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-control text-sm font-semibold text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {uz.homework.back}
        </Link>

        <section className="relative mt-3 overflow-hidden rounded-[2rem] bg-ink p-5 text-white shadow-lift sm:p-7">
          <div
            className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-primary-500/30 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 left-16 size-56 rounded-full bg-sky-400/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                <BrainCircuit className="size-3.5" aria-hidden="true" />
                AI tekshiruv markazi
              </span>
              <h1 className="mt-2 text-balance font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                {uz.homework.title}
              </h1>
              <p className="mt-2 max-w-xl text-sm font-semibold leading-relaxed text-slate-300">
                {uz.homework.subtitle}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">
                  <CheckCircle2 className="size-3.5 text-emerald-300" aria-hidden="true" />
                  {submittedCount}/{items.length} {uz.homework.submitted}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">
                  <Sparkles className="size-3.5 text-sky-300" aria-hidden="true" />
                  {reviewedCount} {uz.homework.aiReviewed}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/5 p-2.5 backdrop-blur">
              <div className="rounded-xl bg-white/5 p-3 text-center">
                <CheckCircle2 className="mx-auto size-4 text-emerald-300" aria-hidden="true" />
                <p className="mt-1.5 font-display text-xl font-extrabold">{submittedCount}</p>
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  {uz.homework.submitted}
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center">
                <Sparkles className="mx-auto size-4 text-sky-300" aria-hidden="true" />
                <p className="mt-1.5 font-display text-xl font-extrabold">{reviewedCount}</p>
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  {uz.homework.aiReviewed}
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center">
                <Timer className="mx-auto size-4 text-amber-300" aria-hidden="true" />
                <p className="mt-1.5 font-display text-xl font-extrabold">{average || "—"}</p>
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  {uz.homework.score}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="rounded-[1.5rem] border-2 border-dashed border-line-strong bg-white/70 p-8 text-center">
                <p className="font-display text-lg font-extrabold text-ink">{uz.homework.empty}</p>
                <Link
                  href="/dashboard"
                  className="mt-2 inline-flex text-sm font-extrabold text-primary-700 hover:underline"
                >
                  {uz.homework.back}
                </Link>
              </div>
            ) : (
              items.map((homework) => <HomeworkCard key={homework.id} homework={homework} />)
            )}
          </div>

          <aside className="rounded-[1.5rem] border-2 border-white bg-white/90 p-4 shadow-soft lg:sticky lg:top-24">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                <GraduationCap className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-extrabold text-ink">AI qanday tekshiradi?</p>
                <p className="text-[10px] font-semibold text-muted">3 qisqa qadam</p>
              </div>
            </div>
            <ol className="mt-3 space-y-2.5">
              {[
                {
                  icon: FileUp,
                  title: "Yuboring",
                  body: "Kod, havola yoki faylni biriktiring.",
                },
                {
                  icon: Sparkles,
                  title: "AI tahlil qiladi",
                  body: "Mentor kodni o'qib, ball va izoh beradi.",
                },
                {
                  icon: CheckCircle2,
                  title: "Natijani oling",
                  body: "Xatolarni tuzatib, qayta yuborish mumkin.",
                },
              ].map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={step.title} className="flex gap-2.5">
                    <span className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-canvas text-[10px] font-extrabold text-primary-700">
                      <Icon className="size-3.5" aria-hidden="true" />
                      {index < 2 ? (
                        <span
                          className="absolute left-1/2 top-full h-3 w-px -translate-x-1/2 bg-line"
                          aria-hidden="true"
                        />
                      ) : null}
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-ink">{step.title}</p>
                      <p className="text-[11px] font-semibold leading-relaxed text-muted">
                        {step.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-primary-50 px-2.5 py-2 text-[10px] font-bold text-primary-700">
              <Clock3 className="size-3" aria-hidden="true" />
              Odatda 10–20 soniyada javob
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
