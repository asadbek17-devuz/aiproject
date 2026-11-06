import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BookOpen,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { NotificationType } from "@prisma/client";
import { uz } from "@/lib/i18n/uz";
import { formatDateUz } from "@/lib/utils";
import { requireUser } from "@/server/auth/session";
import { db } from "@/server/db";
import { PLAN_LABELS, ROLE_LABELS } from "@/lib/labels";
import { AppHeader } from "@/components/ui/app-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MentorAvatar } from "@/components/classroom/mentor-avatar";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";

export const metadata: Metadata = {
  title: uz.dashboard.title,
  robots: { index: false, follow: false },
};

const notificationIcons: Record<NotificationType, typeof Bell> = {
  INFO: Bell,
  SUCCESS: CheckCircle2,
  WARNING: AlertTriangle,
  PAYMENT: CreditCard,
  LESSON: BookOpen,
  HOMEWORK: GraduationCap,
};

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Bell;
  value: string | number;
  label: string;
}) {
  return (
    <div className="card-hover rounded-card border-2 border-white bg-white/80 p-4 shadow-soft backdrop-blur">
      <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink">{value}</p>
      <p className="mt-0.5 text-xs font-bold text-muted">{label}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();

  if (user.role === "STUDENT") {
    return <StudentDashboard user={user} />;
  }

  const [notifications, unreadCount, teacherStats] = await Promise.all([
    db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    db.notification.count({ where: { userId: user.id, readAt: null } }),
    Promise.all([
      db.user.count({ where: { role: "STUDENT" } }),
      db.homeworkSubmission.count({ where: { status: "PENDING" } }),
      db.lesson.count({ where: { status: "PUBLISHED" } }),
    ]),
  ]);

  const heroTitle = user.role === "ADMIN" ? uz.dashboard.adminTitle : uz.dashboard.teacherTitle;
  const heroBody = user.role === "ADMIN" ? uz.dashboard.adminBody : uz.dashboard.teacherBody;

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader user={{ name: user.name, role: user.role }} variant="app" />
      <main id="main" className="container-page flex-1 py-8 sm:py-10">
        <div className="animate-fade-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-balance font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {uz.dashboard.greeting.replace("{name}", user.name.split(" ")[0] ?? user.name)}
            </h1>
            <p className="mt-1.5 text-sm font-semibold text-muted">{uz.dashboard.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">{ROLE_LABELS[user.role]}</Badge>
            <Badge variant="outline">{PLAN_LABELS[user.subscriptionPlan]}</Badge>
          </div>
        </div>

        <section className="relative mt-6 overflow-hidden rounded-card bg-gradient-to-br from-primary-600 via-primary-600 to-primary-800 p-6 shadow-glow sm:p-8">
          <div
            className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full border-[26px] border-white/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 right-28 size-40 rounded-full bg-white/10 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <Avatar name={user.name} size="xl" className="sticker hidden sm:inline-flex" />
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary-200">
                  {ROLE_LABELS[user.role]}
                </p>
                <h2 className="mt-1.5 text-balance font-display text-2xl font-extrabold text-white sm:text-3xl">
                  {heroTitle}
                </h2>
                <p className="mt-2 max-w-xl text-sm font-semibold leading-relaxed text-primary-100">
                  {heroBody}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/mentor-demo"
                className={buttonStyles({
                  variant: "secondary",
                  size: "md",
                  className:
                    "border-white/0 text-primary-700 shadow-[0_5px_0_0_#bfdbfe] hover:bg-white",
                })}
              >
                {uz.dashboard.tryMentor}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/profile"
                className={buttonStyles({
                  variant: "ghost",
                  size: "md",
                  className: "text-white hover:bg-white/15 hover:text-white",
                })}
              >
                <UserRound className="size-4" aria-hidden="true" />
                {uz.dashboard.profile}
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <StatCard icon={UserRound} value={teacherStats[0]} label={uz.dashboard.students} />
          <StatCard icon={GraduationCap} value={teacherStats[1]} label={uz.dashboard.pendingReviews} />
          <StatCard icon={BookOpen} value={teacherStats[2]} label={uz.dashboard.publishedLessons} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
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

          <div className="space-y-5">
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
                  href="/mentor-demo"
                  className={buttonStyles({ size: "md", className: "mt-4 w-full" })}
                >
                  <Sparkles className="size-4" aria-hidden="true" />
                  {uz.dashboard.askMentor}
                </Link>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{uz.dashboard.profile}</CardTitle>
                <p className="text-sm font-semibold text-muted">{uz.dashboard.profileBody}</p>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="font-semibold text-muted">{uz.dashboard.role}</dt>
                    <dd className="font-extrabold text-ink">{ROLE_LABELS[user.role]}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="font-semibold text-muted">{uz.dashboard.plan}</dt>
                    <dd className="font-extrabold text-ink">{PLAN_LABELS[user.subscriptionPlan]}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="font-semibold text-muted">{uz.dashboard.memberSince}</dt>
                    <dd className="font-extrabold text-ink">{formatDateUz(user.createdAt)}</dd>
                  </div>
                </dl>
                <Link
                  href="/profile"
                  className={buttonStyles({
                    variant: "secondary",
                    size: "sm",
                    className: "mt-5 w-full",
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
