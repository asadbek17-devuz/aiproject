import { describe, expect, it } from "vitest";
import {
  METHODOLOGY,
  flattenLessonScript,
  lessonScriptSchema,
  type LessonScriptInput,
} from "@/server/ai/lesson-script.schema";

function validScript(): LessonScriptInput {
  return {
    title: "HTML asoslari",
    summary: "HTML hujjat tuzilishini amaliy misollar bilan o'rganamiz.",
    language: "uz",
    level: "BEGINNER",
    segments: METHODOLOGY.map((segment, index) => ({
      type: segment.type,
      title: segment.title,
      durationMin: segment.durationMin,
      steps: [
        {
          id: `step-${index}`,
          title: `${segment.title} bosqichi`,
          narration: "Bu bosqichda mavzuni sodda misol orqali tushuntiramiz.",
          boardActions: [],
        },
      ],
    })),
  };
}

describe("lessonScriptSchema", () => {
  it("accepts the six-segment methodology", () => {
    const parsed = lessonScriptSchema.parse(validScript());
    expect(parsed.segments).toHaveLength(6);
    expect(parsed.segments.map((segment) => segment.type)).toEqual(
      METHODOLOGY.map((segment) => segment.type),
    );
  });

  it("rejects a segment with the wrong duration", () => {
    const script = validScript();
    script.segments[1].durationMin = 10;
    const result = lessonScriptSchema.safeParse(script);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["segments", 1, "durationMin"]);
    }
  });

  it("rejects board actions with an unknown type", () => {
    const script = validScript();
    script.segments[0].steps[0].boardActions = [
      { type: "exercise", prompt: "Yozing" },
    ] as never;
    expect(lessonScriptSchema.safeParse(script).success).toBe(false);
  });

  it("stays backwards compatible with steps that omit the stage fields", () => {
    const parsed = lessonScriptSchema.parse(validScript());
    const step = parsed.segments[0].steps[0];
    expect(step.scene).toBe("teaching");
    expect(step.pose).toBe("explain");
    expect(step.expression).toBe("neutral");
    expect(step.lookAt).toBe("board");
    expect(step.focus).toBe(-1);
    expect(step.code).toBeUndefined();
  });

  it("accepts a coding step and fills code defaults", () => {
    const script = validScript();
    script.segments[2].steps[0] = {
      ...script.segments[2].steps[0],
      scene: "coding",
      pose: "point-board",
      expression: "smile",
      lookAt: "laptop",
      focus: 0,
      code: {
        file: "index.html",
        language: "html",
        content: "<h1>Salom</h1>",
      },
    };
    const parsed = lessonScriptSchema.parse(script);
    const code = parsed.segments[2].steps[0].code;
    expect(parsed.segments[2].steps[0].scene).toBe("coding");
    expect(code?.typing).toBe("type");
    expect(code?.highlightLines).toEqual([]);
    expect(code?.run).toBe(false);
  });

  it("rejects an unknown mentor pose", () => {
    const script = validScript() as unknown as {
      segments: Array<{ steps: Array<Record<string, unknown>> }>;
    };
    script.segments[0].steps[0].pose = "dance";
    expect(lessonScriptSchema.safeParse(script).success).toBe(false);
  });
});

describe("flattenLessonScript", () => {
  it("numbers steps across segments and keeps segment metadata", () => {
    const flat = flattenLessonScript(lessonScriptSchema.parse(validScript()));
    expect(flat.map((step) => step.stepIndex)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(flat[0]?.segmentType).toBe("intro");
    expect(flat[5]?.segmentType).toBe("wrapup");
  });
});
