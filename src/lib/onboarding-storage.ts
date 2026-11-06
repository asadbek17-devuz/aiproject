import { isTrackKey, type TrackKey } from "@/lib/curriculum";

export const ONBOARDING_STORAGE_KEY = "ai_academy_onboarding";

export type StoredOnboarding = {
  track: TrackKey;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  goal: "JOB" | "FREELANCE" | "PRODUCT";
  completedAt: string;
};

export function readOnboarding(): StoredOnboarding | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredOnboarding>;
    if (!isTrackKey(parsed.track)) {
      return null;
    }
    return parsed as StoredOnboarding;
  } catch {
    return null;
  }
}
