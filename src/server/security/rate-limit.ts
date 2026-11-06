export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSec: number;
};

export type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export interface RateLimitStore {
  hit(key: string, windowMs: number, now: number): Promise<RateLimitBucket>;
  reset(key: string): Promise<void>;
}

export class MemoryRateLimitStore implements RateLimitStore {
  private readonly buckets = new Map<string, RateLimitBucket>();

  async hit(key: string, windowMs: number, now: number): Promise<RateLimitBucket> {
    const current = this.buckets.get(key);
    if (!current || current.resetAt <= now) {
      const bucket = { count: 1, resetAt: now + windowMs };
      this.buckets.set(key, bucket);
      this.prune(now);
      return bucket;
    }
    current.count += 1;
    return current;
  }

  async reset(key: string): Promise<void> {
    this.buckets.delete(key);
  }

  private prune(now: number): void {
    if (this.buckets.size < 5_000) return;
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }
}

// NOTE: in-memory store is per-process. Phase 10 replaces it with a Redis-compatible
// implementation behind the same RateLimitStore interface.
export const memoryRateLimitStore = new MemoryRateLimitStore();

export type RateLimitInput = {
  key: string;
  limit: number;
  windowMs: number;
  store?: RateLimitStore;
  now?: number;
};

export async function rateLimit({
  key,
  limit,
  windowMs,
  store = memoryRateLimitStore,
  now = Date.now(),
}: RateLimitInput): Promise<RateLimitResult> {
  const bucket = await store.hit(key, windowMs, now);
  const remaining = Math.max(0, limit - bucket.count);
  const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

  return {
    allowed: bucket.count <= limit,
    limit,
    remaining,
    resetAt: bucket.resetAt,
    retryAfterSec,
  };
}

export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
