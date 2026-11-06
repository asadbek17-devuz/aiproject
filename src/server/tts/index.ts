import { getEnv } from "@/server/env";
import { EdgeTtsProvider } from "@/server/tts/edge-tts.provider";
import type { TtsProvider, TtsVoice } from "@/server/tts/provider.interface";

export function getTtsProvider(): TtsProvider {
  // Azure Speech can be swapped in here without changing the UI or API route.
  return new EdgeTtsProvider();
}

export function getDefaultVoice(): TtsVoice {
  const configured = getEnv().TTS_VOICE;
  return configured === "uz-UZ-MadinaNeural" ? "uz-UZ-MadinaNeural" : "uz-UZ-SardorNeural";
}
