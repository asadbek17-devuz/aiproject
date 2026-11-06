import { describe, expect, it } from "vitest";
import type { BoardAction } from "@/server/ai/lesson-script.schema";
import { filterBoardActions, simplifyBoardActions } from "@/components/classroom/board-actions";

const actions: BoardAction[] = [
  { type: "heading", text: "Birinchi uslub" },
  {
    type: "code",
    language: "css",
    code: "body { color: red; }",
    highlightLines: [1],
  },
  { type: "text", text: "HTML tuzilishi" },
  {
    type: "code",
    language: "html",
    code: "<h1>Salom</h1>",
    highlightLines: [1],
  },
  { type: "note", text: "Muhim eslatma", tone: "info" },
  { type: "note", text: "Yana bir eslatma", tone: "tip" },
];

describe("board action helpers", () => {
  it("removes CSS code blocks from the board", () => {
    const filtered = filterBoardActions(actions);

    expect(filtered).toHaveLength(5);
    expect(
      filtered.some((action) => action.type === "code" && action.language === "css"),
    ).toBe(false);
  });

  it("keeps the board focused by limiting the action count", () => {
    expect(simplifyBoardActions(actions)).toHaveLength(4);
    expect(simplifyBoardActions(actions, 2)).toHaveLength(2);
  });
});
