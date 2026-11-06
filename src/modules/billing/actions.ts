"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { requireUser } from "@/server/auth/session";
import { isPaidPlan, PLAN_DURATION_DAYS, PLANS } from "@/lib/billing";

function invoiceNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INV-${stamp}-${random}`;
}

export async function purchasePlanAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const plan = formData.get("plan");

  if (!isPaidPlan(plan)) {
    redirect("/subscription?status=invalid");
  }

  const details = PLANS[plan];
  const now = new Date();
  const base =
    user.subscriptionEndsAt && user.subscriptionEndsAt.getTime() > now.getTime()
      ? user.subscriptionEndsAt
      : now;
  const endsAt = new Date(base);
  endsAt.setDate(endsAt.getDate() + PLAN_DURATION_DAYS);

  await db.$transaction([
    db.payment.create({
      data: {
        userId: user.id,
        invoiceNumber: invoiceNumber(),
        amount: details.priceTiyin,
        status: "PAID",
        provider: "DEMO",
        providerRef: `demo-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
        description: `${details.name} obuna — ${PLAN_DURATION_DAYS} kun`,
        paidAt: now,
      },
    }),
    db.user.update({
      where: { id: user.id },
      data: {
        subscriptionPlan: plan,
        subscriptionEndsAt: endsAt,
        accessStatus: "ACTIVE",
      },
    }),
    db.notification.create({
      data: {
        userId: user.id,
        type: "PAYMENT",
        title: "To'lov muvaffaqiyatli yakunlandi",
        body: `${details.name} obuna ${PLAN_DURATION_DAYS} kunga faollashtirildi.`,
        link: "/subscription",
      },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/subscription");
  redirect("/subscription?status=paid");
}
