"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { uz } from "@/lib/i18n/uz";
import { db } from "@/server/db";
import { requireUser } from "@/server/auth/session";
import { reviewHomework } from "@/server/ai/service";

const submitSchema = z.object({
  homeworkId: z.string().trim().min(1),
  content: z
    .string()
    .trim()
    .max(20000)
    .nullish()
    .transform((value) => value ?? ""),
  link: z
    .string()
    .trim()
    .max(1000)
    .nullish()
    .transform((value) => value ?? ""),
});

export type HomeworkState = {
  error: string | null;
  success: boolean;
  review?: {
    score: number;
    maxScore: number;
    summary: string;
    suggestions: string[];
  } | null;
};

const MAX_TEXT_FILE = 256 * 1024;

function tasksFromJson(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  const items = (value as { items?: unknown }).items;
  if (!Array.isArray(items)) return [];
  return items.filter((item): item is string => typeof item === "string");
}

export async function submitHomeworkAction(
  _prev: HomeworkState,
  formData: FormData,
): Promise<HomeworkState> {
  const user = await requireUser();

  const parsed = submitSchema.safeParse({
    homeworkId: formData.get("homeworkId"),
    content: formData.get("content"),
    link: formData.get("link"),
  });

  if (!parsed.success) {
    return { error: uz.homework.error, success: false };
  }

  const homework = await db.homework.findFirst({
    where: { id: parsed.data.homeworkId, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      description: true,
      tasks: true,
      maxScore: true,
    },
  });

  if (!homework) {
    return { error: uz.homework.error, success: false };
  }

  const file = formData.get("file");
  let fileName: string | null = null;
  let fileMime: string | null = null;
  let fileSize: number | null = null;
  let fileContent = "";

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_TEXT_FILE) {
      return { error: "Fayl hajmi 256 KB dan oshmasligi kerak.", success: false };
    }
    fileName = file.name.slice(0, 200);
    fileMime = file.type || "application/octet-stream";
    fileSize = file.size;
    const isText =
      file.type.startsWith("text/") ||
      /\.(html|css|js|ts|tsx|jsx|json|md|txt)$/i.test(file.name);
    if (isText) {
      fileContent = await file.text();
    }
  }

  const content = [
    parsed.data.content,
    parsed.data.link ? `Havola: ${parsed.data.link}` : "",
    fileContent,
    fileName && !fileContent ? `[Fayl biriktirilgan: ${fileName} (${fileSize} bayt)]` : "",
  ]
    .filter((part) => part && part.trim().length > 0)
    .join("\n\n");

  if (content.trim().length < 2) {
    return { error: "Kod, javob yoki fayl biriktiring.", success: false };
  }

  try {
    const review = await reviewHomework({
      userId: user.id,
      homeworkTitle: homework.title,
      description: homework.description,
      tasks: tasksFromJson(homework.tasks),
      content,
      maxScore: homework.maxScore,
    });

    await db.homeworkSubmission.upsert({
      where: {
        homeworkId_studentId: {
          homeworkId: homework.id,
          studentId: user.id,
        },
      },
      create: {
        homeworkId: homework.id,
        studentId: user.id,
        content,
        fileName,
        fileMime,
        fileSize,
        status: "AI_REVIEWED",
        score: review.score,
        aiFeedback: {
          summary: review.summary,
          suggestions: review.suggestions,
        },
        reviewedAt: new Date(),
      },
      update: {
        content,
        fileName,
        fileMime,
        fileSize,
        status: "AI_REVIEWED",
        score: review.score,
        aiFeedback: {
          summary: review.summary,
          suggestions: review.suggestions,
        },
        reviewedAt: new Date(),
      },
      select: { id: true },
    });

    await db.notification.create({
      data: {
        userId: user.id,
        type: "HOMEWORK",
        title: "Uy ishi AI tomonidan tekshirildi",
        body: `"${homework.title}" uchun ball: ${review.score}/${homework.maxScore}.`,
        link: "/homework",
      },
    });

    revalidatePath("/homework");
    revalidatePath("/reputation");
    revalidatePath("/dashboard");

    return {
      error: null,
      success: true,
      review: {
        score: review.score,
        maxScore: homework.maxScore,
        summary: review.summary,
        suggestions: review.suggestions,
      },
    };
  } catch {
    console.error("submitHomeworkAction failed");
    return { error: uz.homework.error, success: false };
  }
}
