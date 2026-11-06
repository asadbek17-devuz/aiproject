import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Role, User } from "@prisma/client";
import { db } from "@/server/db";
import { getEnv } from "@/server/env";
import {
  SESSION_COOKIE,
  generateSessionToken,
  hashSessionToken,
  isSessionExpired,
  sessionExpiry,
  type SessionUser,
} from "@/server/auth/session-token";

export { SESSION_COOKIE } from "@/server/auth/session-token";

export type SessionMeta = {
  ip?: string;
  userAgent?: string;
};

export async function createSession(userId: string, meta: SessionMeta = {}): Promise<void> {
  const token = generateSessionToken();
  const expiresAt = sessionExpiry(getEnv().SESSION_TTL_DAYS);

  await db.session.create({
    data: {
      tokenHash: hashSessionToken(token),
      userId,
      expiresAt,
      ip: meta.ip,
      userAgent: meta.userAgent?.slice(0, 300),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true },
  });

  if (!session || session.revokedAt || isSessionExpired(session.expiresAt)) {
    return null;
  }

  return session.user;
});

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    accessStatus: user.accessStatus,
  };
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(...roles: Role[]): Promise<User> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect("/forbidden");
  }
  return user;
}

export async function requireActiveAccess(): Promise<User> {
  const user = await requireUser();
  if (user.accessStatus === "RESTRICTED") {
    redirect("/subscription");
  }
  return user;
}

export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session
      .updateMany({
        where: { tokenHash: hashSessionToken(token), revokedAt: null },
        data: { revokedAt: new Date() },
      })
      .catch(() => undefined);
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getRequestMeta(): Promise<SessionMeta> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || headerStore.get("x-real-ip") || undefined;
  return {
    ip,
    userAgent: headerStore.get("user-agent") ?? undefined,
  };
}
