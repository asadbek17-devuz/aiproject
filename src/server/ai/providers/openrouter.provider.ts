import { getEnv } from "@/server/env";
import {
  AiProviderError,
  type AiCompletionRequest,
  type AiCompletionResult,
  type AiProviderClient,
} from "@/server/ai/provider.interface";
import { enforceInputTokenLimit } from "@/server/ai/token-limit";

type OpenRouterContentPart = {
  type?: string;
  text?: string;
};

type OpenRouterContent = string | OpenRouterContentPart[] | null;

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: OpenRouterContent;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: {
    message?: string;
  };
};

function extractText(content: OpenRouterContent | undefined): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .filter(Boolean)
    .join("\n");
}

export class OpenRouterProvider implements AiProviderClient {
  readonly name = "OPENROUTER" as const;

  constructor(private readonly apiKey: string) {}

  async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
    enforceInputTokenLimit(request.messages);
    const model = request.model ?? getEnv().AI_MODEL;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-academy.uz",
          "X-Title": "AI Academy",
        },
        body: JSON.stringify({
          model,
          messages: request.messages,
          temperature: request.temperature ?? 0.4,
          max_tokens: request.maxTokens ?? 1_200,
          ...(request.json ? { response_format: { type: "json_object" } } : {}),
        }),
      });

      const payload = (await response.json().catch(() => null)) as OpenRouterResponse | null;
      if (!response.ok) {
        throw new AiProviderError(
          payload?.error?.message
            ? `OpenRouter request failed: ${payload.error.message}`
            : `OpenRouter request failed with status ${response.status}.`,
          payload,
        );
      }

      const text = extractText(payload?.choices?.[0]?.message?.content ?? null);
      if (!text.trim()) {
        throw new AiProviderError("OpenRouter returned an empty response.");
      }

      return {
        text: text.trim(),
        provider: "OPENROUTER",
        model,
        promptTokens: payload?.usage?.prompt_tokens ?? 0,
        completionTokens: payload?.usage?.completion_tokens ?? 0,
        totalTokens: payload?.usage?.total_tokens ?? 0,
      };
    } catch (error) {
      if (error instanceof AiProviderError) throw error;
      throw new AiProviderError("OpenRouter request failed.", error);
    }
  }
}
