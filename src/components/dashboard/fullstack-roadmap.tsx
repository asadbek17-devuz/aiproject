"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Binary,
  BookOpen,
  Boxes,
  Brain,
  Check,
  ChevronDown,
  Code2,
  Flame,
  Languages,
  Layers,
  Server,
  ShieldCheck,
  Smartphone,
  Trophy,
} from "lucide-react";
import {
  getTrackPlan,
  isTrackKey,
  kindForCourseSlug,
  type TrackKey,
} from "@/lib/curriculum";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type RoadmapLesson = {
  id: string;
  order: number;
  title: string;
  summary: string;
  durationMin: number;
};

export type RoadmapCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  lessons: RoadmapLesson[];
};

const kindMeta: Record<string, { label: string; icon: typeof Code2 }> = {
  FRONTEND: { label: "Frontend", icon: Code2 },
  BACKEND: { label: "Backend", icon: Server },
  FULLSTACK: { label: "Fullstack", icon: Layers },
  EXAM: { label: "Imtihon", icon: Trophy },
  CORE: { label: "Computer science", icon: Binary },
  MOBILE: { label: "Mobile", icon: Smartphone },
  SECURITY: { label: "Security", icon: ShieldCheck },
  SYSTEM_DESIGN: { label: "System design", icon: Boxes },
  AI: { label: "AI", icon: Brain },
  ENGLISH: { label: "English", icon: Languages },
};

function normalizeTrack(value?: string | null): TrackKey {
  if (isTrackKey(value)) return value;
  if (value === "FRONTEND" || value === "BACKEND" || value === "FULLSTACK") {
    return "WEB_DEVELOPER";
  }
  return "WEB_DEVELOPER";
}

export function FullstackRoadmap({
  courses,
  completedIds,
  nextLessonId,
  defaultTrack,
}: {
  courses: RoadmapCourse[];
  completedIds: string[];
  nextLessonId: string | null;
  defaultTrack?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const activeTrack = normalizeTrack(defaultTrack);
  const done = useMemo(() => new Set(completedIds), [completedIds]);
  const courseBySlug = useMemo(
    () => new Map(courses.map((course) => [course.slug, course])),
    [courses],
  );

  const plan = getTrackPlan(activeTrack);
  const planCourses = plan.courseSlugs
    .map((slug) => courseBySlug.get(slug))
    .filter((course): course is RoadmapCourse => Boolean(course));
  const planLessons = planCourses.flatMap((course) => course.lessons);
  const totalDone = planLessons.filter((lesson) => done.has(lesson.id)).length;
  const progress =
    planLessons.length > 0 ? Math.round((totalDone / planLessons.length) * 100) : 0;

  const resolvedNextLessonId =
    nextLessonId && planLessons.some((lesson) => lesson.id === nextLessonId)
      ? nextLessonId
      : (planLessons.find((lesson) => !done.has(lesson.id))?.id ?? planLessons[0]?.id ?? null);
  const nextHref = resolvedNextLessonId ? `/classroom/${resolvedNextLessonId}` : "/courses";

  const lessonSteps = new Map<string, number>();
  let stepCounter = 0;
  for (const course of planCourses) {
    for (const lesson of course.lessons) {
      stepCounter += 1;
      lessonSteps.set(lesson.id, stepCounter);
    }
  }

  const currentCourse = planCourses.find((course) =>
    course.lessons.some((lesson) => lesson.id === resolvedNextLessonId),
  );

  const stats = [
    { label: "Bosqich", value: planCourses.length },
    { label: "Dars", value: planLessons.length },
    { label: "Tugallangan", value: totalDone },
  ];

  return (
    <section className="overflow-hidden rounded-[1.6rem] border-2 border-white bg-white/90 shadow-soft">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div
          className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full border-[26px] border-white/10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-10 size-48 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="roadmap-body"
          className="relative flex w-full items-start justify-between gap-4 p-4 text-left sm:p-5"
        >
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary-100">
              <BookOpen className="size-3.5" aria-hidden="true" />
              {plan.shortTitle} yo&apos;nalishi
            </span>
            <h3 className="mt-2 font-display text-xl font-extrabold tracking-tight sm:text-2xl">
              {plan.title}
            </h3>
            <p className="mt-1 max-w-xl text-xs font-semibold leading-relaxed text-primary-100 sm:text-sm">
              {plan.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="relative flex size-16 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#7dd3fc ${progress * 3.6}deg, rgba(255,255,255,0.18) 0deg)`,
              }}
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-primary-800">
                <span className="font-display text-sm font-extrabold text-white">{progress}%</span>
              </div>
            </div>
            <span className="flex size-9 items-center justify-center rounded-full bg-white/15">
              <ChevronDown
                className={cn("size-4 transition-transform", open && "rotate-180")}
                aria-hidden="true"
              />
            </span>
          </div>
        </button>

        <div className="relative px-4 pb-4 sm:px-5 sm:pb-5">
          <div className="grid grid-cols-3 gap-2">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur">
                <p className="font-display text-lg font-extrabold text-white">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-primary-200">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-sky-300 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <Link
              href={nextHref}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-extrabold text-primary-700 transition-transform hover:-translate-y-0.5"
            >
              {progress > 0 ? "Davom etish" : "Boshlash"}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
            <span className="text-[11px] font-bold text-primary-100">
              {open ? "Yopish uchun bosing" : "Yo'l xaritasini ochish uchun bosing"}
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-line/70 bg-white/70 px-3 py-3 sm:px-4">
        <ol className="flex min-w-max items-center gap-1.5">
          {planCourses.map((course, index) => {
            const lessonsDone = course.lessons.filter((lesson) => done.has(lesson.id)).length;
            const complete = course.lessons.length > 0 && lessonsDone === course.lessons.length;
            const current = course.id === currentCourse?.id;
            return (
              <li key={course.id} className="flex shrink-0 items-center gap-1.5">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border text-[10px] font-extrabold",
                    complete
                      ? "border-success/30 bg-success text-white"
                      : current
                        ? "border-primary-200 bg-primary-600 text-white"
                        : "border-line bg-white text-muted",
                  )}
                  title={course.title}
                >
                  {complete ? (
                    <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>
                {index < planCourses.length - 1 ? (
                  <span
                    className={cn("h-px w-5", complete ? "bg-success/40" : "bg-line")}
                    aria-hidden="true"
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="space-y-3 p-3 sm:p-4">
        {planCourses.length === 0 ? (
          <p className="rounded-2xl bg-canvas px-4 py-6 text-center text-sm font-semibold text-muted">
            Bu yo&apos;nalish kurslari hozircha tayyorlanmoqda.
          </p>
        ) : (
          planCourses.map((course, courseIndex) => {
            const meta = kindMeta[kindForCourseSlug(course.slug)] ?? kindMeta.FRONTEND;
            const Icon = meta.icon;
            const lessonsDone = course.lessons.filter((lesson) => done.has(lesson.id)).length;
            const courseProgress =
              course.lessons.length > 0
                ? Math.round((lessonsDone / course.lessons.length) * 100)
                : 0;
            const courseComplete =
              course.lessons.length > 0 && lessonsDone === course.lessons.length;
            const current = course.id === currentCourse?.id;

            return (
              <article
                key={course.id}
                className={cn(
                  "overflow-hidden rounded-2xl border-2 transition-colors",
                  current
                    ? "border-primary-200 bg-primary-50/30"
                    : courseComplete
                      ? "border-success/20 bg-success-soft/25"
                      : "border-line/70 bg-white",
                )}
              >
                <header className="flex items-start gap-3 p-3 sm:p-4">
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      courseComplete
                        ? "bg-success-soft text-success"
                        : current
                          ? "bg-primary-600 text-white"
                          : "bg-canvas text-slate-600",
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted">
                        {courseIndex + 1}-bosqich · {meta.label}
                      </span>
                      {courseComplete ? (
                        <Badge variant="success">Tugallangan</Badge>
                      ) : current ? (
                        <Badge variant="primary">Joriy</Badge>
                      ) : null}
                    </div>
                    <h4 className="mt-0.5 font-display text-sm font-extrabold leading-snug text-ink sm:text-base">
                      {course.title}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-relaxed text-muted sm:text-xs">
                      {course.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            courseComplete ? "bg-success" : "bg-primary-500",
                          )}
                          style={{ width: `${courseProgress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-extrabold text-muted">
                        {lessonsDone}/{course.lessons.length}
                      </span>
                    </div>
                  </div>
                </header>

                <div className="grid gap-1.5 border-t border-line/70 bg-white/70 p-3 sm:grid-cols-2 sm:p-4">
                  {course.lessons.map((lesson) => {
                    const isDone = done.has(lesson.id);
                    const isCurrent = lesson.id === resolvedNextLessonId;
                    const stepNumber = lessonSteps.get(lesson.id) ?? lesson.order;
                    return (
                      <Link
                        key={lesson.id}
                        href={`/classroom/${lesson.id}`}
                        className={cn(
                          "group flex items-center gap-2 rounded-xl border px-2.5 py-2 transition-colors",
                          isDone
                            ? "border-success/20 bg-white hover:bg-success-soft/40"
                            : isCurrent
                              ? "border-primary-200 bg-white hover:bg-primary-50"
                              : "border-line/70 bg-white hover:border-slate-300",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold",
                            isDone
                              ? "bg-success text-white"
                              : isCurrent
                                ? "bg-primary-600 text-white"
                                : "bg-canvas text-slate-500",
                          )}
                        >
                          {isDone ? (
                            <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                          ) : isCurrent ? (
                            <Flame className="size-3.5" aria-hidden="true" />
                          ) : (
                            stepNumber
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-1 text-[11px] font-extrabold text-ink sm:text-xs">
                            {lesson.title}
                          </span>
                          <span className="mt-0.5 block text-[10px] font-semibold text-muted">
                            {stepNumber}-qadam · {lesson.durationMin} daqiqa
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>

                <div className="border-t border-line/70 bg-white/70 px-3 pb-3 sm:px-4 sm:pb-4">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="inline-flex items-center gap-1 text-[11px] font-extrabold text-primary-700 hover:text-primary-800"
                  >
                    Kursni ochish
                    <ArrowRight className="size-3" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line/70 bg-canvas/60 px-4 py-3">
        <p className="text-xs font-semibold leading-relaxed text-muted">
          Keyingi darsni AI mentor bosqichma-bosqich tushuntiradi.
        </p>
        <Link
          href={nextHref}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-extrabold text-ink transition-colors hover:border-primary-200 hover:text-primary-700"
        >
          <BookOpen className="size-3.5" aria-hidden="true" />
          Darsga o&apos;tish
        </Link>
      </div>
    </section>
  );
}
