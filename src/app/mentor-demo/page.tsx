import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { db } from "@/server/db";
import { requireUser } from "@/server/auth/session";
import { flattenLessonScript } from "@/server/ai/lesson-script.schema";
import { loadApprovedScript } from "@/server/ai/service";
import { AppHeader } from "@/components/ui/app-header";
import { MentorDemo } from "@/components/classroom/mentor-demo";

export const metadata: Metadata = {
  title: uz.mentorDemo.title,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MentorDemoPage() {
  const user = await requireUser();
  const lesson = await db.lesson.findFirst({
    where: {
      order: 1,
      status: "PUBLISHED",
      course: { slug: "web-dasturlash-asoslari" },
    },
    select: { id: true, title: true },
  });

  if (!lesson) notFound();

  const { script } = await loadApprovedScript(lesson.id, user.id);
  const step = flattenLessonScript(script)[0];
  if (!step) notFound();

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader user={{ name: user.name, role: user.role }} variant="app" />
      <main id="main" className="container-page flex-1 py-8 sm:py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-control text-sm font-medium text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {uz.dashboard.title}
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {uz.mentorDemo.title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
          {uz.mentorDemo.subtitle}
        </p>

        <div className="mt-6">
          <MentorDemo
            lessonId={lesson.id}
            lessonTitle={lesson.title}
            stepIndex={step.stepIndex}
            stepTitle={step.title}
            narration={step.narration}
            boardActions={step.boardActions}
          />
        </div>
      </main>
    </div>
  );
}
