import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bell, BookOpen, CalendarDays, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { formatDateUz } from "@/lib/utils";
import { requireUser } from "@/server/auth/session";
import { db } from "@/server/db";
import { ACCESS_LABELS, ADAPTIVE_LABELS, PLAN_LABELS, ROLE_LABELS } from "@/lib/labels";
import { AppHeader } from "@/components/ui/app-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";

export const metadata: Metadata = {
  title: uz.profile.title,
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const user = await requireUser();

  const [enrollment, sessions, notificationCount] = await Promise.all([
    db.enrollment.findFirst({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
      include: {
        course: {
          include: {
            lessons: {
              where: { status: "PUBLISHED" },
              select: { id: true },
            },
          },
        },
      },
    }),
    db.lessonSession.findMany({
      where: { userId: user.id },
      select: { lessonId: true, status: true },
    }),
    db.notification.count({ where: { userId: user.id } }),
  ]);

  const lessons = enrollment?.course.lessons ?? [];
  const completedIds = new Set(
    sessions.filter((session) => session.status === "COMPLETED").map((session) => session.lessonId),
  );
  const completedCount = lessons.filter((lesson) => completedIds.has(lesson.id)).length;
  const progress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader user={{ name: user.name, role: user.role }} variant="app" />
      <main id="main" className="container-page flex-1 py-8 sm:py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-full text-sm font-extrabold text-muted transition-colors hover:text-primary-700"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {uz.profile.backDashboard}
        </Link>

        <div className="animate-fade-up mt-4 overflow-hidden rounded-card border-2 border-white bg-gradient-to-br from-white to-primary-50/70 p-6 shadow-lift sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar name={user.name} size="xl" className="sticker" />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
                {user.name}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-muted">
                <Mail className="size-4" aria-hidden="true" />
                {user.email}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="primary">{ROLE_LABELS[user.role]}</Badge>
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
                <Badge variant="neutral">{PLAN_LABELS[user.subscriptionPlan]}</Badge>
              </div>
            </div>
            <Link href="/mentor-demo" className={buttonStyles({ size: "md" })}>
              <Sparkles className="size-4" aria-hidden="true" />
              {uz.dashboard.askMentor}
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{uz.profile.account}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3 border-b border-line/70 pb-3">
                  <dt className="font-semibold text-muted">{uz.profile.role}</dt>
                  <dd className="font-extrabold text-ink">{ROLE_LABELS[user.role]}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-line/70 pb-3">
                  <dt className="font-semibold text-muted">{uz.profile.adaptiveLevel}</dt>
                  <dd className="font-extrabold text-ink">{ADAPTIVE_LABELS[user.adaptiveLevel]}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-line/70 pb-3">
                  <dt className="font-semibold text-muted">{uz.profile.memberSince}</dt>
                  <dd className="font-extrabold text-ink">{formatDateUz(user.createdAt)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="font-semibold text-muted">{uz.profile.subscriptionEnds}</dt>
                  <dd className="font-extrabold text-ink">
                    {user.subscriptionEndsAt ? formatDateUz(user.subscriptionEndsAt) : "—"}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-success-soft px-3.5 py-3 text-xs font-bold text-green-700">
                <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
                Hisobingiz himoyalangan. Demo ma&apos;lumotlari faqat sinov uchun.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{uz.profile.learning}</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollment ? (
                <>
                  <p className="font-display text-xl font-extrabold text-ink">
                    {enrollment.course.title}
                  </p>
                  <div className="mt-4">
                    <ProgressBar value={progress} label={uz.profile.progress} />
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-primary-50 p-4">
                      <BookOpen className="size-5 text-primary-700" aria-hidden="true" />
                      <p className="mt-2 font-display text-2xl font-extrabold text-ink">
                        {completedCount}/{lessons.length}
                      </p>
                      <p className="text-xs font-bold text-muted">{uz.profile.completedLessons}</p>
                    </div>
                    <div className="rounded-2xl bg-amber-50 p-4">
                      <Bell className="size-5 text-amber-600" aria-hidden="true" />
                      <p className="mt-2 font-display text-2xl font-extrabold text-ink">
                        {notificationCount}
                      </p>
                      <p className="text-xs font-bold text-muted">{uz.profile.notifications}</p>
                    </div>
                  </div>
                  <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-muted">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {uz.profile.memberSince}: {formatDateUz(enrollment.startedAt)}
                  </p>
                </>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/60 p-5 text-center">
                  <p className="font-semibold text-muted">{uz.profile.noCourse}</p>
                  <Link href="/mentor-demo" className={buttonStyles({ size: "md", className: "mt-4" })}>
                    {uz.dashboard.startCourse}
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
