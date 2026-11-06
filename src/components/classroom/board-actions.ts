import type { BoardAction } from "@/server/ai/lesson-script.schema";

export const MAX_BOARD_ACTIONS = 4;

export function filterBoardActions(actions: BoardAction[]): BoardAction[] {
  return actions.filter((action) => !(action.type === "code" && action.language === "css"));
}

export function simplifyBoardActions(
  actions: BoardAction[],
  limit = MAX_BOARD_ACTIONS,
): BoardAction[] {
  return filterBoardActions(actions).slice(0, limit);
}
