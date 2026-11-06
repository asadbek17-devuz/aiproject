import Groq from "groq-sdk";
import { getEnv } from "@/server/env";
import {
  AiProviderError,
  type AiCompletionRequest,
  type AiCompletionResult,
  type AiProviderClient,
} from "@/server/ai/provider.interface";
import { enforceInputTokenLimit } from "@/server/ai/token-limit";

export class GroqProvider implements AiProviderClient {
  readonly name = "GROQ" as const;
  private readonly client: Groq;

  constructor(apiKey: string) {
    this.client = new Groq({ apiKey });
  }

  async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
    enforceInputTokenLimit(request.messages);
    const model = request.model ?? getEnv().AI_MODEL;

    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const completion = await this.client.chat.completions.create({
          model,
          messages: request.messages,
          temperature: request.temperature ?? 0.4,
          max_tokens: request.maxTokens ?? 1_200,
          top_p: 0.9,
          frequency_penalty: 0.2,
          presence_penalty: 0.1,
          reasoning_effort: request.json ? "medium" : "low",
          response_format: request.json ? { type: "json_object" } : undefined,
        });

        const text = completion.choices[0]?.message?.content ?? "";
        if (!text.trim()) {
          throw new AiProviderError("Groq returned an empty response.");
        }

        return {
          text,
          provider: "GROQ",
          model,
          promptTokens: completion.usage?.prompt_tokens ?? 0,
          completionTokens: completion.usage?.completion_tokens ?? 0,
          totalTokens: completion.usage?.total_tokens ?? 0,
        };
      } catch (error) {
        lastError = error;
        if (error instanceof AiProviderError && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 700));
          continue;
        }
        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 700));
          continue;
        }
        break;
      }
    }

    const message =
      lastError instanceof Error && lastError.message.trim()
        ? `Groq request failed: ${lastError.message}`
        : "Groq request failed.";
    throw new AiProviderError(message, lastError);
  }
}
