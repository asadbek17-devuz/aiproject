import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { uz } from "@/lib/i18n/uz";
import { db } from "@/server/db";
import { requireUser } from "@/server/auth/session";
import { flattenLessonScript } from "@/server/ai/lesson-script.schema";
import { loadApprovedScript } from "@/server/ai/service";
import { AppHeader } from "@/components/ui/app-header";
import { ClassroomPlayer } from "@/components/classroom/classroom-player";

export const metadata: Metadata = {
  title: uz.classroom.title,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ClassroomPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const user = await requireUser();
  const { lessonId } = await params;

  const lesson = await db.lesson.findFirst({
    where: { id: lessonId, status: "PUBLISHED" },
    select: { id: true, title: true },
  });

  if (!lesson) notFound();

  const { script } = await loadApprovedScript(lesson.id, user.id);
  const steps = flattenLessonScript(script);

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader user={{ name: user.name, role: user.role }} variant="app" />
      <main id="main" className="container-page flex-1 py-6 sm:py-8">
        <ClassroomPlayer lessonId={lesson.id} lessonTitle={lesson.title} steps={steps} />
      </main>
    </div>
  );
}
