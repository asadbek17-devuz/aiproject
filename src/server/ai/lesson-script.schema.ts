import { z } from "zod";

export const SEGMENT_TYPES = [
  "intro",
  "explain",
  "demo",
  "practice",
  "reinforce",
  "wrapup",
] as const;

export type SegmentType = (typeof SEGMENT_TYPES)[number];

export const METHODOLOGY = [
  {
    type: "intro",
    title: "Kirish",
    durationMin: 3,
    goal: "Maqsadni aytish va oldingi bilim bilan bog'lash.",
  },
  {
    type: "explain",
    title: "Nazariya",
    durationMin: 12,
    goal: "Asosiy tushunchani doskada bosqichma-bosqich ochish.",
  },
  {
    type: "demo",
    title: "Namuna",
    durationMin: 5,
    goal: "Jonli kod yozib, har bir qatorni izohlash.",
  },
  {
    type: "practice",
    title: "Amaliyot",
    durationMin: 15,
    goal: "Talaba saytning bir qismini mustaqil quradi, mentor ishora beradi.",
  },
  {
    type: "reinforce",
    title: "Mustahkamlash",
    durationMin: 5,
    goal: "Topshiriq, xato tahlili va takrorlash.",
  },
  {
    type: "wrapup",
    title: "Savol-javob va uyga vazifa",
    durationMin: 20,
    goal: "Savollarga javob, xulosa, uyga vazifa va keyingi darsga ko'prik.",
  },
] as const;

export const CODE_LANGUAGES = ["html", "css", "javascript", "bash", "json"] as const;

export const MENTOR_SCENES = ["teaching", "coding"] as const;
export const MENTOR_POSES = [
  "explain",
  "point-board",
  "think",
  "listen",
  "celebrate",
  "encourage",
] as const;
export const MENTOR_EXPRESSIONS = ["neutral", "smile", "curious", "concerned"] as const;
export const MENTOR_LOOK_ATS = ["board", "student", "laptop"] as const;
export const TYPING_MODES = ["type", "instant"] as const;

export type MentorScene = (typeof MENTOR_SCENES)[number];
export type MentorPose = (typeof MENTOR_POSES)[number];
export type MentorExpression = (typeof MENTOR_EXPRESSIONS)[number];
export type MentorLookAt = (typeof MENTOR_LOOK_ATS)[number];
export type TypingMode = (typeof TYPING_MODES)[number];

export const stepCodeSchema = z.object({
  file: z.string().min(1).max(120),
  language: z.enum(CODE_LANGUAGES),
  content: z.string().max(12000),
  typing: z.enum(TYPING_MODES).default("type"),
  highlightLines: z.array(z.number().int().min(1)).max(60).default([]),
  run: z.boolean().default(false),
});

export type StepCode = z.infer<typeof stepCodeSchema>;

export const boardActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("heading"),
    text: z.string().min(1).max(200),
  }),
  z.object({
    type: z.literal("text"),
    text: z.string().min(1).max(2000),
  }),
  z.object({
    type: z.literal("note"),
    text: z.string().min(1).max(1000),
    tone: z.enum(["info", "tip", "warning"]).default("info"),
  }),
  z.object({
    type: z.literal("code"),
    language: z.enum(CODE_LANGUAGES).default("html"),
    code: z.string().min(1).max(4000),
    highlightLines: z.array(z.number().int().min(1)).max(30).default([]),
    caption: z.string().max(300).optional(),
  }),
  z.object({
    type: z.literal("table"),
    headers: z.array(z.string().min(1).max(80)).min(1).max(6),
    rows: z.array(z.array(z.string().max(300))).min(1).max(20),
    caption: z.string().max(300).optional(),
  }),
  z.object({
    type: z.literal("diagram"),
    mermaid: z.string().min(1).max(3000),
    caption: z.string().max(300).optional(),
  }),
]);

export type BoardAction = z.infer<typeof boardActionSchema>;

export const exerciseSchema = z.object({
  prompt: z.string().min(1).max(1000),
  starterCode: z.string().max(4000).optional(),
  language: z.enum(CODE_LANGUAGES).default("html"),
  expectedKeywords: z.array(z.string().min(1).max(80)).max(12).default([]),
  hints: z.array(z.string().min(1).max(500)).min(1).max(3),
  solution: z.string().max(4000).optional(),
});

export type Exercise = z.infer<typeof exerciseSchema>;

export const lessonStepSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
  narration: z.string().min(10).max(2000),
  boardActions: z.array(boardActionSchema).max(12),
  exercise: exerciseSchema.optional(),
  scene: z.enum(MENTOR_SCENES).default("teaching"),
  pose: z.enum(MENTOR_POSES).default("explain"),
  expression: z.enum(MENTOR_EXPRESSIONS).default("neutral"),
  lookAt: z.enum(MENTOR_LOOK_ATS).default("board"),
  focus: z.number().int().min(-1).max(11).default(-1),
  code: stepCodeSchema.optional(),
});

export type LessonStep = z.infer<typeof lessonStepSchema>;

export const lessonSegmentSchema = z.object({
  type: z.enum(SEGMENT_TYPES),
  title: z.string().min(1).max(120),
  durationMin: z.number().int().min(1).max(30),
  steps: z.array(lessonStepSchema).min(1).max(10),
});

export type LessonSegment = z.infer<typeof lessonSegmentSchema>;

export const lessonScriptSchema = z
  .object({
    title: z.string().min(3).max(160),
    summary: z.string().min(10).max(600),
    language: z.literal("uz"),
    level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
    segments: z.array(lessonSegmentSchema).length(6),
  })
  .superRefine((value, ctx) => {
    METHODOLOGY.forEach((expected, index) => {
      const segment = value.segments[index];
      if (!segment) return;
      if (segment.type !== expected.type) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["segments", index, "type"],
          message: `Segment ${index + 1} "${expected.type}" bo'lishi kerak.`,
        });
      }
      if (segment.durationMin !== expected.durationMin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["segments", index, "durationMin"],
          message: `${expected.title} ${expected.durationMin} daqiqa bo'lishi kerak.`,
        });
      }
    });
  });

export type LessonScript = z.infer<typeof lessonScriptSchema>;
export type LessonScriptInput = z.input<typeof lessonScriptSchema>;

export type FlatLessonStep = LessonStep & {
  segmentType: SegmentType;
  segmentTitle: string;
  segmentDurationMin: number;
  stepIndex: number;
};

export function flattenLessonScript(script: LessonScript): FlatLessonStep[] {
  return script.segments.flatMap((segment) =>
    segment.steps.map((step) => ({
      ...step,
      segmentType: segment.type,
      segmentTitle: segment.title,
      segmentDurationMin: segment.durationMin,
      stepIndex: 0,
    })),
  ).map((step, index) => ({ ...step, stepIndex: index }));
}

export const LESSON_SCRIPT_JSON_INSTRUCTION =
  'LESSON_SCRIPT_JSON: Return ONLY a JSON object with keys title, summary, language ("uz"), level, segments (exactly 6). Segment types and durations must be intro 3, explain 12, demo 5, practice 15, reinforce 5, wrapup 20. The total is 60 minutes: 20 minutes theory, 20 minutes practice, 20 minutes Q&A and homework. Every step must also include scene ("teaching" | "coding"), pose ("explain" | "point-board" | "think" | "listen" | "celebrate" | "encourage"), expression ("neutral" | "smile" | "curious" | "concerned"), lookAt ("board" | "student" | "laptop"), focus (board item index, -1 when none). Coding scenes must include a code object with file, language, content, typing ("type" | "instant"), highlightLines, run.';
