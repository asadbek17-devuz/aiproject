export type TtsSynthesisResult = {
  audio: Buffer;
  mimeType: string;
};

export const TTS_STYLES = ["mentor", "hint", "celebrate", "question"] as const;
export type TtsStyle = (typeof TTS_STYLES)[number];

export type TtsSynthesisOptions = {
  style?: TtsStyle;
};

export interface TtsProvider {
  readonly name: string;
  synthesize(
    text: string,
    voice: string,
    options?: TtsSynthesisOptions,
  ): Promise<TtsSynthesisResult>;
}

export class TtsProviderError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "TtsProviderError";
  }
}

export const TTS_VOICES = ["uz-UZ-SardorNeural", "uz-UZ-MadinaNeural"] as const;
export type TtsVoice = (typeof TTS_VOICES)[number];
