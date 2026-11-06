export type TypewriterStatus = "idle" | "typing" | "paused" | "complete";

export type TypewriterOptions = {
  text: string;
  durationMs: number;
  typing?: "type" | "instant";
  corrections?: boolean;
  seed?: number;
};

type TypingEvent =
  | { kind: "type"; char: string; weight: number; endTime: number }
  | { kind: "backspace"; weight: number; endTime: number };

const PUNCTUATION = new Set([".", "!", "?", ";", ":", ")", "}", "]", ">"]);
const SOFT_PUNCTUATION = new Set([",", "=", "+", "-", "(", "{", "[", "<"]);
const WORD_CHAR = /[\p{L}\p{N}_$]/u;

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function charWeight(char: string, previous: string, next: string): number {
  if (char === "\n") return 4.2;
  if (char === "\t") return 2.4;
  if (PUNCTUATION.has(char)) return 2.4;
  if (SOFT_PUNCTUATION.has(char)) return 1.65;
  if (char === " ") return 1.15;
  if (WORD_CHAR.test(previous) && WORD_CHAR.test(next)) return 0.58;
  if (WORD_CHAR.test(previous)) return 0.8;
  return 1;
}

function wrongKeyFor(char: string, random: () => number): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  if (/[a-z]/i.test(char)) {
    const index = alphabet.indexOf(char.toLowerCase());
    const offset = random() > 0.5 ? 1 : -1;
    return alphabet[(index + offset + alphabet.length) % alphabet.length] ?? char;
  }
  return char;
}

function buildEvents(
  text: string,
  durationMs: number,
  corrections: boolean,
  seed: number,
): { events: TypingEvent[]; totalWeight: number } {
  const random = mulberry32(seed);
  const raw: Array<{ kind: "type"; char: string; weight: number } | { kind: "backspace"; weight: number }> =
    [];

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const previous = text[index - 1] ?? "";
    const next = text[index + 1] ?? "";
    const weight = charWeight(char, previous, next);

    const canCorrect =
      corrections &&
      index > 1 &&
      index < text.length - 1 &&
      WORD_CHAR.test(char) &&
      WORD_CHAR.test(previous) &&
      random() < 0.045;

    if (canCorrect) {
      const wrong = wrongKeyFor(char, random);
      raw.push({ kind: "type", char: wrong, weight: weight * 0.9 });
      raw.push({ kind: "backspace", weight: 0.5 });
      raw.push({ kind: "type", char, weight });
    } else {
      raw.push({ kind: "type", char, weight });
    }
  }

  const totalWeight = raw.reduce((sum, event) => sum + event.weight, 0) || 1;
  const safeDuration = Math.max(600, durationMs);
  let cursor = 0;
  const events: TypingEvent[] = raw.map((event) => {
    cursor += (event.weight / totalWeight) * safeDuration;
    return { ...event, endTime: cursor } as TypingEvent;
  });

  return { events, totalWeight };
}

export class TypewriterController {
  private readonly events: TypingEvent[];
  private readonly durationMs: number;
  private readonly fullText: string;
  private pointer = 0;
  private rendered = "";
  private baseTime = 0;
  private elapsed = 0;
  private paused = false;
  private currentStatus: TypewriterStatus = "idle";

  constructor(options: TypewriterOptions) {
    this.fullText = options.text;
    const safeDuration = Math.max(600, options.durationMs);
    this.durationMs = safeDuration;

    if (options.typing === "instant" || options.text.length === 0) {
      this.events = [];
      this.rendered = options.text;
      this.elapsed = safeDuration;
      this.currentStatus = "complete";
      return;
    }

    const { events } = buildEvents(
      options.text,
      safeDuration,
      options.corrections ?? false,
      options.seed ?? 7,
    );
    this.events = events;
  }

  get status(): TypewriterStatus {
    return this.currentStatus;
  }

  get visibleText(): string {
    return this.rendered;
  }

  get text(): string {
    return this.fullText;
  }

  get progress(): number {
    if (this.currentStatus === "complete") return 1;
    return Math.min(1, Math.max(0, this.elapsed / this.durationMs));
  }

  get activeLine(): number {
    let line = 1;
    for (let index = 0; index < this.rendered.length; index += 1) {
      if (this.rendered[index] === "\n") line += 1;
    }
    return line;
  }

  get totalLines(): number {
    return this.fullText.split("\n").length;
  }

  get activeColumn(): number {
    const lastBreak = this.rendered.lastIndexOf("\n");
    return this.rendered.length - lastBreak;
  }

  start(now: number): void {
    if (this.currentStatus === "complete") return;
    this.baseTime = now;
    this.elapsed = 0;
    this.paused = false;
    this.currentStatus = "typing";
  }

  update(now: number): string {
    if (this.currentStatus === "idle") {
      this.start(now);
    }
    if (this.currentStatus !== "typing" || this.paused) {
      return this.rendered;
    }

    const elapsed = Math.min(this.durationMs, now - this.baseTime);
    this.elapsed = elapsed;

    while (this.pointer < this.events.length) {
      const event = this.events[this.pointer];
      if (!event || event.endTime > elapsed) break;
      if (event.kind === "type") {
        this.rendered += event.char;
      } else {
        this.rendered = this.rendered.slice(0, -1);
      }
      this.pointer += 1;
    }

    if (elapsed >= this.durationMs || this.pointer >= this.events.length) {
      this.complete();
    }

    return this.rendered;
  }

  pause(now: number): void {
    if (this.currentStatus !== "typing") return;
    this.update(now);
    if (this.pointer >= this.events.length) return;
    this.paused = true;
    this.currentStatus = "paused";
  }

  resume(now: number): void {
    if (this.currentStatus === "complete") return;
    this.baseTime = now - this.elapsed;
    this.paused = false;
    this.currentStatus = "typing";
  }

  skip(): string {
    this.complete();
    return this.rendered;
  }

  private complete(): void {
    this.rendered = this.fullText;
    this.pointer = this.events.length;
    this.elapsed = this.durationMs;
    this.paused = false;
    this.currentStatus = "complete";
  }
}

export function estimateSpeechDurationMs(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const punctuation = (text.match(/[.,!?;:]/g) ?? []).length;
  return Math.max(2200, words * 360 + punctuation * 120);
}
