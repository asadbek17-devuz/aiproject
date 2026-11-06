import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import {
  TtsProviderError,
  type TtsProvider,
  type TtsSynthesisOptions,
  type TtsSynthesisResult,
} from "@/server/tts/provider.interface";
import { buildSpeechSegments } from "@/server/tts/speech";

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  run: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await run(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return results;
}

export class EdgeTtsProvider implements TtsProvider {
  readonly name = "edge-tts";

  async synthesize(
    text: string,
    voice: string,
    options?: TtsSynthesisOptions,
  ): Promise<TtsSynthesisResult> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await this.synthesizeOnce(text, voice, options);
      } catch (error) {
        lastError = error;
        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
      }
    }
    if (lastError instanceof TtsProviderError) throw lastError;
    throw new TtsProviderError("Edge TTS request failed.", lastError);
  }

  private async synthesizeOnce(
    text: string,
    voice: string,
    options?: TtsSynthesisOptions,
  ): Promise<TtsSynthesisResult> {
    const tts = new MsEdgeTTS({
      connectionTimeoutMs: 15_000,
      synthesisTimeoutMs: 45_000,
    });

    try {
      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

      // Edge accepts only two prosody nodes per request. We pack two natural
      // sentences per request so the voice keeps its flow between phrases.
      const segments = buildSpeechSegments(text, voice, options?.style ?? "mentor");
      if (segments.length === 0) {
        throw new TtsProviderError("TTS text is empty.");
      }

      const parts = await mapWithConcurrency(segments, 4, (ssml) =>
        this.synthesizeSsml(tts, ssml),
      );
      const audio = Buffer.concat(parts);
      if (audio.length === 0) {
        throw new TtsProviderError("TTS returned empty audio.");
      }

      return { audio, mimeType: "audio/mpeg" };
    } catch (error) {
      if (error instanceof TtsProviderError) throw error;
      throw new TtsProviderError("Edge TTS request failed.", error);
    } finally {
      try {
        tts.close();
      } catch {
        // Closing a already-closed socket must not fail a successful synthesis.
      }
    }
  }

  private synthesizeSsml(tts: MsEdgeTTS, ssml: string): Promise<Buffer> {
    const { audioStream } = tts.rawToStream(ssml);
    const chunks: Buffer[] = [];

    return new Promise<Buffer>((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        finish(new TtsProviderError("TTS synthesis timed out."));
      }, 60_000);

      const finish = (error?: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (error) {
          reject(error instanceof TtsProviderError ? error : new TtsProviderError("TTS stream failed.", error));
          return;
        }
        const audio = Buffer.concat(chunks);
        if (audio.length === 0) {
          reject(new TtsProviderError("TTS returned empty audio."));
          return;
        }
        resolve(audio);
      };

      audioStream.on("data", (chunk: Buffer | string) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      audioStream.once("end", () => finish());
      audioStream.once("close", () => finish());
      audioStream.once("error", (error: Error) => finish(error));
    });
  }
}
