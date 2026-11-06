import {
  CODE_LANGUAGES,
  METHODOLOGY,
  MENTOR_EXPRESSIONS,
  MENTOR_LOOK_ATS,
  MENTOR_POSES,
  MENTOR_SCENES,
  TYPING_MODES,
  type BoardAction,
  type LessonScript,
  type LessonStep,
  type SegmentType,
} from "@/server/ai/lesson-script.schema";

type AnyRecord = Record<string, unknown>;

function record(value: unknown): AnyRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as AnyRecord)
    : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function short(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}

function int(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  if (typeof value === "string") {
    const parsed = Number.parseInt(value.replace(/[^\d-]/g, ""), 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function oneOf<T extends readonly string[]>(
  value: unknown,
  values: T,
  fallback: T[number],
): T[number] {
  return typeof value === "string" && (values as readonly string[]).includes(value)
    ? (value as T[number])
    : fallback;
}

function lines(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => int(item, 0))
    .filter((item) => item > 0)
    .slice(0, 60);
}

function values(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const item = record(value);
  return item ? Object.values(item) : [];
}

const SEGMENT_ALIASES: Record<string, SegmentType> = {
  intro: "intro",
  introduction: "intro",
  kirish: "intro",
  start: "intro",
  explain: "explain",
  explanation: "explain",
  theory: "explain",
  nazariya: "explain",
  demo: "demo",
  demonstration: "demo",
  example: "demo",
  namuna: "demo",
  practice: "practice",
  practical: "practice",
  amaliyot: "practice",
  exercise: "practice",
  reinforce: "reinforce",
  reinforcement: "reinforce",
  mustahkamlash: "reinforce",
  review: "reinforce",
  wrapup: "wrapup",
  summary: "wrapup",
  conclusion: "wrapup",
  xulosa: "wrapup",
  savoljavob: "wrapup",
};

function segmentTypeOf(value: unknown): SegmentType | null {
  const label = text(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return label ? (SEGMENT_ALIASES[label] ?? null) : null;
}

function stepsOf(value: unknown): unknown[] {
  const item = record(value);
  if (!item) return [];
  for (const key of ["steps", "scenes", "items", "parts"]) {
    const entries = values(item[key]);
    if (entries.length > 0) return entries;
  }
  const singleStep = record(item.step);
  if (singleStep) return [singleStep];
  if (
    item.narration ||
    item.speech ||
    item.explanation ||
    item.boardActions ||
    item.board_actions
  ) {
    return [item];
  }
  return [];
}

function normalizeBoardAction(raw: unknown): BoardAction | null {
  const item = record(raw);
  if (!item) return null;
  const type = text(item.type)?.toLowerCase();
  const content = text(item.content);
  const directText = text(item.text);
  const caption = text(item.caption);

  if (type === "heading") {
    const value = directText ?? content;
    return value ? { type: "heading", text: short(value, 200) } : null;
  }
  if (type === "text" || type === "paragraph") {
    const value = directText ?? content;
    return value ? { type: "text", text: short(value, 2000) } : null;
  }
  if (type === "note" || type === "tip" || type === "warning") {
    const value = directText ?? content;
    if (!value) return null;
    return {
      type: "note",
      text: short(value, 1000),
      tone: type === "tip" ? "tip" : type === "warning" ? "warning" : "info",
    };
  }
  if (type === "code") {
    const value = text(item.code) ?? content;
    if (!value) return null;
    return {
      type: "code",
      language: oneOf(item.language, CODE_LANGUAGES, "html"),
      code: short(value, 4000),
      highlightLines: lines(item.highlightLines).slice(0, 30),
      ...(caption ? { caption: short(caption, 300) } : {}),
    };
  }
  if (type === "diagram" || type === "mermaid") {
    const value = text(item.mermaid) ?? content;
    if (!value) return null;
    return {
      type: "diagram",
      mermaid: short(value, 3000),
      ...(caption ? { caption: short(caption, 300) } : {}),
    };
  }
  if (type === "table") {
    const headers = Array.isArray(item.headers)
      ? item.headers.map((entry) => text(entry)).filter((entry): entry is string => Boolean(entry))
      : [];
    const rows = Array.isArray(item.rows)
      ? item.rows
          .map((row) =>
            Array.isArray(row)
              ? row.map((entry) => text(entry) ?? "").slice(0, 6)
              : [],
          )
          .filter((row) => row.length > 0)
      : [];
    if (headers.length === 0 || rows.length === 0) return null;
    return {
      type: "table",
      headers: headers.slice(0, 6).map((header) => short(header, 80)),
      rows: rows.slice(0, 20).map((row) => row.map((cell) => short(cell, 300))),
      ...(caption ? { caption: short(caption, 300) } : {}),
    };
  }

  return null;
}

function normalizeCode(raw: unknown): LessonStep["code"] | undefined {
  const item = record(raw);
  if (!item) return undefined;
  const content = text(item.content) ?? text(item.code);
  if (!content) return undefined;
  return {
    file: short(text(item.file) ?? "index.html", 120),
    language: oneOf(item.language, CODE_LANGUAGES, "html"),
    content: short(content, 12000),
    typing: oneOf(item.typing, TYPING_MODES, "type"),
    highlightLines: lines(item.highlightLines),
    run: item.run === true,
  };
}

function normalizeExercise(raw: unknown): LessonStep["exercise"] | undefined {
  const item = record(raw);
  if (!item) return undefined;
  const prompt = text(item.prompt) ?? text(item.task) ?? text(item.content);
  if (!prompt) return undefined;
  const hints = Array.isArray(item.hints)
    ? item.hints.map((hint) => text(hint)).filter((hint): hint is string => Boolean(hint))
    : [];
  return {
    prompt: short(prompt, 1000),
    ...(text(item.starterCode) ? { starterCode: short(String(item.starterCode), 4000) } : {}),
    language: oneOf(item.language, CODE_LANGUAGES, "html"),
    expectedKeywords: Array.isArray(item.expectedKeywords)
      ? item.expectedKeywords
          .map((keyword) => text(keyword))
          .filter((keyword): keyword is string => Boolean(keyword))
          .slice(0, 12)
          .map((keyword) => short(keyword, 80))
      : [],
    hints:
      hints.length > 0
        ? hints.slice(0, 3).map((hint) => short(hint, 500))
        : ["Kodni kichik qadamlarga bo'lib yozib ko'ring.", "Xato chiqsa, konsol xabarini o'qing."],
    ...(text(item.solution) ? { solution: short(String(item.solution), 4000) } : {}),
  };
}

const fallbackNarration: Record<SegmentType, (title: string, summary: string) => string> = {
  intro: (title, summary) =>
    `Bugun "${title}" mavzusini o'rganamiz. ${summary} Avval maqsadni belgilab olamiz, keyin asta-sekin amaliyotga o'tamiz. Tayyormisiz?`,
  explain: (title, summary) =>
    `Endi "${title}" mavzusining asosiy tushunchasini ko'ramiz. ${summary} Bu qismda sabab va mexanizmni birga ochamiz.`,
  demo: (title) =>
    `Keling, "${title}" bo'yicha jonli namunani ko'ramiz. Ekrandagi qadamlarga e'tibor bering va har bir qatordan keyin o'zingizga savol bering.`,
  practice: (title) =>
    `Endi navbat sizda. "${title}" bo'yicha kichik topshiriqni mustaqil bajaring. Xato qilsangiz ham davom eting, men ishora beraman.`,
  reinforce: (title) =>
    `Keling, o'rganganlarimizni mustahkamlaymiz. "${title}" bo'yicha asosiy fikrlarni takrorlaymiz va tipik xatoni tahlil qilamiz.`,
  wrapup: (title) =>
    `Bugungi darsni yakunlaymiz. "${title}" bo'yicha asosiy g'oyalarni eslab qoldik. Endi uyga vazifani bajaring va savollaringizni yozib qo'ying.`,
};

function fallbackStep(
  segmentType: SegmentType,
  index: number,
  title: string,
  summary: string,
): LessonStep {
  const meta = METHODOLOGY[index];
  const narration = fallbackNarration[segmentType](title, summary);
  const boardActions: BoardAction[] = [
    { type: "heading", text: short(`${meta.title}: ${title}`, 200) },
    { type: "text", text: short(narration, 2000) },
    { type: "note", text: short(meta.goal, 1000), tone: "info" },
  ];

  return {
    id: `${segmentType}-${index + 1}`,
    title: short(meta.title, 160),
    narration: short(narration, 2000),
    boardActions,
    scene: "teaching",
    pose: "explain",
    expression: "neutral",
    lookAt: "board",
    focus: -1,
  };
}

function normalizeStep(
  raw: unknown,
  segmentType: SegmentType,
  segmentIndex: number,
  stepIndex: number,
  lessonTitle: string,
  summary: string,
): LessonStep {
  let item = record(raw);
  if (item && !item.narration && !item.boardActions && record(item.step)) {
    item = record(item.step);
  }
  if (!item) {
    return fallbackStep(segmentType, segmentIndex, lessonTitle, summary);
  }

  const rawBoardActions = [
    ...values(item.boardActions),
    ...values(item.board_actions),
    ...values(item.actions),
  ];
  const boardActions = rawBoardActions
    .map(normalizeBoardAction)
    .filter((action): action is BoardAction => Boolean(action))
    .slice(0, 12);

  const heading = boardActions.find((action) => action.type === "heading");
  const title =
    text(item.title) ??
    (heading && heading.type === "heading" ? heading.text : null) ??
    `${METHODOLOGY[segmentIndex].title} — ${stepIndex + 1}-qadam`;

  let narration =
    text(item.narration) ??
    text(item.speech) ??
    text(item.explanation) ??
    text(item.content) ??
    summary;
  if (narration.length < 10) {
    narration = `${narration} Keling, bu fikrni misol bilan ko'ramiz.`;
  }

  const codeBoardAction = boardActions.find((action) => action.type === "code");
  const code =
    normalizeCode(item.code) ??
    (codeBoardAction && codeBoardAction.type === "code"
      ? {
          file: codeBoardAction.language === "javascript" ? "script.js" : "index.html",
          language: codeBoardAction.language,
          content: codeBoardAction.code,
          typing: "type" as const,
          highlightLines: codeBoardAction.highlightLines,
          run: true,
        }
      : undefined);

  if (boardActions.length === 0) {
    boardActions.push({
      type: "text",
      text: short(narration, 2000),
    });
  }

  const focusValue = int(item.focus, -1);
  const exercise = normalizeExercise(item.exercise);

  return {
    id: short(text(item.id) ?? `${segmentType}-${segmentIndex + 1}-${stepIndex + 1}`, 80),
    title: short(title, 160),
    narration: short(narration, 2000),
    boardActions,
    ...(exercise ? { exercise } : {}),
    scene: oneOf(item.scene, MENTOR_SCENES, "teaching"),
    pose: oneOf(item.pose, MENTOR_POSES, "explain"),
    expression: oneOf(item.expression, MENTOR_EXPRESSIONS, "neutral"),
    lookAt: oneOf(item.lookAt, MENTOR_LOOK_ATS, "board"),
    focus: Math.min(11, Math.max(-1, focusValue)),
    ...(code ? { code } : {}),
  };
}

export function normalizeLessonScript(
  raw: unknown,
  fallback: {
    title: string;
    summary: string;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  },
): LessonScript {
  let root = record(raw);
  for (const key of ["script", "lessonScript", "data", "result"]) {
    const nested = record(root?.[key]);
    if (nested && (nested.segments || nested.sections || nested.steps)) {
      root = nested;
      break;
    }
  }

  const rawSegments = [
    ...values(root?.segments),
    ...values(root?.sections),
    ...values(root?.chapters),
    ...values(root?.blocks),
  ];
  const title = short(text(root?.lesson) ?? text(root?.title) ?? fallback.title, 160);
  const summary = short(text(root?.summary) ?? fallback.summary, 600);

  const segments = METHODOLOGY.map((expected, index) => {
    const candidate =
      rawSegments.find((segment) => {
        const item = record(segment);
        return segmentTypeOf(item?.type) === expected.type ||
          segmentTypeOf(item?.name) === expected.type;
      }) ?? rawSegments[index];
    const rawSteps = stepsOf(candidate);
    const steps =
      rawSteps.length > 0
        ? rawSteps
            .slice(0, 10)
            .map((step, stepIndex) =>
              normalizeStep(step, expected.type, index, stepIndex, title, summary),
            )
        : [fallbackStep(expected.type, index, title, summary)];

    return {
      type: expected.type,
      title: expected.title,
      durationMin: expected.durationMin,
      steps,
    };
  });

  return {
    title,
    summary,
    language: "uz",
    level: fallback.level,
    segments,
  };
}
