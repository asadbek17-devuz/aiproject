import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { getEnv } from "@/server/env";

const CACHE_VERSION = "v2-natural";

export function ttsCacheKey(text: string, voice: string, style = "mentor"): string {
  return createHash("sha256")
    .update(`${CACHE_VERSION}\u0000${voice}\u0000${style}\u0000${text}`)
    .digest("hex");
}

function cachePath(key: string): string {
  return path.join(process.cwd(), getEnv().TTS_CACHE_DIR, `${key}.mp3`);
}

export async function readTtsCache(key: string): Promise<Buffer | null> {
  try {
    return await readFile(cachePath(key));
  } catch {
    return null;
  }
}

export async function writeTtsCache(key: string, audio: Buffer): Promise<void> {
  const filePath = cachePath(key);
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tempPath, audio);
  await rename(tempPath, filePath);
}
