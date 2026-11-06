"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Binary,
  BookOpen,
  Boxes,
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Code2,
  Languages,
  Layers,
  PlayCircle,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  Trophy,
  X,
} from "lucide-react";
import {
  TRACK_KEYS,
  TRACK_PLANS,
  isTrackKey,
  type CourseKind,
  type TrackKey,
} from "@/lib/curriculum";
import { readOnboarding } from "@/lib/onboarding-storage";
import { cn } from "@/lib/utils";

export type CourseLessonPreview = {
  id: string;
  title: string;
  durationMin: number;
};

export type CourseCardData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  kind: CourseKind;
  lessonCount: number;
  completedCount: number;
  nextLessonId: string | null;
  lessons: CourseLessonPreview[];
};

const kindOrder: CourseKind[] = [
  "FRONTEND",
  "BACKEND",
  "FULLSTACK",
  "CORE",
  "MOBILE",
  "SECURITY",
  "SYSTEM_DESIGN",
  "AI",
  "ENGLISH",
  "EXAM",
];

const kindMeta: Record<CourseKind, { label: string; icon: typeof Code2 }> = {
  FRONTEND: { label: "Frontend", icon: Code2 },
  BACKEND: { label: "Backend", icon: Server },
  FULLSTACK: { label: "Fullstack", icon: Layers },
  EXAM: { label: "Imtihon", icon: Trophy },
  CORE: { label: "Computer science", icon: Binary },
  MOBILE: { label: "Mobile", icon: Smartphone },
  SECURITY: { label: "Cybersecurity", icon: ShieldCheck },
  SYSTEM_DESIGN: { label: "System design", icon: Boxes },
  AI: { label: "AI engineering", icon: Brain },
  ENGLISH: { label: "English", icon: Languages },
};

const levelLabels: Record<string, string> = {
  BEGINNER: "Boshlang'ich",
  INTERMEDIATE: "O'rta",
  ADVANCED: "Yuqori",
};

function progressOf(course: CourseCardData) {
  return course.lessonCount > 0
    ? Math.round((course.completedCount / course.lessonCount) * 100)
    : 0;
}

export function CoursesExplorer({ courses }: { courses: CourseCardData[] }) {
  const [activeTrack, setActiveTrack] = useState<TrackKey | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [expandedKind, setExpandedKind] = useState<CourseKind | null>(null);
  const [selected, setSelected] = useState<CourseCardData | null>(null);

  useEffect(() => {
    const saved = readOnboarding();
    if (saved && isTrackKey(saved.track)) setActiveTrack(saved.track);
  }, []);

  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  const visible = useMemo(() => {
    const planSlugs =
      activeTrack === "ALL" ? null : new Set(TRACK_PLANS[activeTrack].courseSlugs);
    const normalized = query.trim().toLowerCase();

    return courses.filter((course) => {
      if (planSlugs && !planSlugs.has(course.slug)) return false;
      if (!normalized) return true;
      return (
        course.title.toLowerCase().includes(normalized) ||
        course.description.toLowerCase().includes(normalized) ||
        kindMeta[course.kind].label.toLowerCase().includes(normalized)
      );
    });
  }, [activeTrack, courses, query]);

  const groups = useMemo(
    () =>
      kindOrder
        .map((kind) => ({
          kind,
          courses: visible.filter((course) => course.kind === kind),
        }))
        .filter((group) => group.courses.length > 0),
    [visible],
  );

  const totalLessons = courses.reduce((total, course) => total + course.lessonCount, 0);
  const completedLessons = courses.reduce(
    (total, course) => total + course.completedCount,
    0,
  );
  const volume = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const searching = query.trim().length > 0;

  return (
    <div>
      <section className="rounded-[1.5rem] border-2 border-white bg-white/90 p-4 shadow-soft sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-muted">
              <BookOpen className="size-3.5" aria-hidden="true" />
              Kurslar
            </span>
            <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              O&apos;quv yo&apos;nalishlari
            </h1>
            <p className="mt-1 text-sm font-semibold text-muted">
              Sohani tanlang va ichidan o&apos;zingizga kerakli kursni oching.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-extrabold text-ink">
              {courses.length} kurs
            </span>
            <span className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-extrabold text-ink">
              {totalLessons} dars
            </span>
            <span className="rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-extrabold text-muted">
              {volume}% tugallangan
            </span>
          </div>
        </div>
      </section>

      <div className="mt-3 flex flex-col gap-2 rounded-[1.25rem] border-2 border-white bg-white/90 p-2.5 shadow-soft sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Kurs yoki soha qidirish..."
            className="h-10 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-sm font-semibold text-ink outline-none transition-colors placeholder:text-muted focus:border-primary-400"
          />
        </div>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:max-w-[72%]">
          <button
            type="button"
            onClick={() => {
              setActiveTrack("ALL");
              setExpandedKind(null);
            }}
            aria-pressed={activeTrack === "ALL"}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-extrabold transition-colors",
              activeTrack === "ALL"
                ? "border-primary-200 bg-primary-50 text-primary-700"
                : "border-line bg-white text-muted hover:border-slate-300 hover:text-ink",
            )}
          >
            Barchasi
          </button>
          {TRACK_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setActiveTrack(key);
                setExpandedKind(null);
              }}
              aria-pressed={activeTrack === key}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-extrabold transition-colors",
                activeTrack === key
                  ? "border-primary-200 bg-primary-50 text-primary-700"
                  : "border-line bg-white text-muted hover:border-slate-300 hover:text-ink",
              )}
            >
              {TRACK_PLANS[key].shortTitle}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {groups.map((group) => {
          const meta = kindMeta[group.kind];
          const Icon = meta.icon;
          const open = searching || expandedKind === group.kind;
          const groupLessons = group.courses.reduce(
            (total, course) => total + course.lessonCount,
            0,
          );
          const groupDone = group.courses.reduce(
            (total, course) => total + course.completedCount,
            0,
          );
          const groupProgress =
            groupLessons > 0 ? Math.round((groupDone / groupLessons) * 100) : 0;

          return (
            <section
              key={group.kind}
              className="overflow-hidden rounded-[1.25rem] border-2 border-white bg-white/90 shadow-soft"
            >
              <button
                type="button"
                onClick={() => setExpandedKind(open && !searching ? null : group.kind)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 p-3.5 text-left transition-colors hover:bg-canvas/50 sm:p-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-slate-600">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-sm font-extrabold text-ink sm:text-base">
                    {meta.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-semibold text-muted">
                    {group.courses.length} kurs · {groupLessons} dars · {groupProgress}% tugallangan
                  </span>
                </span>
                <span className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 sm:block">
                  <span
                    className="block h-full rounded-full bg-primary-500"
                    style={{ width: `${groupProgress}%` }}
                  />
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted transition-transform",
                    open ? "rotate-180" : "",
                  )}
                  aria-hidden="true"
                />
              </button>

              {open ? (
                <div className="space-y-2 border-t border-line/70 p-2.5 sm:p-3">
                  {group.courses.map((course) => {
                    const progress = progressOf(course);
                    const complete = course.lessonCount > 0 && progress === 100;
                    const href = course.nextLessonId
                      ? `/classroom/${course.nextLessonId}`
                      : `/courses/${course.slug}`;

                    return (
                      <article
                        key={course.id}
                        className="flex flex-col gap-3 rounded-xl border border-line/80 bg-white p-3 sm:flex-row sm:items-center"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded-full bg-canvas px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-muted">
                              {levelLabels[course.level] ?? course.level}
                            </span>
                            <span className="rounded-full bg-canvas px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-muted">
                              {course.lessonCount} dars
                            </span>
                            {complete ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-green-700">
                                <CheckCircle2 className="size-2.5" aria-hidden="true" />
                                Tugallangan
                              </span>
                            ) : null}
                          </div>
                          <h3 className="mt-1 font-display text-sm font-extrabold leading-snug text-ink">
                            {course.title}
                          </h3>
                          <p className="mt-0.5 line-clamp-1 text-xs font-semibold text-muted">
                            {course.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 sm:w-44">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-primary-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-extrabold text-muted">
                            {course.completedCount}/{course.lessonCount}
                          </span>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                          <Link
                            href={href}
                            className="inline-flex flex-1 items-center justify-center gap-1 rounded-full bg-ink px-3 py-2 text-[11px] font-extrabold text-white transition-transform hover:-translate-y-0.5 sm:flex-none"
                          >
                            {complete ? "Tugallangan" : course.completedCount > 0 ? "Davom etish" : "Boshlash"}
                            <ArrowRight className="size-3" aria-hidden="true" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setSelected(course)}
                            className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-white text-muted transition-colors hover:border-primary-200 hover:text-primary-700"
                            aria-label={`${course.title} haqida batafsil`}
                          >
                            <ArrowUpRight className="size-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      {groups.length === 0 ? (
        <p className="mt-3 rounded-[1.25rem] border-2 border-dashed border-line bg-white/70 px-4 py-12 text-center text-sm font-semibold text-muted">
          Bu filtr bo&apos;yicha kurs topilmadi. Boshqa yo&apos;nalish yoki so&apos;zni
          sinab ko&apos;ring.
        </p>
      ) : null}

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          onClick={() => setSelected(null)}
        >
          <div
            className="flex max-h-[88dvh] w-full max-w-xl flex-col overflow-hidden rounded-[1.5rem] border-2 border-white bg-surface shadow-lift"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative flex items-center gap-3 border-b border-line bg-white p-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-canvas text-slate-600">
                {(() => {
                  const Icon = kindMeta[selected.kind].icon;
                  return <Icon className="size-5" aria-hidden="true" />;
                })()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted">
                  {kindMeta[selected.kind].label} · {selected.lessonCount} dars
                </p>
                <h2 className="font-display text-lg font-extrabold leading-tight text-ink">
                  {selected.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-white text-muted transition-colors hover:text-ink"
                aria-label="Yopish"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1 text-[11px] font-bold text-muted">
                  <Clock3 className="size-3" aria-hidden="true" />
                  {selected.lessons.reduce((total, lesson) => total + lesson.durationMin, 0)} daqiqa
                </span>
                <span className="rounded-full bg-canvas px-2.5 py-1 text-[11px] font-bold text-muted">
                  {levelLabels[selected.level] ?? selected.level}
                </span>
                <span className="rounded-full bg-canvas px-2.5 py-1 text-[11px] font-bold text-muted">
                  {progressOf(selected)}% tugallangan
                </span>
              </div>
              <p className="mt-2.5 text-sm font-semibold leading-relaxed text-muted">
                {selected.description}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs font-extrabold uppercase tracking-wide text-muted">
                  Dars rejasi
                </p>
                <BookOpen className="size-4 text-slate-500" aria-hidden="true" />
              </div>
              <ol className="mt-2 max-h-64 space-y-1.5 overflow-y-auto pr-1">
                {selected.lessons.map((lesson, index) => (
                  <li key={lesson.id}>
                    <Link
                      href={`/classroom/${lesson.id}`}
                      className="flex items-center gap-2.5 rounded-xl border border-line/80 bg-white px-3 py-2 transition-colors hover:border-primary-200 hover:bg-primary-50/40"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-canvas text-[10px] font-extrabold text-muted">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink">
                        {lesson.title}
                      </span>
                      <span className="shrink-0 text-[10px] font-bold text-muted">
                        {lesson.durationMin} daq
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col gap-2 border-t border-line bg-canvas/60 p-3 sm:flex-row">
              <Link
                href={
                  selected.nextLessonId
                    ? `/classroom/${selected.nextLessonId}`
                    : `/courses/${selected.slug}`
                }
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
              >
                <PlayCircle className="size-4" aria-hidden="true" />
                {selected.completedCount > 0 ? "Davom ettirish" : "Boshlash"}
              </Link>
              <Link
                href={`/courses/${selected.slug}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-extrabold text-ink transition-colors hover:border-primary-200 hover:text-primary-700"
              >
                To&apos;liq sahifa
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
