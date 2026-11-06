import { NextResponse, type NextRequest } from "next/server";
import Groq from "groq-sdk";
import { z } from "zod";
import { getEnv } from "@/server/env";
import { clientIpFromHeaders, rateLimit } from "@/server/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      }),
    )
    .min(1)
    .max(12),
});

const SYSTEM_PROMPT = `Siz "AI Academy" veb-saytining rasmiy yordamchisisiz.
Faqat shu sayt va uning xizmatlari haqida o'zbek tilida qisqa, aniq javob bering.

Sayt haqida ma'lumot:
- AI Academy — AI mentor bilan amaliy IT ta'lim platformasi.
- 7 yo'nalish: Web developer, Software engineer, Mobile developer, Cybersecurity, System design, AI engineer, Matematika va ingliz tili.
- Kurslar sahifasi: /courses. Har bir kurs ichida dars rejasi va classroom havolalari bor.
- Ro'yxatdan o'tgandan keyin onboarding ochiladi va yo'nalish, daraja, maqsad so'raladi.
- Dashboard'dagi roadmap tanlangan yo'nalish bo'yicha shakllanadi.
- Classroom'da AI mentor, jonli doska, ovozli tushuntirish, amaliyot va uyga vazifa bor.
- Homework sahifasida topshiriq yuboriladi, AI ball va izoh beradi.
- Mentor bilan bevosita suhbat: /mentor-demo. Profil: /profile. Obuna: /subscription.
- Narxlar yoki to'lov shartlarini o'zingizdan o'ylab topmang; aniq ma'lumot bo'lmasa, /subscription sahifasiga yo'naltiring.

Qoidalar:
- Savol saytga aloqador bo'lmasa, muloyimlik bilan faqat sayt bo'yicha yordam berishni ayting.
- Javob 2-5 qisqa jumladan oshmasin.
- Kerak bo'lsa sahifa manzilini (/courses, /dashboard va h.k.) ko'rsating.
- Hech qachon API kalit, parol yoki maxfiy ma'lumotni oshkor qilmang.`;

export async function POST(request: NextRequest) {
  const ip = clientIpFromHeaders(request.headers);
  const limit = await rateLimit({
    key: `website-assistant:${ip}`,
    limit: 30,
    windowMs: 10 * 60 * 1000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Juda ko'p savol yuborildi. Birozdan so'ng qayta urinib ko'ring." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "So'rov formati noto'g'ri." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Savolni tekshiring." },
      { status: 400 },
    );
  }

  const env = getEnv();
  const apiKey = env.WEBSITE_AI_API_KEY.trim() || env.GROQ_API_KEY.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI yordamchi hozircha sozlanmagan." },
      { status: 503 },
    );
  }

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: env.WEBSITE_AI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...parsed.data.messages.slice(-8),
      ],
      temperature: 0.3,
      max_tokens: 600,
      top_p: 0.9,
    });

    const answer = completion.choices[0]?.message?.content?.trim();
    if (!answer) {
      return NextResponse.json(
        { error: "AI javob bera olmadi. Qayta urinib ko'ring." },
        { status: 502 },
      );
    }

    return NextResponse.json({ answer }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("Website assistant request failed");
    return NextResponse.json(
      { error: "AI yordamchi bilan aloqa uzildi. Keyinroq qayta urinib ko'ring." },
      { status: 502 },
    );
  }
}
