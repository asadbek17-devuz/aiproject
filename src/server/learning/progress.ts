import { db } from "@/server/db";

export async function recordLessonCompletion(userId: string, lessonId: string): Promise<boolean> {
  const lesson = await db.lesson.findFirst({
    where: { id: lessonId, status: "PUBLISHED" },
    select: { id: true, courseId: true },
  });

  if (!lesson) return false;

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: lesson.courseId } },
    select: { id: true },
  });

  if (!enrollment) return false;

  const now = new Date();

  await db.lessonSession.upsert({
    where: { userId_lessonId: { userId, lessonId: lesson.id } },
    create: {
      userId,
      lessonId: lesson.id,
      status: "COMPLETED",
      completedAt: now,
      lastActiveAt: now,
    },
    update: {
      status: "COMPLETED",
      completedAt: now,
      lastActiveAt: now,
    },
  });

  const [publishedLessons, completedLessons] = await Promise.all([
    db.lesson.count({ where: { courseId: lesson.courseId, status: "PUBLISHED" } }),
    db.lessonSession.count({
      where: {
        userId,
        status: "COMPLETED",
        lesson: { courseId: lesson.courseId, status: "PUBLISHED" },
      },
    }),
  ]);

  const progressPercent =
    publishedLessons > 0 ? Math.round((completedLessons / publishedLessons) * 100) : 0;

  await db.enrollment.update({
    where: { id: enrollment.id },
    data: {
      progressPercent,
      completedAt: progressPercent === 100 ? now : null,
    },
  });

  return true;
}
