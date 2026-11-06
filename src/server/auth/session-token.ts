import { createHash, randomBytes } from "node:crypto";
import type { AccessStatus, Role } from "@prisma/client";
import { SESSION_COOKIE } from "@/lib/constants";

export { SESSION_COOKIE };

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function sessionExpiry(ttlDays: number, now: Date = new Date()): Date {
  return new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);
}

export function isSessionExpired(expiresAt: Date, now: Date = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  accessStatus: AccessStatus;
};

