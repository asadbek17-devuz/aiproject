import type { AiProvider } from "@prisma/client";
import { db } from "@/server/db";

export type AiUsageInput = {
  userId?: string | null;
  provider: AiProvider;
  model: string;
  purpose: string;
  promptTokens: number;
  completionTokens: number;
  success: boolean;
  error?: string;
};

export async function logAiUsage(input: AiUsageInput): Promise<void> {
  try {
    await db.aiUsage.create({
      data: {
        userId: input.userId ?? null,
        provider: input.provider,
        model: input.model,
        purpose: input.purpose,
        promptTokens: input.promptTokens,
        completionTokens: input.completionTokens,
        totalTokens: input.promptTokens + input.completionTokens,
        success: input.success,
        error: input.error?.slice(0, 300),
      },
    });
  } catch {
    // Usage logging must never break the user-facing request.
  }
}

export async function getMonthlyTokenUsage(now: Date = new Date()): Promise<number> {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const result = await db.aiUsage.aggregate({
    where: { createdAt: { gte: start }, success: true },
    _sum: { totalTokens: true },
  });
  return result._sum.totalTokens ?? 0;
}

export async function isMonthlyLimitExceeded(limit: number): Promise<boolean> {
  return (await getMonthlyTokenUsage()) >= limit;
}
