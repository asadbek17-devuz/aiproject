import type { AiMessage } from "@/server/ai/provider.interface";

export const DEFAULT_MAX_INPUT_TOKENS = 8_000;

export function approximateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function approximateMessageTokens(messages: AiMessage[]): number {
  return messages.reduce((total, message) => total + approximateTokens(message.content) + 4, 0);
}

export function enforceInputTokenLimit(
  messages: AiMessage[],
  limit: number = DEFAULT_MAX_INPUT_TOKENS,
): void {
  const tokens = approximateMessageTokens(messages);
  if (tokens > limit) {
    throw new Error(`Input token limit exceeded: ${tokens} > ${limit}`);
  }
}
