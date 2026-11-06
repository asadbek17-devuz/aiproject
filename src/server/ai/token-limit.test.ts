import { describe, expect, it } from "vitest";
import {
  approximateTokens,
  enforceInputTokenLimit,
} from "@/server/ai/token-limit";

describe("token limit helpers", () => {
  it("approximates four characters per token", () => {
    expect(approximateTokens("a".repeat(40))).toBe(10);
  });

  it("throws when the estimated input exceeds the limit", () => {
    expect(() =>
      enforceInputTokenLimit([{ role: "user", content: "a".repeat(400) }], 50),
    ).toThrow(/Input token limit exceeded/);
  });

  it("allows input below the limit", () => {
    expect(() =>
      enforceInputTokenLimit([{ role: "user", content: "Salom" }], 50),
    ).not.toThrow();
  });
});
