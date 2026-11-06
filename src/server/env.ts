import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  OPENROUTER_API_KEY: z.string().optional().default(""),
  GROQ_API_KEY: z.string().optional().default(""),
  WEBSITE_AI_API_KEY: z.string().optional().default(""),
  WEBSITE_AI_MODEL: z.string().default("openai/gpt-oss-120b"),
  AI_PROVIDER: z.enum(["openrouter", "groq", "mock"]).default("groq"),
  AI_MODEL: z.string().default("openai/gpt-oss-120b"),
  AI_MENTOR_MODEL: z.string().optional().default(""),
  AI_MONTHLY_TOKEN_LIMIT: z.coerce.number().int().positive().default(1_200_000),
  TTS_VOICE: z.string().default("uz-UZ-SardorNeural"),
  TTS_CACHE_DIR: z.string().default(".cache/tts"),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(30),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (!cached) {
    cached = envSchema.parse(process.env);
  }
  return cached;
}

export function hasOpenRouterKey(): boolean {
  return getEnv().OPENROUTER_API_KEY.trim().length > 0;
}

export function hasGroqKey(): boolean {
  return getEnv().GROQ_API_KEY.trim().length > 0;
}
