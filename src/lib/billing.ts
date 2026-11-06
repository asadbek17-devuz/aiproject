import type { SubscriptionPlan } from "@prisma/client";

export const PAID_PLANS = ["STARTER", "PRO"] as const;

export type PaidPlan = (typeof PAID_PLANS)[number];

export type PlanDetails = {
  id: PaidPlan;
  name: string;
  priceTiyin: number;
  priceLabel: string;
  tagline: string;
  features: string[];
  popular?: boolean;
};

export const PLAN_DURATION_DAYS = 30;

export const PLANS: Record<PaidPlan, PlanDetails> = {
  STARTER: {
    id: "STARTER",
    name: "Starter",
    priceTiyin: 19_900_000,
    priceLabel: "199 000 so'm",
    tagline: "Boshlash uchun qulay tarif",
    features: [
      "Barcha 6 ta amaliy dars",
      "AI mentor savol-javob",
      "Jonli doska va subtitrlar",
      "Amaliy topshiriqlar",
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    priceTiyin: 29_900_000,
    priceLabel: "299 000 so'm",
    tagline: "To'liq ta'lim tajribasi",
    features: [
      "Starter'dagi barcha imkoniyatlar",
      "Cheksiz AI mentor suhbatlari",
      "Uyga vazifa tekshiruvi",
      "Yakuniy loyiha bo'yicha fikr",
      "Ustuvor yordam",
    ],
    popular: true,
  },
};

export function isPaidPlan(value: unknown): value is PaidPlan {
  return typeof value === "string" && (PAID_PLANS as readonly string[]).includes(value);
}

export function isSubscriptionPlan(value: SubscriptionPlan): value is PaidPlan {
  return isPaidPlan(value);
}
