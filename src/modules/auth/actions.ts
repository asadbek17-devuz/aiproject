"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { uz } from "@/lib/i18n/uz";
import { db } from "@/server/db";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { createSession, destroyCurrentSession, getRequestMeta } from "@/server/auth/session";
import { rateLimit } from "@/server/security/rate-limit";
import { loginSchema, registerSchema } from "@/modules/auth/schema";
import { safeNextPath } from "@/lib/safe-redirect";

import type { AuthFormState } from "@/modules/auth/types";

const DUMMY_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$aud9uSWxUVegC+5d2EB1VA$eVny+T7GMzeJfYyKdTBfknViAask5UhVOksUFLUNSR4";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

function fieldErrors(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  return error.flatten().fieldErrors;
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: uz.auth.errors.validation, fieldErrors: fieldErrors(parsed.error) };
  }

  const { name, email, password } = parsed.data;
  const meta = await getRequestMeta();
  const ip = meta.ip ?? "unknown";

  const ipLimit = await rateLimit({
    key: `auth:register:ip:${ip}`,
    limit: 10,
    windowMs: FIFTEEN_MINUTES,
  });
  const emailLimit = await rateLimit({
    key: `auth:register:email:${email}`,
    limit: 5,
    windowMs: ONE_HOUR,
  });

  if (!ipLimit.allowed || !emailLimit.allowed) {
    return { error: uz.auth.errors.rateLimited };
  }

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    // Generic message on purpose: registration must not reveal whether an email exists.
    return { error: uz.auth.errors.registrationFailed };
  }

  const passwordHash = await hashPassword(password);

  let userId: string;
  try {
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "STUDENT",
        accessStatus: "ACTIVE",
        subscriptionPlan: "NONE",
        learningTrackKey: "WEB_DEVELOPER",
        onboardingCompleted: false,
      },
      select: { id: true },
    });
    userId = user.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: uz.auth.errors.registrationFailed };
    }
    console.error("registerAction failed");
    return { error: uz.auth.errors.unknown };
  }

  try {
    const course = await db.course.findFirst({
      where: { isPublished: true },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (course) {
      await db.enrollment.create({
        data: { userId, courseId: course.id, progressPercent: 0 },
      });
      await db.notification.create({
        data: {
          userId,
          type: "SUCCESS",
          title: "AI Academy'ga xush kelibsiz!",
          body: "Birinchi darsni AI mentor bilan boshlang. Savollaringizga 24/7 javob beradi.",
          link: "/mentor-demo",
        },
      });
    }
  } catch {
    console.error("registerAction bootstrap failed");
  }

  await createSession(userId, meta);
  redirect("/onboarding");
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: uz.auth.errors.validation, fieldErrors: fieldErrors(parsed.error) };
  }

  const { email, password } = parsed.data;
  const meta = await getRequestMeta();
  const ip = meta.ip ?? "unknown";

  const ipLimit = await rateLimit({
    key: `auth:login:ip:${ip}`,
    limit: 20,
    windowMs: FIFTEEN_MINUTES,
  });
  const emailLimit = await rateLimit({
    key: `auth:login:email:${email}`,
    limit: 6,
    windowMs: FIFTEEN_MINUTES,
  });

  if (!ipLimit.allowed || !emailLimit.allowed) {
    return { error: uz.auth.errors.rateLimited };
  }

  const user = await db.user.findUnique({ where: { email } });
  const valid = user
    ? await verifyPassword(user.passwordHash, password)
    : await verifyPassword(DUMMY_HASH, password);

  if (!user || !valid) {
    return { error: uz.auth.errors.invalidCredentials };
  }

  await createSession(user.id, meta);
  redirect(safeNextPath(formData.get("next")) ?? "/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroyCurrentSession();
  redirect("/");
}
