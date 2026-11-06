import { describe, expect, it } from "vitest";
import { naturalizeMentorAnswer } from "@/server/ai/spoken";

describe("naturalizeMentorAnswer", () => {
  it("removes markdown scaffolding so the answer reads like speech", () => {
    const text = "## HTML nima?\n\n- **HTML** — sahifa skeleti.\n- U matn va rasmlarni belgilaydi.\n\n\nKeyingi savol: tayyormisiz?";

    expect(naturalizeMentorAnswer(text)).toBe(
      "HTML nima?\n\nHTML — sahifa skeleti.\nU matn va rasmlarni belgilaydi.\n\nKeyingi savol: tayyormisiz?",
    );
  });

  it("keeps code fences intact for the speech normalizer", () => {
    const text = "Mana namuna:\n```html\n<p>Salom</p>\n```\nEndi o'zingiz yozib ko'ring.";

    expect(naturalizeMentorAnswer(text)).toContain("```html");
  });
});
