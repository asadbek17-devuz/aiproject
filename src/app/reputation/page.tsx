import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Flame,
  GraduationCap,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { formatDateUz } from "@/lib/utils";
import { requireUser } from "@/server/auth/session";
import { db } from "@/server/db";
import { AppHeader } from "@/components/ui/app-header";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";

export const metadata: Metadata = {
  title: uz.reputation.title,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const LEVELS = [
  { min: 0, label: "Yangi boshlovchi" },
  { min: 300, label: "Izlanuvchi" },
  { min: 700, label: "Amaliyotchi" },
  { min: 1200, label: "Junior" },
  { min: 2000, label: "Fullstack" },
];

function levelFor(score: number) {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i += 1) {
    if (score >= LEVELS[i].min) index = i;
  }
  return {
    current: LEVELS[index],
    next: LEVELS[index + 1] ?? null,
    index,
  };
}

export default async function ReputationPage() {
  const user = await requireUser();

  const [sessions, submissions] = await Promise.all([
    db.lessonSession.findMany({
      where: { userId: user.id },
      select: {
        status: true,
        completedAt: true,
        lesson: { select: { title: true } },
      },
      orderBy: { completedAt: "desc" },
    }),
    db.homeworkSubmission.findMany({
      where: { studentId: user.id },
      select: {
        status: true,
        score: true,
        submittedAt: true,
        homework: { select: { title: true, maxScore: true } },
      },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  const completed = sessions.filter((session) => session.status === "COMPLETED");
  const scored = submissions.filter((item) => typeof item.score === "number");
  const averageScore =
    scored.length > 0
      ? Math.round(scored.reduce((sum, item) => sum + (item.score ?? 0), 0) / scored.length)
      : 0;

  const dayKeys = new Set(
    completed
      .filter((session) => session.completedAt)
      .map((session) => session.completedAt!.toISOString().slice(0, 10)),
  );
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  while (dayKeys.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const score = completed.length * 100 + submissions.length * 60 + averageScore;
  const level = levelFor(score);
  const nextProgress = level.next
    ? Math.min(100, Math.round(((score - level.current.min) / (level.next.min - level.current.min)) * 100))
    : 100;

  const recent = [
    ...completed.slice(0, 4).map((session) => ({
      key: `lesson-${session.lesson.title}-${session.completedAt?.toISOString() ?? ""}`,
      title: session.lesson.title,
      date: session.completedAt,
      badge: uz.roadmap.completed,
      value: "+100",
      icon: BookOpen,
    })),
    ...submissions.slice(0, 4).map((submission) => ({
      key: `homework-${submission.homework.title}-${submission.submittedAt.toISOString()}`,
      title: submission.homework.title,
      date: submission.submittedAt,
      badge: submission.score ? `${submission.score}/${submission.homework.maxScore}` : uz.homework.submitted,
      value: "+60",
      icon: GraduationCap,
    })),
  ].slice(0, 6);

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader user={{ name: user.name, role: user.role }} variant="app" />
      <main id="main" className="container-page flex-1 py-8 sm:py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-control text-sm font-semibold text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {uz.reputation.back}
        </Link>

        <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
              <Trophy className="size-3.5" aria-hidden="true" />
              {uz.reputation.title}
            </span>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {uz.reputation.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-muted">
              {uz.reputation.subtitle}
            </p>
          </div>
          <Badge variant="primary">{level.current.label}</Badge>
        </div>

        <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-lift sm:p-8">
          <div
            className="pointer-events-none absolute -right-16 -top-24 size-80 rounded-full bg-amber-400/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative grid gap-6 sm:grid-cols-[0.8fr_1.2fr] sm:items-center">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-amber-300">
                {uz.reputation.score}
              </p>
              <p className="mt-2 font-display text-6xl font-extrabold tracking-tight">{score}</p>
              <p className="mt-1 text-sm font-semibold text-slate-300">
                {uz.reputation.level}: {level.current.label}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-300">
                <span>{level.current.label}</span>
                <span>{level.next?.label ?? "MAX"}</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400"
                  style={{ width: `${nextProgress}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-400">
                {level.next
                  ? `${uz.reputation.nextLevel}: ${Math.max(0, level.next.min - score)} ${uz.reputation.points}`
                  : "Eng yuqori darajaga yetdingiz!"}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <BookOpen className="size-5 text-primary-600" aria-hidden="true" />
              <p className="mt-3 font-display text-2xl font-extrabold text-ink">
                {completed.length}
              </p>
              <p className="text-xs font-bold text-muted">{uz.reputation.lessons}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <GraduationCap className="size-5 text-success" aria-hidden="true" />
              <p className="mt-3 font-display text-2xl font-extrabold text-ink">
                {submissions.length}
              </p>
              <p className="text-xs font-bold text-muted">{uz.reputation.homework}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Star className="size-5 text-amber-500" aria-hidden="true" />
              <p className="mt-3 font-display text-2xl font-extrabold text-ink">{averageScore}</p>
              <p className="text-xs font-bold text-muted">{uz.reputation.averageScore}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Flame className="size-5 text-orange-500" aria-hidden="true" />
              <p className="mt-3 font-display text-2xl font-extrabold text-ink">
                {streak} <span className="text-sm text-muted">{uz.reputation.day}</span>
              </p>
              <p className="text-xs font-bold text-muted">{uz.reputation.streak}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3">
              <CardTitle>{uz.reputation.recent}</CardTitle>
              <Sparkles className="size-4 text-primary-600" aria-hidden="true" />
            </CardHeader>
            <CardContent className="space-y-2">
              {recent.length === 0 ? (
                <p className="rounded-2xl bg-canvas px-4 py-6 text-center text-sm font-semibold text-muted">
                  {uz.reputation.noData}
                </p>
              ) : (
                recent.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.key}
                      className="flex items-center gap-3 rounded-2xl border border-line/80 bg-canvas/60 px-3.5 py-3"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-extrabold text-ink">{item.title}</p>
                        <p className="text-xs font-semibold text-muted">
                          {item.date ? formatDateUz(item.date) : "—"}
                        </p>
                      </div>
                      <Badge variant="success">{item.badge}</Badge>
                      <span className="text-xs font-extrabold text-success">{item.value}</span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-2 border-primary-100">
            <CardContent className="p-5">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
                <Trophy className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-3 font-display text-lg font-extrabold text-ink">
                {uz.reputation.nextLevel}
              </h3>
              <ProgressBar value={score} max={level.next?.min ?? (score || 100)} className="mt-3" />
              <p className="mt-3 text-sm font-semibold leading-relaxed text-muted">
                {"Har bir tugatilgan dars +100, topshirilgan uy ishi +60 va AI bahosi ball qo'shadi."}
              </p>
              <Link
                href="/homework"
                className={buttonStyles({ size: "md", className: "mt-4 w-full" })}
              >
                {uz.actions.homework}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
