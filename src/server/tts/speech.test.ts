import { describe, expect, it } from "vitest";
import { buildSpeechSegments, normalizeSpeechText } from "@/server/tts/speech";

describe("normalizeSpeechText", () => {
  it("strips markdown and replaces urls with a spoken label", () => {
    const text = normalizeSpeechText(
      "**Muhim:** `h1` tegi [MDN](https://developer.mozilla.org) saytida. 😊",
    );

    expect(text).toBe("Muhim: eych bir tegi MDN saytida.");
  });

  it("speaks code tags and attributes in Uzbek", () => {
    expect(normalizeSpeechText("`<a href=\"https://example.com\">` tegi")).toBe(
      "ochilish a tegi, eych ref atributi havola tegi.",
    );
  });

  it("normalizes Uzbek apostrophes and technical words for clearer speech", () => {
    expect(normalizeSpeechText("o'zbek g'ururi va browser layout")).toBe(
      "oʻzbek gʻururi va brauzer leyout.",
    );
  });

  it("adds terminal punctuation and normalizes line breaks", () => {
    expect(normalizeSpeechText("Birinchi qator\nIkkinchi qator")).toBe(
      "Birinchi qator. Ikkinchi qator.",
    );
  });

  it("reads numbers and percentages like a human", () => {
    expect(normalizeSpeechText("Bugun 20 daqiqa dars va 50% amaliyot.")).toBe(
      "Bugun yigirma daqiqa dars va ellik foiz amaliyot.",
    );
    expect(normalizeSpeechText("2024 yilda 3,5 ball")).toBe(
      "ikki ming yigirma toʻrt yilda uch butun besh ball.",
    );
  });

  it("keeps everyday words natural instead of spelling them out", () => {
    expect(normalizeSpeechText("biz birga o'rganamiz")).toBe("biz birga oʻrganamiz.");
  });

  it("returns an empty string for whitespace-only input", () => {
    expect(normalizeSpeechText("   \n  ")).toBe("");
  });
});

describe("buildSpeechSegments", () => {
  it("escapes xml and uses a question prosody", () => {
    const [ssml] = buildSpeechSegments("HTML & CSS nima?", "uz-UZ-SardorNeural");

    expect(ssml).toContain("eych ti em el va si es es nima?");
    expect(ssml).toContain('pitch="+4Hz"');
    expect(ssml).toContain('xml:lang="uz-UZ"');
  });

  it("packs two natural sentences into one prosody request", () => {
    const segments = buildSpeechSegments(
      "Bugun juda yaxshi ishladingiz va natija ko'rindi! Topshiriqni to'liq va xatosiz bajardingiz. Ertaga yangi mavzuni birga ko'ramiz.",
      "uz-UZ-SardorNeural",
      "celebrate",
    );

    expect(segments).toHaveLength(2);
    expect(segments[0]?.match(/<prosody/g)).toHaveLength(2);
    expect(segments[0]).toContain('pitch="+9Hz"');
    expect(segments[0]).toContain('pitch="+5Hz"');
    expect(segments[1]).toContain('pitch="+3Hz"');
  });
});
