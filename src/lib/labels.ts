import type {
  AccessStatus,
  AdaptiveLevel,
  LearningTrack,
  Role,
  SubscriptionPlan,
} from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  TEACHER: "O'qituvchi",
  STUDENT: "Talaba",
};

export const ACCESS_LABELS: Record<AccessStatus, string> = {
  ACTIVE: "Faol",
  GRACE: "Imtiyozli davr",
  RESTRICTED: "Cheklangan",
};

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  NONE: "Yo'q",
  STARTER: "Starter",
  PRO: "Pro",
};

export const ADAPTIVE_LABELS: Record<AdaptiveLevel, string> = {
  BEGINNER: "Boshlang'ich",
  INTERMEDIATE: "O'rta",
  ADVANCED: "Yuqori",
};

export const TRACK_LABELS: Record<LearningTrack, string> = {
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  FULLSTACK: "Fullstack",
};
