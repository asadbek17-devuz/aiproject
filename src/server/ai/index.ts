import { getEnv, hasGroqKey, hasOpenRouterKey } from "@/server/env";
import { GroqProvider } from "@/server/ai/providers/groq.provider";
import { OpenRouterProvider } from "@/server/ai/providers/openrouter.provider";
import { MockProvider } from "@/server/ai/providers/mock.provider";
import type { AiProviderClient } from "@/server/ai/provider.interface";

export function getAiProvider(): AiProviderClient {
  const env = getEnv();
  if (env.AI_PROVIDER === "mock") return new MockProvider();
  if (env.AI_PROVIDER === "openrouter" && hasOpenRouterKey()) {
    return new OpenRouterProvider(env.OPENROUTER_API_KEY);
  }
  if (env.AI_PROVIDER === "groq" && hasGroqKey()) {
    return new GroqProvider(env.GROQ_API_KEY);
  }
  if (hasOpenRouterKey()) return new OpenRouterProvider(env.OPENROUTER_API_KEY);
  if (hasGroqKey()) return new GroqProvider(env.GROQ_API_KEY);
  return new MockProvider();
}

export function aiProviderMode(): "OPENROUTER" | "GROQ" | "MOCK" {
  return getAiProvider().name;
}
