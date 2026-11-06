import { describe, expect, it } from "vitest";
import { ttsCacheKey } from "@/server/tts/cache";

describe("ttsCacheKey", () => {
  it("is deterministic for the same text and voice", () => {
    expect(ttsCacheKey("Salom", "uz-UZ-SardorNeural")).toBe(
      ttsCacheKey("Salom", "uz-UZ-SardorNeural"),
    );
  });

  it("changes when the voice, style or text changes", () => {
    expect(ttsCacheKey("Salom", "uz-UZ-SardorNeural")).not.toBe(
      ttsCacheKey("Salom", "uz-UZ-MadinaNeural"),
    );
    expect(ttsCacheKey("Salom", "uz-UZ-SardorNeural")).not.toBe(
      ttsCacheKey("Salom", "uz-UZ-SardorNeural", "celebrate"),
    );
    expect(ttsCacheKey("Salom", "uz-UZ-SardorNeural")).not.toBe(
      ttsCacheKey("Xayr", "uz-UZ-SardorNeural"),
    );
  });
});
