import type { AiProvider } from "@prisma/client";
import { db } from "@/server/db";
import { getEnv } from "@/server/env";
import { AppError } from "@/server/errors";
import { getAiProvider } from "@/server/ai";
import {
  flattenLessonScript,
  lessonScriptSchema,
  type LessonScript,
} from "@/server/ai/lesson-script.schema";
import {
  buildLessonGenerationMessages,
  buildMentorMessages,
  type MentorIntent,
} from "@/server/ai/prompts";
import { AiProviderError } from "@/server/ai/provider.interface";
import { normalizeLessonScript } from "@/server/ai/normalize-script";
import { naturalizeMentorAnswer } from "@/server/ai/spoken";
import { getMonthlyTokenUsage, logAiUsage } from "@/server/ai/usage";

async function getSettings() {
  return db.platformSetting.findUnique({ where: { id: "global" } });
}

async function assertMonthlyBudget(limit: number): Promise<void> {
  const used = await getMonthlyTokenUsage();
  if (used >= limit) {
    throw new AppError(
      "RATE_LIMITED",
      "AI oylik limiti tugadi. Keyingi oy yoki administrator limitni oshirgach qayta urinib ko'ring.",
    );
  }
}

export async function loadApprovedScript(
  lessonId: string,
  actorId?: string,
): Promise<{
  script: LessonScript;
  lessonTitle: string;
}> {
  async function findApproved() {
    return db.lesson.findFirst({
      where: { id: lessonId, status: "PUBLISHED" },
      include: {
        scripts: {
          where: { status: "APPROVED" },
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });
  }

  let lesson = await findApproved();
  if (!lesson) {
    throw new AppError("NOT_FOUND", "Dars topilmadi.");
  }

  if (lesson.scripts.length === 0) {
    if (!actorId) {
      throw new AppError("NOT_FOUND", "Bu dars uchun tasdiqlangan skript topilmadi.");
    }
    await generateLessonScript({ lessonId, actorId, approve: true });
    lesson = await findApproved();
  }

  if (!lesson || lesson.scripts.length === 0) {
    throw new AppError("NOT_FOUND", "Bu dars uchun tasdiqlangan skript topilmadi.");
  }

  const parsed = lessonScriptSchema.safeParse(lesson.scripts[0].content);
  if (!parsed.success) {
    throw new AppError("INTERNAL", "Dars skripti formati noto'g'ri.");
  }

  return { script: parsed.data, lessonTitle: lesson.title };
}

export type MentorAnswer = {
  answer: string;
  provider: AiProvider;
  model: string;
  stepTitle: string;
  segmentType: string;
};

export async function askMentor(input: {
  userId: string;
  lessonId: string;
  stepIndex: number;
  question: string;
  adaptiveLevel: string;
  intent?: MentorIntent;
}): Promise<MentorAnswer> {
  const { script, lessonTitle } = await loadApprovedScript(input.lessonId, input.userId);
  const steps = flattenLessonScript(script);
  const step = steps[Math.min(Math.max(0, input.stepIndex), steps.length - 1)];
  if (!step) {
    throw new AppError("NOT_FOUND", "Dars bosqichi topilmadi.");
  }

  const settings = await getSettings();
  const env = getEnv();
  await assertMonthlyBudget(settings?.monthlyTokenLimit ?? env.AI_MONTHLY_TOKEN_LIMIT);

  const provider = getAiProvider();
  const messages = buildMentorMessages({
    lessonTitle,
    stepTitle: step.title,
    stepNarration: step.narration,
    question: input.question,
    adaptiveLevel: input.adaptiveLevel,
    intent: input.intent,
  });

  try {
    const result = await provider.complete({
      model: env.AI_MENTOR_MODEL.trim() || undefined,
      messages,
      temperature: settings?.aiTemperature ?? 0.45,
      maxTokens: input.intent === "deep_dive" ? 1100 : 700,
    });

    await logAiUsage({
      userId: input.userId,
      provider: result.provider,
      model: result.model,
      purpose: "mentor_question",
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      success: true,
    });

    return {
      answer: naturalizeMentorAnswer(result.text),
      provider: result.provider,
      model: result.model,
      stepTitle: step.title,
      segmentType: step.segmentType,
    };
  } catch (error) {
    await logAiUsage({
      userId: input.userId,
      provider: provider.name,
      model: env.AI_MODEL,
      purpose: "mentor_question",
      promptTokens: 0,
      completionTokens: 0,
      success: false,
      error: error instanceof Error ? error.name : "unknown",
    });

    if (error instanceof AiProviderError) {
      throw new AppError(
        "AI_UNAVAILABLE",
        "AI mentor hozir javob bera olmayapti. Birozdan so'ng qayta urinib ko'ring.",
      );
    }
    throw error;
  }
}

function extractJson(raw: string): unknown {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in AI response.");
  }
  return JSON.parse(cleaned.slice(start, end + 1)) as unknown;
}

export type HomeworkReview = {
  score: number;
  summary: string;
  suggestions: string[];
  provider: AiProvider;
  model: string;
};

function clampScore(value: unknown, maxScore: number): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(maxScore, Math.round(numeric)));
}

function fallbackHomeworkReview(content: string, maxScore: number): HomeworkReview {
  const trimmed = content.trim();
  const lines = trimmed.split("\n").filter((line) => line.trim().length > 0).length;
  const hasGithub = /github\.com|gitlab\.com/i.test(trimmed);
  const base = trimmed.length >= 120 ? 0.72 : trimmed.length >= 40 ? 0.55 : 0.35;
  const bonus = Math.min(0.15, lines * 0.015) + (hasGithub ? 0.03 : 0);
  return {
    score: clampScore(Math.round(maxScore * Math.min(1, base + bonus)), maxScore),
    summary:
      trimmed.length === 0
        ? "Javob bo'sh. Topshiriq matnini yoki GitHub havolasini qoldiring."
        : "Javob qabul qilindi. AI xizmati band bo'lgani uchun taxminiy baho qo'yildi.",
    suggestions: [
      "Vazifalar ro'yxatidagi har bir bandni alohida tekshiring.",
      "Kodni GitHub'ga yuklab, havolasini ham qoldiring.",
      "Keyingi safar qisqa izoh va natija skrinshotini qo'shing.",
    ],
    provider: "MOCK",
    model: "fallback-review",
  };
}

export async function reviewHomework(input: {
  userId: string;
  homeworkTitle: string;
  description: string;
  tasks: string[];
  content: string;
  maxScore: number;
}): Promise<HomeworkReview> {
  const settings = await getSettings();
  const env = getEnv();
  await assertMonthlyBudget(settings?.monthlyTokenLimit ?? env.AI_MONTHLY_TOKEN_LIMIT);

  const provider = getAiProvider();
  const messages = [
    {
      role: "system" as const,
      content:
        "Siz AI Academy'ning uy ishi tekshiruvchi mentorisiz. O'zbek tilida qisqa, aniq va rag'batlantiruvchi izoh bering. Faqat shu formatdagi JSON qaytaring: {\"score\": number, \"summary\": string, \"suggestions\": string[]}. score 0 va maksimal ball orasida bo'lsin.",
    },
    {
      role: "user" as const,
      content: [
        `Topshiriq: ${input.homeworkTitle}`,
        `Tavsif: ${input.description}`,
        `Vazifalar: ${input.tasks.join("; ") || "ko'rsatilmagan"}`,
        `Maksimal ball: ${input.maxScore}`,
        "Talaba javobi:",
        input.content.slice(0, 6000),
      ].join("\n"),
    },
  ];

  try {
    const result = await provider.complete({
      model: env.AI_MENTOR_MODEL.trim() || undefined,
      messages,
      temperature: 0.25,
      maxTokens: 700,
      json: true,
    });

    let parsed: { score?: unknown; summary?: unknown; suggestions?: unknown };
    try {
      parsed = extractJson(result.text) as typeof parsed;
    } catch {
      return fallbackHomeworkReview(input.content, input.maxScore);
    }

    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions
          .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
          .slice(0, 5)
      : [];

    await logAiUsage({
      userId: input.userId,
      provider: result.provider,
      model: result.model,
      purpose: "homework_review",
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      success: true,
    });

    return {
      score: clampScore(parsed.score, input.maxScore),
      summary:
        typeof parsed.summary === "string" && parsed.summary.trim().length > 0
          ? parsed.summary.trim()
          : "Javob tekshirildi.",
      suggestions:
        suggestions.length > 0
          ? suggestions
          : ["Vazifalar ro'yxatini yana bir bor ko'rib chiqing.", "Kodni GitHub'ga yuklab qo'ying."],
      provider: result.provider,
      model: result.model,
    };
  } catch (error) {
    await logAiUsage({
      userId: input.userId,
      provider: provider.name,
      model: env.AI_MODEL,
      purpose: "homework_review",
      promptTokens: 0,
      completionTokens: 0,
      success: false,
      error: error instanceof Error ? error.name : "unknown",
    });

    if (error instanceof AiProviderError) {
      return fallbackHomeworkReview(input.content, input.maxScore);
    }
    throw error;
  }
}

export async function generateLessonScript(input: {
  lessonId: string;
  actorId: string;
  approve?: boolean;
}): Promise<{ scriptId: string; version: number }> {
  const lesson = await db.lesson.findUnique({
    where: { id: input.lessonId },
    include: { course: true, scripts: { select: { version: true } } },
  });
  if (!lesson) {
    throw new AppError("NOT_FOUND", "Dars topilmadi.");
  }

  const settings = await getSettings();
  const env = getEnv();
  await assertMonthlyBudget(settings?.monthlyTokenLimit ?? env.AI_MONTHLY_TOKEN_LIMIT);

  const provider = getAiProvider();
  const messages = buildLessonGenerationMessages({
    lessonTitle: lesson.title,
    summary: lesson.summary,
    courseTitle: lesson.course.title,
    level: lesson.course.level,
  });

  let parsed: LessonScript;
  try {
    const result = await provider.complete({
      messages,
      temperature: settings?.aiTemperature ?? 0.4,
      maxTokens: 8_000,
      json: true,
    });
    parsed = lessonScriptSchema.parse(
      normalizeLessonScript(extractJson(result.text), {
        title: lesson.title,
        summary: lesson.summary,
        level: lesson.course.level,
      }),
    );
    await logAiUsage({
      userId: input.actorId,
      provider: result.provider,
      model: result.model,
      purpose: "lesson_generation",
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      success: true,
    });
  } catch (error) {
    await logAiUsage({
      userId: input.actorId,
      provider: provider.name,
      model: env.AI_MODEL,
      purpose: "lesson_generation",
      promptTokens: 0,
      completionTokens: 0,
      success: false,
      error: error instanceof Error ? error.name : "unknown",
    });
    parsed = normalizeLessonScript(
      {},
      {
        title: lesson.title,
        summary: lesson.summary,
        level: lesson.course.level,
      },
    );
  }

  const nextVersion =
    lesson.scripts.reduce((max, script) => Math.max(max, script.version), 0) + 1;

  const created = await db.lessonScript.create({
    data: {
      lessonId: lesson.id,
      version: nextVersion,
      status: input.approve ? "APPROVED" : "DRAFT",
      content: parsed,
      createdById: input.actorId,
      approvedById: input.approve ? input.actorId : null,
      approvedAt: input.approve ? new Date() : null,
    },
    select: { id: true, version: true },
  });

  return { scriptId: created.id, version: created.version };
}
