import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CreditCard,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import type { PaymentStatus } from "@prisma/client";
import { uz } from "@/lib/i18n/uz";
import { formatDateUz, formatUzs } from "@/lib/utils";
import { ACCESS_LABELS, PLAN_LABELS } from "@/lib/labels";
import { PAYMENT_STATUS_LABELS } from "@/lib/payment-labels";
import { PLANS, PAID_PLANS } from "@/lib/billing";
import { requireUser } from "@/server/auth/session";
import { db } from "@/server/db";
import { purchasePlanAction } from "@/modules/billing/actions";
import { AppHeader } from "@/components/ui/app-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: uz.subscription.title,
  robots: { index: false, follow: false },
};

const statusVariant: Record<PaymentStatus, "success" | "warning" | "danger" | "neutral"> = {
  PAID: "success",
  PENDING: "warning",
  FAILED: "danger",
  REFUNDED: "neutral",
};

type SubscriptionPageProps = {
  searchParams: Promise<{ status?: string | string[] }>;
};

export default async function SubscriptionPage({ searchParams }: SubscriptionPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const status = Array.isArray(params.status) ? params.status[0] : params.status;

  const payments = await db.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const currentPlan = PLAN_LABELS[user.subscriptionPlan];
  const access = ACCESS_LABELS[user.accessStatus];

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader user={{ name: user.name, role: user.role }} variant="app" />
      <main id="main" className="container-page flex-1 py-7 sm:py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-full text-sm font-extrabold text-muted transition-colors hover:text-primary-700"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {uz.subscription.back}
        </Link>

        <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-primary-700">
              <Wallet className="size-3.5" aria-hidden="true" />
              {uz.dashboard.payments}
            </span>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {uz.subscription.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-muted">
              {uz.subscription.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">{currentPlan}</Badge>
            <Badge
              variant={
                user.accessStatus === "ACTIVE"
                  ? "success"
                  : user.accessStatus === "GRACE"
                    ? "warning"
                    : "danger"
              }
            >
              {access}
            </Badge>
          </div>
        </div>

        {status === "paid" ? (
          <div className="mt-5 flex items-start gap-2 rounded-2xl border border-success/30 bg-success-soft px-4 py-3 text-sm font-semibold text-green-800">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {uz.subscription.paid}
          </div>
        ) : null}

        {status === "invalid" ? (
          <div className="mt-5 flex items-start gap-2 rounded-2xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm font-semibold text-red-700">
            <CreditCard className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {uz.subscription.invalid}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="overflow-hidden border-2 border-primary-100">
            <CardContent className="relative overflow-hidden p-6 sm:p-7">
              <div
                className="pointer-events-none absolute -right-10 -top-14 size-44 rounded-full border-[24px] border-primary-100/70"
                aria-hidden="true"
              />
              <div className="relative">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary-700">
                  {uz.subscription.currentTitle}
                </p>
                <div className="mt-2 flex flex-wrap items-end gap-3">
                  <p className="font-display text-4xl font-extrabold tracking-tight text-ink">
                    {currentPlan}
                  </p>
                  <Badge
                    variant={
                      user.accessStatus === "ACTIVE"
                        ? "success"
                        : user.accessStatus === "GRACE"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {access}
                  </Badge>
                </div>
                <p className="mt-2 text-sm font-semibold text-muted">
                  {user.accessStatus === "ACTIVE"
                    ? uz.subscription.accessActive
                    : user.accessStatus === "GRACE"
                      ? uz.subscription.accessGrace
                      : uz.subscription.accessRestricted}
                </p>
                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-canvas px-4 py-3">
                    <dt className="text-xs font-bold text-muted">{uz.subscription.activeUntil}</dt>
                    <dd className="mt-1 font-extrabold text-ink">
                      {user.subscriptionEndsAt ? formatDateUz(user.subscriptionEndsAt) : "—"}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-canvas px-4 py-3">
                    <dt className="text-xs font-bold text-muted">{uz.dashboard.role}</dt>
                    <dd className="mt-1 font-extrabold text-ink">{user.name}</dd>
                  </div>
                </dl>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-ink to-slate-800 text-white">
            <CardContent className="flex h-full flex-col justify-between p-6 sm:p-7">
              <div>
                <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-white/10 text-sky-300">
                  <ReceiptText className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-4 font-display text-xl font-extrabold">{uz.subscription.demoNote}</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-300">
                  {uz.subscription.history}: {payments.length} ta yozuv. To&apos;lovlar Demo
                  provayder orqali qayd etiladi.
                </p>
              </div>
              <p className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-slate-300">
                <ShieldCheck className="size-4 text-emerald-400" aria-hidden="true" />
                Xavfsiz demo to&apos;lov
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex items-center gap-2">
          <Sparkles className="size-5 text-primary-600" aria-hidden="true" />
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
            {uz.subscription.features}
          </h2>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {PAID_PLANS.map((planId) => {
            const plan = PLANS[planId];
            const isCurrent = user.subscriptionPlan === planId;
            return (
              <div
                key={plan.id}
                className={
                  plan.popular
                    ? "relative overflow-hidden rounded-card border-2 border-primary-600 bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white shadow-glow sm:p-7"
                    : "relative overflow-hidden rounded-card border-2 border-line bg-surface p-6 shadow-soft sm:p-7"
                }
              >
                {plan.popular ? (
                  <span className="absolute right-5 top-5 rounded-full bg-amber-300 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-950">
                    {uz.subscription.popular}
                  </span>
                ) : null}
                <p
                  className={
                    plan.popular
                      ? "text-xs font-extrabold uppercase tracking-[0.18em] text-primary-100"
                      : "text-xs font-extrabold uppercase tracking-[0.18em] text-primary-700"
                  }
                >
                  {plan.name}
                </p>
                <p className="mt-2 font-display text-4xl font-extrabold tracking-tight">
                  {plan.priceLabel}
                </p>
                <p
                  className={
                    plan.popular
                      ? "mt-1 text-sm font-semibold text-primary-100"
                      : "mt-1 text-sm font-semibold text-muted"
                  }
                >
                  {plan.tagline} · {uz.subscription.duration}
                </p>

                <ul className="mt-5 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm font-semibold">
                      <span
                        className={
                          plan.popular
                            ? "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15"
                            : "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success-soft"
                        }
                      >
                        <Check
                          className={plan.popular ? "size-3 text-white" : "size-3 text-success"}
                          aria-hidden="true"
                        />
                      </span>
                      <span className={plan.popular ? "text-primary-50" : "text-slate-700"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <form action={purchasePlanAction} className="mt-6">
                  <input type="hidden" name="plan" value={plan.id} />
                  <Button
                    type="submit"
                    variant={plan.popular ? "secondary" : "primary"}
                    size="lg"
                    className={
                      plan.popular
                        ? "w-full border-white/0 text-primary-700 shadow-[0_5px_0_0_#bfdbfe] hover:bg-white"
                        : "w-full"
                    }
                  >
                    <CreditCard className="size-4" aria-hidden="true" />
                    {isCurrent ? uz.subscription.extend : uz.subscription.choose}
                  </Button>
                </form>
                {isCurrent ? (
                  <p className="mt-2 text-center text-[11px] font-bold opacity-80">
                    {uz.subscription.currentTitle}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        <Card className="mt-8">
          <CardContent className="p-0">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="font-display text-lg font-extrabold text-ink">
                {uz.subscription.history}
              </h2>
              <Link
                href="/dashboard"
                className={buttonStyles({ variant: "ghost", size: "sm", className: "hidden sm:inline-flex" })}
              >
                {uz.subscription.back}
              </Link>
            </div>
            {payments.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm font-semibold text-muted">
                {uz.subscription.noPayments}
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {payments.map((payment) => (
                  <li
                    key={payment.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-ink">
                        {payment.description}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-muted">
                        {uz.subscription.invoice}: {payment.invoiceNumber} ·{" "}
                        {formatDateUz(payment.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-display text-base font-extrabold text-ink">
                        {formatUzs(payment.amount)}
                      </span>
                      <Badge variant={statusVariant[payment.status]}>
                        {PAYMENT_STATUS_LABELS[payment.status]}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
