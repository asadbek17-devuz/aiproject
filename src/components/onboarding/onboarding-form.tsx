"use client";

import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowRight,
  Boxes,
  Brain,
  Briefcase,
  Code2,
  Languages,
  Layers,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { ONBOARDING_STORAGE_KEY, type StoredOnboarding } from "@/lib/onboarding-storage";
import { saveOnboardingAction } from "@/modules/onboarding/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const trackOptions = [
  { value: "WEB_DEVELOPER", icon: Code2, hint: "Frontend → backend → fullstack → imtihon" },
  { value: "SOFTWARE_ENGINEER", icon: Boxes, hint: "Algoritm, matematika, backend, system design" },
  { value: "MOBILE_DEVELOPER", icon: Smartphone, hint: "React Native, API va mobil loyiha" },
  { value: "CYBERSECURITY", icon: ShieldCheck, hint: "Linux, tarmoq, OWASP, ethical hacking" },
  { value: "SYSTEM_DESIGN", icon: Layers, hint: "Katta tizimlar va arxitektura" },
  { value: "AI_ENGINEER", icon: Brain, hint: "Python, ML, LLM va RAG" },
  { value: "MATH_ENGLISH", icon: Languages, hint: "IT matematikasi va texnik ingliz tili" },
] as const;

const levelOptions = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

const levelLabelsByTrack: Record<
  (typeof trackOptions)[number]["value"],
  Record<(typeof levelOptions)[number], string>
> = {
  WEB_DEVELOPER: {
    BEGINNER: "Hech narsa bilmayman",
    INTERMEDIATE: "Oddiy sahifa yasay olaman",
    ADVANCED: "Sayt loyihasini qurganman",
  },
  SOFTWARE_ENGINEER: {
    BEGINNER: "Dasturlashni noldan boshlayman",
    INTERMEDIATE: "Algoritmlarni tushunaman",
    ADVANCED: "Backend yoki tizim qurganman",
  },
  MOBILE_DEVELOPER: {
    BEGINNER: "Mobil dasturlashni noldan boshlayman",
    INTERMEDIATE: "Oddiy ilova yasay olaman",
    ADVANCED: "Ilova chop etganman",
  },
  CYBERSECURITY: {
    BEGINNER: "Xavfsizlikni noldan boshlayman",
    INTERMEDIATE: "Linux va tarmoqni bilaman",
    ADVANCED: "Himoya yoki CTF bilan ishlaganman",
  },
  SYSTEM_DESIGN: {
    BEGINNER: "Arxitekturani noldan boshlayman",
    INTERMEDIATE: "Server va bazani tushunaman",
    ADVANCED: "Katta tizim loyihalaganman",
  },
  AI_ENGINEER: {
    BEGINNER: "AI'ni noldan boshlayman",
    INTERMEDIATE: "Python asoslarini bilaman",
    ADVANCED: "ML yoki LLM bilan ishlaganman",
  },
  MATH_ENGLISH: {
    BEGINNER: "Noldan boshlayman",
    INTERMEDIATE: "Matematika asoslarini bilaman",
    ADVANCED: "Texnik inglizchani bilaman",
  },
};

const goalOptions = [
  { value: "JOB", icon: Briefcase, hint: "Portfolio va intervyu tayyorgarligi" },
  { value: "FREELANCE", icon: Sparkles, hint: "Real buyurtmalar uchun amaliyot" },
  { value: "PRODUCT", icon: ArrowRight, hint: "O'z loyihangizni yaratish" },
] as const;

export function OnboardingForm({ name }: { name: string }) {
  const [track, setTrack] = useState<StoredOnboarding["track"]>("WEB_DEVELOPER");
  const [level, setLevel] = useState<StoredOnboarding["level"]>("BEGINNER");
  const [goal, setGoal] = useState<StoredOnboarding["goal"]>("JOB");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const result = await saveOnboardingAction({ track, level, goal });
      if (!result.ok) {
        setSaving(false);
        setError(uz.onboarding.saveError);
        return;
      }

      const value: StoredOnboarding = {
        track,
        level,
        goal,
        completedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(value));
      window.location.assign("/dashboard");
    } catch {
      setSaving(false);
      setError(uz.onboarding.saveError);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-control border border-danger/20 bg-danger-soft px-3 py-2.5 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      <section className="rounded-card border-2 border-white bg-white/90 p-5 shadow-soft sm:p-6">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary-600 text-xs font-extrabold text-white">
            1
          </span>
          <h2 className="font-display text-lg font-extrabold text-ink">{uz.onboarding.trackTitle}</h2>
        </div>
        <p className="mt-1.5 text-sm font-semibold text-muted">{uz.onboarding.trackBody}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trackOptions.map((option) => {
            const Icon = option.icon;
            const active = track === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTrack(option.value)}
                aria-pressed={active}
                className={cn(
                  "group rounded-2xl border-2 p-4 text-left transition-all",
                  active
                    ? "border-primary-500 bg-primary-50 shadow-[0_5px_0_0_#bfdbfe]"
                    : "border-line bg-canvas/60 hover:border-primary-300 hover:bg-primary-50/50",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl",
                    active ? "bg-primary-600 text-white" : "bg-white text-primary-700",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="mt-3 block text-sm font-extrabold text-ink">
                  {uz.onboarding.tracks[option.value]}
                </span>
                <span className="mt-1 block text-xs font-semibold text-muted">{option.hint}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-card border-2 border-white bg-white/90 p-5 shadow-soft sm:p-6">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary-600 text-xs font-extrabold text-white">
            2
          </span>
          <h2 className="font-display text-lg font-extrabold text-ink">{uz.onboarding.levelTitle}</h2>
        </div>
        <p className="mt-1.5 text-sm font-semibold text-muted">{uz.onboarding.levelBody}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {levelOptions.map((option) => {
            const active = level === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setLevel(option)}
                aria-pressed={active}
                className={cn(
                  "rounded-2xl border-2 px-4 py-3 text-sm font-extrabold transition-all",
                  active
                    ? "border-primary-500 bg-primary-600 text-white shadow-[0_4px_0_0_#1d4ed8]"
                    : "border-line bg-canvas/60 text-ink hover:border-primary-300",
                )}
              >
                {levelLabelsByTrack[track][option]}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-card border-2 border-white bg-white/90 p-5 shadow-soft sm:p-6">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary-600 text-xs font-extrabold text-white">
            3
          </span>
          <h2 className="font-display text-lg font-extrabold text-ink">{uz.onboarding.goalTitle}</h2>
        </div>
        <p className="mt-1.5 text-sm font-semibold text-muted">{uz.onboarding.goalBody}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {goalOptions.map((option) => {
            const Icon = option.icon;
            const active = goal === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setGoal(option.value)}
                aria-pressed={active}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                  active
                    ? "border-primary-500 bg-primary-50"
                    : "border-line bg-canvas/60 hover:border-primary-300",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    active ? "bg-primary-600 text-white" : "bg-white text-primary-700",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-extrabold text-ink">
                    {option.value === "JOB"
                      ? "Ishga joylashish"
                      : option.value === "FREELANCE"
                        ? "Freelance"
                        : "O'z mahsulotim"}
                  </span>
                  <span className="mt-1 block text-xs font-semibold text-muted">{option.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex flex-col items-center gap-3">
        <Button type="submit" size="lg" loading={saving} className="w-full sm:w-auto sm:min-w-64">
          {uz.onboarding.submit}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
        <p className="text-center text-xs font-semibold text-muted">
          {name}, rejangizni keyin profildan {"o'zgartirishingiz"} mumkin.
        </p>
      </div>
    </form>
  );
}
