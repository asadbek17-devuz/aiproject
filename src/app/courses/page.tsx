import type { Metadata } from "next";
import { uz } from "@/lib/i18n/uz";
import { kindForCourseSlug } from "@/lib/curriculum";
import { getCurrentUser } from "@/server/auth/session";
import { db } from "@/server/db";
import { AppHeader } from "@/components/ui/app-header";
import { CoursesExplorer, type CourseCardData } from "@/components/courses/courses-explorer";

export const metadata: Metadata = {
  title: "Kurslar — AI Academy",
  description:
    "Frontend, backend, fullstack, mobil, kiberxavfsizlik, system design, AI, matematika va ingliz tili kurslari.",
};

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const user = await getCurrentUser();

  const [courses, sessions] = await Promise.all([
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
          select: { id: true, title: true, durationMin: true },
        },
      },
    }),
    user
      ? db.lessonSession.findMany({
          where: { userId: user.id, status: "COMPLETED" },
          select: { lessonId: true },
        })
      : Promise.resolve([]),
  ]);

  const completed = new Set(sessions.map((session) => session.lessonId));

  const cards: CourseCardData[] = courses.map((course) => {
    const lessonIds = course.lessons.map((lesson) => lesson.id);
    const completedCount = lessonIds.filter((id) => completed.has(id)).length;
    const nextLessonId = user
      ? (lessonIds.find((id) => !completed.has(id)) ?? null)
      : null;

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      level: course.level,
      kind: kindForCourseSlug(course.slug),
      lessonCount: lessonIds.length,
      completedCount,
      nextLessonId,
      lessons: course.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        durationMin: lesson.durationMin,
      })),
    };
  });

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader
        user={user ? { name: user.name, role: user.role } : null}
        variant={user ? "app" : "marketing"}
      />
      <main id="main" className="container-page flex-1 py-8 sm:py-10">
        <CoursesExplorer courses={cards} />
      </main>
      <footer className="border-t border-line/70 py-6">
        <p className="container-page text-center text-xs font-semibold text-muted">
          {uz.common.appName} · AI mentor bilan amaliy IT ta&apos;lim
        </p>
      </footer>
    </div>
  );
}
