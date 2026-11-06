import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Flame,
  Lock,
  Sparkles,
} from "lucide-react";
import type { CourseLevel } from "@prisma/client";
import { kindForCourseSlug } from "@/lib/curriculum";
import { getCurrentUser } from "@/server/auth/session";
import { db } from "@/server/db";
import { AppHeader } from "@/components/ui/app-header";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const levelLabels: Record<CourseLevel, string> = {
  BEGINNER: "Boshlang'ich",
  INTERMEDIATE: "O'rta",
  ADVANCED: "Yuqori",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await db.course.findFirst({
    where: { slug, isPublished: true },
    select: { title: true, description: true },
  });

  return {
    title: course ? `${course.title} — AI Academy` : "Kurs — AI Academy",
    description: course?.description,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const course = await db.course.findFirst({
    where: { slug, isPublished: true },
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
  });

  if (!course) notFound();

  const sessions = user
    ? await db.lessonSession.findMany({
        where: { userId: user.id, status: "COMPLETED" },
        select: { lessonId: true },
      })
    : [];
  const completed = new Set(sessions.map((session) => session.lessonId));
  const completedCount = course.lessons.filter((lesson) => completed.has(lesson.id)).length;
  const progress =
    course.lessons.length > 0
      ? Math.round((completedCount / course.lessons.length) * 100)
      : 0;
  const nextLesson =
    course.lessons.find((lesson) => !completed.has(lesson.id)) ?? course.lessons[0] ?? null;

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader
        user={user ? { name: user.name, role: user.role } : null}
        variant={user ? "app" : "marketing"}
      />
      <main id="main" className="container-page flex-1 py-8 sm:py-10">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 rounded-control text-sm font-medium text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Barcha kurslar
        </Link>

        <section className="relative mt-4 overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-lift sm:p-8">
          <div
            className="pointer-events-none absolute -right-16 -top-24 size-80 rounded-full bg-primary-500/30 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" className="bg-white/10 text-sky-200">
                  {kindForCourseSlug(course.slug)}
                </Badge>
                <Badge variant="outline" className="border-white/20 bg-white/5 text-slate-200">
                  {levelLabels[course.level]}
                </Badge>
                <Badge variant="outline" className="border-white/20 bg-white/5 text-slate-200">
                  {course.lessons.length} dars
                </Badge>
              </div>
              <h1 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                {course.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-slate-300">
                {course.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={nextLesson ? `/classroom/${nextLesson.id}` : "/courses"}
                  className={buttonStyles({
                    variant: "secondary",
                    size: "md",
                    className:
                      "border-white/0 text-primary-700 shadow-[0_5px_0_0_#bfdbfe] hover:bg-white",
                  })}
                >
                  {completedCount > 0 ? "Davom ettirish" : "Kursni boshlash"}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/mentor-demo"
                  className={buttonStyles({
                    variant: "ghost",
                    size: "md",
                    className: "text-white hover:bg-white/15 hover:text-white",
                  })}
                >
                  <Sparkles className="size-4" aria-hidden="true" />
                  AI mentordan so&apos;rash
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Kurs progressi
              </p>
              <p className="mt-1 font-display text-4xl font-extrabold">{progress}%</p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-400">
                {completedCount}/{course.lessons.length} dars tugallandi
              </p>
            </div>
          </div>
        </section>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-extrabold text-ink">Dars rejasi</h2>
            <p className="mt-1 text-sm font-semibold text-muted">
              Har bir dars 60 daqiqa: nazariya, amaliyot va savol-javob.
            </p>
          </div>
          <Badge variant="success">
            {completedCount}/{course.lessons.length}
          </Badge>
        </div>

        <div className="mt-4 space-y-2.5">
          {course.lessons.map((lesson) => {
            const isDone = completed.has(lesson.id);
            const isCurrent = lesson.id === nextLesson?.id;
            return (
              <Link
                key={lesson.id}
                href={`/classroom/${lesson.id}`}
                className={
                  isDone
                    ? "group flex items-center gap-3 rounded-2xl border-2 border-success/25 bg-success-soft/35 p-3.5 transition-colors hover:bg-success-soft/60 sm:p-4"
                    : isCurrent
                      ? "group flex items-center gap-3 rounded-2xl border-2 border-primary-200 bg-primary-50/60 p-3.5 shadow-sm transition-colors hover:bg-primary-50 sm:p-4"
                      : "group flex items-center gap-3 rounded-2xl border-2 border-line/80 bg-white p-3.5 transition-colors hover:border-primary-200 hover:bg-primary-50/40 sm:p-4"
                }
              >
                <span
                  className={
                    isDone
                      ? "flex size-10 shrink-0 items-center justify-center rounded-2xl bg-success text-white"
                      : isCurrent
                        ? "flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white"
                        : "flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"
                  }
                >
                  {isDone ? (
                    <Check className="size-5" strokeWidth={3} aria-hidden="true" />
                  ) : isCurrent ? (
                    <Flame className="size-5" aria-hidden="true" />
                  ) : (
                    <Lock className="size-4" aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted">
                      {lesson.order}-dars
                    </span>
                    {isCurrent ? <Badge variant="primary">Joriy</Badge> : null}
                    {isDone ? <Badge variant="success">Tugallangan</Badge> : null}
                  </span>
                  <span className="mt-0.5 block text-sm font-extrabold text-ink">
                    {lesson.title}
                  </span>
                  <span className="mt-0.5 line-clamp-1 block text-xs font-semibold text-muted">
                    {lesson.summary}
                  </span>
                </span>
                <span className="hidden shrink-0 items-center gap-1 text-[11px] font-bold text-muted sm:inline-flex">
                  <Clock3 className="size-3.5" aria-hidden="true" />
                  {lesson.durationMin} daqiqa
                </span>
                <ArrowRight
                  className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary-700"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>

        {course.lessons.length === 0 ? (
          <p className="mt-4 rounded-2xl border-2 border-dashed border-line bg-white/70 px-4 py-12 text-center text-sm font-semibold text-muted">
            <BookOpen className="mx-auto mb-2 size-6" aria-hidden="true" />
            Bu kursda hozircha darslar yo&apos;q.
          </p>
        ) : null}
      </main>
    </div>
  );
}
