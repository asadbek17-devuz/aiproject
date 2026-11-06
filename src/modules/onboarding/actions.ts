"use server";

import type { LearningTrack } from "@prisma/client";
import { z } from "zod";
import { TRACK_KEYS, getTrackPlan, type TrackKey } from "@/lib/curriculum";
import { requireUser } from "@/server/auth/session";
import { db } from "@/server/db";

const onboardingSchema = z.object({
  track: z.enum(TRACK_KEYS),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  goal: z.enum(["JOB", "FREELANCE", "PRODUCT"]),
});

const legacyTrack: Record<TrackKey, LearningTrack> = {
  WEB_DEVELOPER: "FULLSTACK",
  SOFTWARE_ENGINEER: "FULLSTACK",
  MOBILE_DEVELOPER: "FRONTEND",
  CYBERSECURITY: "BACKEND",
  SYSTEM_DESIGN: "BACKEND",
  AI_ENGINEER: "BACKEND",
  MATH_ENGLISH: "FRONTEND",
};

export async function saveOnboardingAction(input: unknown): Promise<{ ok: boolean }> {
  const user = await requireUser();
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) return { ok: false };

  const { track, level } = parsed.data;

  await db.user.update({
    where: { id: user.id },
    data: {
      learningTrackKey: track,
      learningTrack: legacyTrack[track],
      adaptiveLevel: level,
      onboardingCompleted: true,
    },
  });

  const firstSlug = getTrackPlan(track).courseSlugs[0];
  const course = firstSlug
    ? await db.course.findFirst({
        where: { slug: firstSlug, isPublished: true },
        select: { id: true },
      })
    : null;

  if (course) {
    await db.enrollment.upsert({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      update: {},
      create: { userId: user.id, courseId: course.id, progressPercent: 0 },
    });
  }

  return { ok: true };
}
