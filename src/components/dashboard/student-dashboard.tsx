import Link from "next/link";
import type { NotificationType, User } from "@prisma/client";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CheckCircle2,
  Clock3,
  CreditCard,
  Flame,
  GraduationCap,
  Sparkles,
  Target,
  Trophy,
  Wallet,
} from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { formatDateUz, formatUzs } from "@/lib/utils";
import { ACCESS_LABELS, ADAPTIVE_LABELS, PLAN_LABELS } from "@/lib/labels";
import { db } from "@/server/db";
import { AppHeader } from "@/components/ui/app-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MentorAvatar } from "@/components/classroom/mentor-avatar";
import { FullstackRoadmap } from "@/components/dashboard/fullstack-roadmap";

const notificationIcons: Record<NotificationType, typeof Bell> = {
  INFO: Bell,
  SUCCESS: CheckCircle2,
  WARNING: Target,
  PAYMENT: CreditCard,
  LESSON: BookOpen,
  HOMEWORK: Trophy,
};

export async function StudentDashboard({ user }: { user: User }) {
  const [enrollment, sessions, notifications, unreadCount, payments, allCourses] =
    await Promise.all([
    db.enrollment.findFirst({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
      include: {
        course: {
          include: {
            lessons: {
              where: { status: "PUBLISHED" },
              orderBy: { order: "asc" },
              select: {
                id: true,
                order: true,
                title: true,
                summary: true,
                durationMin: true,
              },
            },
          },
        },
      },
    }),
    db.lessonSession.findMany({
      where: { userId: user.id },
      select: { lessonId: true, status: true, stepIndex: true, completedAt: true },
    }),
    db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    db.notification.count({ where: { userId: user.id, readAt: null } }),
    db.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    db.course.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        level: true,
        lessons: {
          where: { status: "PUBLISHED" },
          orderBy: { order: "asc" },
          select: {
            id: true,
            order: true,
            title: true,
            summary: true,
            durationMin: true,
          },
        },
      },
    }),
  ]);

  const lessons = enrollment?.course.lessons ?? [];
  const completedIds = new Set(
    sessions.filter((session) => session.status === "COMPLETED").map((session) => session.lessonId),
  );
  const completedCount = lessons.filter((lesson) => completedIds.has(lesson.id)).length;
  const progress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const allLessonsCompleted = lessons.length > 0 && completedCount === lessons.length;
  const nextLesson = allLessonsCompleted
    ? null
    : (lessons.find((lesson) => !completedIds.has(lesson.id)) ?? lessons[0] ?? null);
  const activeSession = nextLesson
    ? sessions.find((session) => session.lessonId === nextLesson.id)
    : null;
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weeklyCompleted = sessions.filter(
    (session) =>
      session.status === "COMPLETED" && session.completedAt && session.completedAt >= weekStart,
  ).length;
  const weeklyGoal = Math.min(100, Math.round((weeklyCompleted / 3) * 100));
  const latestPayment = payments[0] ?? null;
  const firstName = user.name.split(" ")[0] ?? user.name;

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader user={{ name: user.name, role: user.role }} variant="app" />
      <main id="main" className="container-page flex-1 py-6 sm:py-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-primary-700">
              <Sparkles className="size-3.5" aria-hidden="true" />
              {uz.dashboard.workspace}
            </span>
            <h1 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {uz.dashboard.greeting.replace("{name}", firstName)}
            </h1>
            <p className="mt-1.5 text-sm font-semibold text-muted">{uz.dashboard.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-extrabold text-ink">{user.name}</p>
              <p className="text-xs font-semibold text-muted">
                {ADAPTIVE_LABELS[user.adaptiveLevel]} · {PLAN_LABELS[user.subscriptionPlan]}
              </p>
            </div>
            <Avatar name={user.name} size="lg" className="ring-2 ring-white" />
          </div>
        </div>

        <section className="relative mt-5 overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-lift sm:p-8">
          <div
            className="pointer-events-none absolute -right-16 -top-24 size-80 rounded-full bg-primary-500/30 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-28 left-24 size-72 rounded-full bg-sky-400/20 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute right-10 top-8 size-44 rounded-full border-[22px] border-white/5"
            aria-hidden="true"
          />
          <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-sky-300">
                {uz.dashboard.focus}
              </p>
              <h2 className="mt-2 text-balance font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                {nextLesson?.title ??
                  (allLessonsCompleted
                    ? uz.dashboard.courseCompletedTitle
                    : uz.dashboard.startCourse)}
              </h2>
              <p className="mt-3 max-w-xl text-sm font-semibold leading-relaxed text-slate-300">
                {nextLesson?.summary ??
                  (allLessonsCompleted
                    ? uz.dashboard.courseCompletedBody
                    : uz.dashboard.continueBody)}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <Link
                  href={
                    nextLesson
                      ? `/classroom/${nextLesson.id}`
                      : allLessonsCompleted
                        ? "/reputation"
                        : "/mentor-demo"
                  }
                  className={buttonStyles({
                    variant: "secondary",
                    size: "md",
                    className:
                      "border-white/0 text-primary-700 shadow-[0_5px_0_0_#bfdbfe] hover:bg-white",
                  })}
                >
                  {allLessonsCompleted
                    ? uz.dashboard.viewResults
                    : activeSession
                      ? uz.dashboard.continue
                      : uz.dashboard.startCourse}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href={nextLesson ? `/classroom/${nextLesson.id}` : "/mentor-demo"}
                  className={buttonStyles({
                    variant: "ghost",
                    size: "md",
                    className: "text-white hover:bg-white/15 hover:text-white",
                  })}
                >
                  <Sparkles className="size-4" aria-hidden="true" />
                  {uz.dashboard.askMentor}
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">
                  <Clock3 className="size-3.5 text-sky-300" aria-hidden="true" />
                  {nextLesson?.durationMin ?? 60} daqiqa
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">
                  <BookOpen className="size-3.5 text-sky-300" aria-hidden="true" />
                  {lessons.length} {uz.dashboard.lessonsShort}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">
                  <Flame className="size-3.5 text-amber-300" aria-hidden="true" />
                  {completedCount}/{lessons.length}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div
                className="relative flex size-44 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#38bdf8 ${progress * 3.6}deg, rgba(255,255,255,0.12) 0deg)`,
                }}
              >
                <div className="flex size-36 flex-col items-center justify-center rounded-full bg-ink text-center">
                  <span className="font-display text-4xl font-extrabold tracking-tight">
                    {progress}%
                  </span>
                  <span className="mt-1 max-w-24 text-[11px] font-bold leading-tight text-slate-400">
                    {uz.dashboard.courseProgress}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="card-hover rounded-card border-2 border-white bg-white/80 p-4 shadow-soft backdrop-blur">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
              <Target className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink">
              {progress}%
            </p>
            <p className="mt-0.5 text-xs font-bold text-muted">{uz.dashboard.courseProgress}</p>
          </div>
          <div className="card-hover rounded-card border-2 border-white bg-white/80 p-4 shadow-soft backdrop-blur">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-success-soft text-success">
              <CheckCircle2 className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink">
              {completedCount}/{lessons.length}
            </p>
            <p className="mt-0.5 text-xs font-bold text-muted">{uz.dashboard.lessonsDone}</p>
          </div>
          <div className="card-hover rounded-card border-2 border-white bg-white/80 p-4 shadow-soft backdrop-blur">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-warning-soft text-warning">
              <Trophy className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink">
              {weeklyGoal}%
            </p>
            <p className="mt-0.5 text-xs font-bold text-muted">{uz.dashboard.weeklyGoal}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.45fr_0.55fr]">
          <div className="min-w-0 space-y-5">
            <FullstackRoadmap
              courses={allCourses}
              completedIds={[...completedIds]}
              nextLessonId={nextLesson?.id ?? null}
              defaultTrack={user.learningTrackKey}
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                href={
                  nextLesson
                    ? `/classroom/${nextLesson.id}`
                    : allLessonsCompleted
                      ? "/reputation"
                      : "/mentor-demo"
                }
                className="card-hover rounded-card border-2 border-white bg-primary-600 p-4 text-white shadow-[0_6px_0_0_#1d4ed8]"
              >
                <span className="flex size-10 items-center justify-center rounded-2xl bg-white/15">
                  <BookOpen className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-3 text-sm font-extrabold">
                  {allLessonsCompleted ? uz.dashboard.viewResults : uz.actions.continueLesson}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-primary-100">
                  {allLessonsCompleted
                    ? uz.actions.reputation
                    : `${uz.actions.scheduleTime} · ${nextLesson?.durationMin ?? 60} daqiqa`}
                </p>
              </Link>
              <Link
                href={nextLesson ? `/classroom/${nextLesson.id}` : "/mentor-demo"}
                className="card-hover rounded-card border-2 border-white bg-white/90 p-4 shadow-soft"
              >
                <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
                  <Sparkles className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-3 text-sm font-extrabold text-ink">{uz.actions.askMentor}</p>
                <p className="mt-0.5 text-xs font-semibold text-muted">24/7 · AI mentor</p>
              </Link>
              <Link
                href="/homework"
                className="card-hover rounded-card border-2 border-white bg-white/90 p-4 shadow-soft"
              >
                <span className="flex size-10 items-center justify-center rounded-2xl bg-success-soft text-success">
                  <GraduationCap className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-3 text-sm font-extrabold text-ink">{uz.actions.homework}</p>
                <p className="mt-0.5 text-xs font-semibold text-muted">AI tekshiruv</p>
              </Link>
              <Link
                href="/reputation"
                className="card-hover rounded-card border-2 border-white bg-white/90 p-4 shadow-soft"
              >
                <span className="flex size-10 items-center justify-center rounded-2xl bg-warning-soft text-warning">
                  <Trophy className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-3 text-sm font-extrabold text-ink">{uz.actions.reputation}</p>
                <p className="mt-0.5 text-xs font-semibold text-muted">
                  {weeklyGoal}% · {uz.dashboard.weeklyGoal}
                </p>
              </Link>
              <Link
                href="/subscription"
                className="card-hover rounded-card border-2 border-white bg-white/90 p-4 shadow-soft"
              >
                <span className="flex size-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <Wallet className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-3 text-sm font-extrabold text-ink">{uz.actions.payments}</p>
                <p className="mt-0.5 text-xs font-semibold text-muted">
                  {PLAN_LABELS[user.subscriptionPlan]} · {ACCESS_LABELS[user.accessStatus]}
                </p>
              </Link>
              <Link
                href="/mentor-demo"
                className="card-hover rounded-card border-2 border-white bg-white/90 p-4 shadow-soft"
              >
                <span className="flex size-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <ArrowRight className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-3 text-sm font-extrabold text-ink">{uz.actions.askAnything}</p>
                <p className="mt-0.5 text-xs font-semibold text-muted">
                  {uz.actions.scheduleOpen} · 18:00 – 19:00
                </p>
              </Link>
            </div>

            <Card>
              <CardHeader className="flex-row items-center justify-between gap-3">
                <CardTitle>{uz.dashboard.notifications}</CardTitle>
                <Badge variant={unreadCount > 0 ? "primary" : "neutral"}>{unreadCount}</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {notifications.length === 0 ? (
                  <p className="rounded-2xl bg-canvas px-4 py-6 text-center text-sm font-semibold text-muted">
                    {uz.dashboard.noNotifications}
                  </p>
                ) : (
                  notifications.map((notification) => {
                    const Icon = notificationIcons[notification.type] ?? Bell;
                    return (
                      <div
                        key={notification.id}
                        className="flex items-start gap-3 rounded-2xl border border-line/80 bg-canvas/60 px-3.5 py-3"
                      >
                        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-extrabold text-ink">{notification.title}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs font-semibold leading-relaxed text-muted">
                            {notification.body}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] font-bold text-muted">
                          {formatDateUz(notification.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          <div className="min-w-0 space-y-5">
            <Card className="overflow-hidden border-2 border-primary-100">
              <div className="flex flex-col items-center bg-gradient-to-b from-primary-50 to-white p-6 text-center">
                <MentorAvatar state="waiting" className="size-24" />
                <h3 className="mt-3 font-display text-xl font-extrabold text-ink">
                  {uz.dashboard.mentorTitle}
                </h3>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-muted">
                  {uz.dashboard.mentorBody}
                </p>
                <Link
                  href={nextLesson ? `/classroom/${nextLesson.id}` : "/mentor-demo"}
                  className={buttonStyles({ size: "md", className: "mt-4 w-full" })}
                >
                  <Sparkles className="size-4" aria-hidden="true" />
                  {uz.dashboard.askMentor}
                </Link>
              </div>
            </Card>

            <Card className="overflow-hidden border-2 border-warning-soft bg-gradient-to-br from-white to-amber-50">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-warning-soft text-warning">
                    <CreditCard className="size-5" aria-hidden="true" />
                  </span>
                  <Badge
                    variant={
                      user.accessStatus === "ACTIVE"
                        ? "success"
                        : user.accessStatus === "GRACE"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {ACCESS_LABELS[user.accessStatus]}
                  </Badge>
                </div>
                <h3 className="mt-3 font-display text-lg font-extrabold text-ink">
                  {uz.dashboard.subscriptionTitle}
                </h3>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-muted">
                  {uz.dashboard.subscriptionBody}
                </p>
                <dl className="mt-4 space-y-2 text-xs font-semibold">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted">{uz.dashboard.plan}</dt>
                    <dd className="font-extrabold text-ink">{PLAN_LABELS[user.subscriptionPlan]}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted">{uz.dashboard.activeUntil}</dt>
                    <dd className="font-extrabold text-ink">
                      {user.subscriptionEndsAt ? formatDateUz(user.subscriptionEndsAt) : "—"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted">{uz.dashboard.payments}</dt>
                    <dd className="font-extrabold text-ink">
                      {latestPayment ? formatUzs(latestPayment.amount) : uz.dashboard.noPaymentsShort}
                    </dd>
                  </div>
                </dl>
                <Link
                  href="/subscription"
                  className={buttonStyles({ size: "md", className: "mt-4 w-full" })}
                >
                  <CreditCard className="size-4" aria-hidden="true" />
                  {uz.dashboard.manageSubscription}
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{uz.dashboard.weeklyGoal}</CardTitle>
                <p className="text-sm font-semibold text-muted">{uz.dashboard.weeklyGoalBody}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm font-extrabold text-ink">
                  <span>
                    {Math.min(weeklyCompleted, 3)}/3 {uz.dashboard.lessonsShort}
                  </span>
                  <span className="text-primary-700">{weeklyGoal}%</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-sky-400"
                    style={{ width: `${weeklyGoal}%` }}
                  />
                </div>
                <Link
                  href="/profile"
                  className={buttonStyles({
                    variant: "secondary",
                    size: "sm",
                    className: "mt-4 w-full",
                  })}
                >
                  {uz.dashboard.openProfile}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
