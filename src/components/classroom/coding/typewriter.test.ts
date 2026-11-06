import { describe, expect, it } from "vitest";
import { TypewriterController, estimateSpeechDurationMs } from "./typewriter";

const SAMPLE = "const ism = 'Aziza';\nconsole.log(ism);";

describe("TypewriterController", () => {
  it("completes immediately in instant mode", () => {
    const controller = new TypewriterController({
      text: SAMPLE,
      durationMs: 3000,
      typing: "instant",
    });
    expect(controller.status).toBe("complete");
    expect(controller.visibleText).toBe(SAMPLE);
    expect(controller.progress).toBe(1);
  });

  it("reveals characters progressively over the requested duration", () => {
    const controller = new TypewriterController({ text: SAMPLE, durationMs: 2000 });
    controller.start(0);

    expect(controller.update(0)).toBe("");
    const middle = controller.update(1000);
    expect(middle.length).toBeGreaterThan(0);
    expect(middle.length).toBeLessThan(SAMPLE.length);
    expect(controller.status).toBe("typing");

    expect(controller.update(2500)).toBe(SAMPLE);
    expect(controller.status).toBe("complete");
    expect(controller.progress).toBe(1);
  });

  it("skips straight to the full text", () => {
    const controller = new TypewriterController({ text: SAMPLE, durationMs: 10_000 });
    controller.start(0);
    controller.update(100);
    expect(controller.skip()).toBe(SAMPLE);
    expect(controller.status).toBe("complete");
  });

  it("freezes while paused and resumes from the same character", () => {
    const controller = new TypewriterController({ text: SAMPLE, durationMs: 3000 });
    controller.start(0);
    const beforePause = controller.update(900);
    controller.pause(900);

    expect(controller.status).toBe("paused");
    expect(controller.update(50_000)).toBe(beforePause);

    controller.resume(50_000);
    const afterResume = controller.update(50_400);
    expect(afterResume.length).toBeGreaterThanOrEqual(beforePause.length);
    expect(controller.update(60_000)).toBe(SAMPLE);
  });

  it("spends more time on newlines and punctuation than inside words", () => {
    const plain = new TypewriterController({ text: "abcd", durationMs: 2000 });
    const broken = new TypewriterController({ text: "a\nbcd", durationMs: 2000 });
    plain.start(0);
    broken.start(0);

    const plainHalf = plain.update(1500);
    const brokenHalf = broken.update(1500);
    expect(brokenHalf.length).toBeLessThan(plainHalf.length);
  });

  it("keeps progress monotonic", () => {
    const controller = new TypewriterController({ text: SAMPLE, durationMs: 1200 });
    controller.start(0);
    let previous = 0;
    for (let time = 0; time <= 1600; time += 50) {
      controller.update(time);
      expect(controller.progress).toBeGreaterThanOrEqual(previous);
      previous = controller.progress;
    }
  });

  it("estimates a positive speech duration", () => {
    expect(estimateSpeechDurationMs("Salom, bugun HTML o'rganamiz.")).toBeGreaterThan(2000);
  });
});
