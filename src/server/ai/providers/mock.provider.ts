import type { AiProvider } from "@prisma/client";
import { METHODOLOGY, type LessonScript } from "@/server/ai/lesson-script.schema";
import {
  type AiCompletionRequest,
  type AiCompletionResult,
  type AiProviderClient,
} from "@/server/ai/provider.interface";
import { approximateMessageTokens, approximateTokens } from "@/server/ai/token-limit";

function extractLine(text: string, prefix: string): string {
  const line = text
    .split("\n")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));
  return line?.slice(prefix.length).trim() ?? "";
}

function buildMockScript(messages: AiCompletionRequest["messages"]): LessonScript {
  const userText = messages.filter((m) => m.role === "user").map((m) => m.content).join("\n");
  const topic = extractLine(userText, "Dars:") || "Yangi mavzu";
  const course = extractLine(userText, "Kurs:") || "Web dasturlash asoslari";
  const levelRaw = extractLine(userText, "Daraja:").toUpperCase();
  const level: LessonScript["level"] =
    levelRaw === "INTERMEDIATE" || levelRaw === "ADVANCED" ? levelRaw : "BEGINNER";

  return {
    title: topic.slice(0, 150),
    summary: `${course} kursidagi "${topic}" mavzusi uchun demo dars skripti. Groq kaliti bo'lmaganda ham platforma ishlashi uchun generatsiya qilindi.`.slice(
      0,
      590,
    ),
    language: "uz",
    level,
    segments: METHODOLOGY.map((segment, index) => ({
      type: segment.type,
      title: segment.title,
      durationMin: segment.durationMin,
      steps: [
        {
          id: `mock-${segment.type}-1`,
          title: `${segment.title}: ${topic}`.slice(0, 150),
          narration: `Bu ${segment.title.toLowerCase()} bosqichi. Mavzu: ${topic}. ${segment.goal} Mentor bu bosqichda tushunchani sodda misol bilan ochib beradi va talabani amaliyotga tayyorlaydi.`,
          scene: index === 2 ? "coding" : "teaching",
          pose: index === 2 ? "point-board" : index === 4 ? "encourage" : "explain",
          expression: index === 4 ? "smile" : "neutral",
          lookAt: index === 2 ? "laptop" : index === 4 ? "student" : "board",
          focus: index === 0 ? 1 : -1,
          ...(index === 2
            ? {
                code: {
                  file: "index.html",
                  language: "html" as const,
                  content: '<h1>Demo dars</h1>\n<p>Mentor bilan birga yozamiz.</p>',
                  typing: "type" as const,
                  highlightLines: [1],
                  run: true,
                },
              }
            : {}),
          boardActions: [
            { type: "heading" as const, text: `${index + 1}. ${segment.title}` },
            {
              type: "text" as const,
              text: `${topic} — ${segment.goal}`,
            },
            ...(index === 2
              ? [
                  {
                    type: "code" as const,
                    language: "html" as const,
                    code: '<h1>Demo dars</h1>\n<p>Mentor bilan birga yozamiz.</p>',
                    highlightLines: [1],
                    caption: "demo.html",
                  },
                ]
              : []),
            ...(index === 5
              ? [
                  {
                    type: "note" as const,
                    text: "Keyingi darsda mavzuni davom ettiramiz.",
                    tone: "info" as const,
                  },
                ]
              : []),
          ],
          ...(segment.type === "practice" || segment.type === "reinforce"
            ? {
                exercise: {
                  prompt: `${topic} bo'yicha kichik mashq bajaring.`,
                  language: "html" as const,
                  expectedKeywords: [],
                  hints: [
                    "Avval mavzu bo'yicha asosiy tushunchani eslang.",
                    "Kodni kichik qadamlarga bo'lib yozing.",
                  ],
                },
              }
            : {}),
        },
      ],
    })),
  };
}

export class MockProvider implements AiProviderClient {
  readonly name: AiProvider = "MOCK";

  async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
    const system = request.messages.find((message) => message.role === "system")?.content ?? "";
    const userText = request.messages
      .filter((message) => message.role === "user")
      .map((message) => message.content)
      .join("\n");

    let text: string;

    if (system.includes("LESSON_SCRIPT_JSON") || userText.includes("JSON ko'rinishida")) {
      text = JSON.stringify(buildMockScript(request.messages));
    } else {
      const question = extractLine(userText, "Talaba savoli:") || "Savol";
      const step = extractLine(userText, "Joriy bosqich:") || "joriy bosqich";
      const deep = userText.includes("Rejim: chuqur tushuntirish");
      text = deep
        ? [
            `"${question}" bo'yicha chuqurroq ochib beraman.`,
            `Hozir "${step}" bosqichidamiz.`,
            "Sodda model: har bir teg — brauzerga berilgan buyruq; brauzer ularni o'qib, sahifa daraxtini quradi.",
            "Ichki mexanizm: ochilish tegi elementni boshlaydi, yopilish tegi uni tugatadi; noto'g'ri yopilgan element keyingi kontentni ham o'z ichiga olib ketadi.",
            "Hayotiy misol: uy qurishda har bir xona eshigi o'z joyida yopilishi kerak; bitta eshik ochiq qolsa, tartib buziladi.",
            "Tipik xato: `</p>` yozishni unutish yoki tegni noto'g'ri joyda yopish. Har safar kod yozgach, ochilish va yopilish teglarini sanang.",
            "Endi tekshirib ko'ring: sizningcha, yopilmagan teg brauzerda qanday ko'rinadi?",
          ].join(" ")
        : [
            `Savolingizni tushundim: "${question}".`,
            `Hozir "${step}" bosqichidamiz.`,
            "Avval kodning eng kichik qismini tekshiring: teglar yopilganmi, qo'shtirnoqlar juftmi?",
            "Keyin natijani brauzerda ochib ko'ring. Agar xato qolsa, aniq qatorni yuboring — birga tuzatamiz.",
          ].join(" ");
    }

    const promptTokens = approximateMessageTokens(request.messages);
    return {
      text,
      provider: "MOCK",
      model: "mock-mentor",
      promptTokens,
      completionTokens: approximateTokens(text),
      totalTokens: promptTokens + approximateTokens(text),
    };
  }
}
