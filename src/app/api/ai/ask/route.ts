import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/server/auth/session";
import { publicError } from "@/server/errors";
import { rateLimit, clientIpFromHeaders } from "@/server/security/rate-limit";
import { askMentor } from "@/server/ai/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const askSchema = z.object({
  lessonId: z.string().trim().min(1).max(64),
  stepIndex: z.coerce.number().int().min(0).max(200).default(0),
  question: z.string().trim().min(2, "Savol juda qisqa.").max(1000, "Savol juda uzun."),
  intent: z.enum(["question", "deep_dive"]).default("question"),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Avtorizatsiya talab qilinadi.", code: "UNAUTHORIZED" },
      { status: 401 },
    );
  }

  const ip = clientIpFromHeaders(request.headers);
  const ipLimit = await rateLimit({
    key: `ai:ask:ip:${ip}`,
    limit: 40,
    windowMs: 60 * 60 * 1000,
  });
  const userLimit = await rateLimit({
    key: `ai:ask:user:${user.id}`,
    limit: 15,
    windowMs: 60 * 1000,
  });

  if (!ipLimit.allowed || !userLimit.allowed) {
    const retryAfter = Math.max(ipLimit.retryAfterSec, userLimit.retryAfterSec);
    return NextResponse.json(
      {
        error: "Juda ko'p savol yuborildi. Birozdan so'ng qayta urinib ko'ring.",
        code: "RATE_LIMITED",
      },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "So'rov formati noto'g'ri.", code: "VALIDATION" },
      { status: 400 },
    );
  }

  const parsed = askSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ma'lumotlarni tekshiring.", code: "VALIDATION" },
      { status: 400 },
    );
  }

  try {
    const result = await askMentor({
      userId: user.id,
      lessonId: parsed.data.lessonId,
      stepIndex: parsed.data.stepIndex,
      question: parsed.data.question,
      adaptiveLevel: user.adaptiveLevel,
      intent: parsed.data.intent,
    });

    return NextResponse.json(
      {
        answer: result.answer,
        provider: result.provider,
        model: result.model,
        stepTitle: result.stepTitle,
        segmentType: result.segmentType,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("AI ask failed:", error instanceof Error ? error.name : "unknown");
    const info = publicError(error);
    return NextResponse.json({ error: info.message, code: info.code }, { status: info.status });
  }
}
