import { describe, expect, it } from "vitest";
import { lessonScriptSchema } from "@/server/ai/lesson-script.schema";
import { normalizeLessonScript } from "@/server/ai/normalize-script";

const fallback = {
  title: "Xato xabarini o'qish",
  summary: "Error va warning farqini o'rganamiz.",
  level: "BEGINNER" as const,
};

describe("normalizeLessonScript", () => {
  it("maps aliased object segments and nested step collections", () => {
    const script = normalizeLessonScript(
      {
        lesson: "Xato xabarini o'qish",
        segments: {
          Introduction: {
            steps: [{ narration: "Kirish qismi batafsil matni shu yerda." }],
          },
          EXPLANATION: {
            steps: { first: { narration: "Tushuntirish qismi batafsil matni." } },
          },
          Demonstration: {
            narration: "Namuna segmenti to'g'ridan-to'g'ri matn bilan berildi.",
          },
          Practice: {
            scenes: [
              {
                narration: "Amaliyot qismi matni shu yerda.",
                exercise: { prompt: "Kichik topshiriqni bajaring." },
              },
            ],
          },
          Review: { items: [{ speech: "Mustahkamlash matni shu yerda." }] },
          "Wrap-up": { parts: [{ content: "Yakuniy qism matni shu yerda." }] },
        },
      },
      fallback,
    );

    expect(script.segments.map((segment) => segment.type)).toEqual([
      "intro",
      "explain",
      "demo",
      "practice",
      "reinforce",
      "wrapup",
    ]);
    expect(script.segments[0]?.steps[0]?.narration).toContain("Kirish qismi");
    expect(script.segments[1]?.steps[0]?.narration).toContain("Tushuntirish qismi");
    expect(script.segments[2]?.steps[0]?.narration).toContain("Namuna segmenti");
    expect(script.segments[3]?.steps[0]?.exercise?.prompt).toContain("topshiriqni");
    expect(lessonScriptSchema.safeParse(script).success).toBe(true);
  });

  it("creates distinct safety-net narration for every segment", () => {
    const script = normalizeLessonScript({}, fallback);
    const narrations = script.segments.map((segment) => segment.steps[0]?.narration);

    expect(new Set(narrations).size).toBe(6);
    expect(script.segments.map((segment) => segment.durationMin)).toEqual([
      3, 12, 5, 15, 5, 20,
    ]);
    expect(lessonScriptSchema.safeParse(script).success).toBe(true);
  });
});
