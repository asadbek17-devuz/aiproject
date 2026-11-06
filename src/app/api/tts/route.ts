import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/server/auth/session";
import { rateLimit, clientIpFromHeaders } from "@/server/security/rate-limit";
import { readTtsCache, ttsCacheKey, writeTtsCache } from "@/server/tts/cache";
import { getDefaultVoice, getTtsProvider } from "@/server/tts";
import {
  TTS_STYLES,
  TTS_VOICES,
  TtsProviderError,
  type TtsStyle,
} from "@/server/tts/provider.interface";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ttsSchema = z.object({
  text: z.string().trim().min(1, "Matn bo'sh.").max(3000, "Matn juda uzun."),
  voice: z.enum(TTS_VOICES).optional(),
  style: z.enum(TTS_STYLES).optional(),
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
  const userLimit = await rateLimit({
    key: `tts:user:${user.id}`,
    limit: 30,
    windowMs: 60 * 1000,
  });
  const ipLimit = await rateLimit({
    key: `tts:ip:${ip}`,
    limit: 60,
    windowMs: 60 * 1000,
  });

  if (!userLimit.allowed || !ipLimit.allowed) {
    const retryAfter = Math.max(userLimit.retryAfterSec, ipLimit.retryAfterSec);
    return NextResponse.json(
      { error: "Ovoz so'rovlari juda ko'p. Birozdan so'ng qayta urinib ko'ring.", code: "RATE_LIMITED" },
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

  const parsed = ttsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Matnni tekshiring.", code: "VALIDATION" },
      { status: 400 },
    );
  }

  const text = parsed.data.text.replace(/\s+/g, " ").trim();
  const voice = parsed.data.voice ?? getDefaultVoice();
  const style: TtsStyle = parsed.data.style ?? "mentor";
  const key = ttsCacheKey(text, voice, style);

  try {
    const cached = await readTtsCache(key);
    if (cached) {
      return new NextResponse(new Uint8Array(cached), {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": String(cached.byteLength),
          "Cache-Control": "private, max-age=86400",
          "X-TTS-Cache": "HIT",
          "X-TTS-Style": style,
        },
      });
    }

    const result = await getTtsProvider().synthesize(text, voice, { style });
    await writeTtsCache(key, result.audio).catch(() => undefined);

    return new NextResponse(new Uint8Array(result.audio), {
      status: 200,
      headers: {
        "Content-Type": result.mimeType,
        "Content-Length": String(result.audio.byteLength),
        "Cache-Control": "private, max-age=86400",
        "X-TTS-Cache": "MISS",
        "X-TTS-Style": style,
      },
    });
  } catch (error) {
    console.error("TTS failed:", error instanceof TtsProviderError ? error.name : "unknown");
    return NextResponse.json(
      {
        error: "Ovozni yaratib bo'lmadi. Birozdan so'ng qayta urinib ko'ring.",
        code: "TTS_UNAVAILABLE",
      },
      { status: 503 },
    );
  }
}
