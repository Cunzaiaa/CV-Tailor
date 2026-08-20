/**
 * Tiny in-memory TTL cache — server-side only.
 *
 * Purpose: avoid re-running expensive/quota-limited AI calls for identical input.
 * The main win is the questions round-trip: the same CV/job text is sent twice
 * (once to get questions, once with answers), so we only analyze it once.
 *
 * Caveat: this lives in a single Node process. On serverless with multiple
 * instances the hit rate is best-effort, not guaranteed. That's fine here —
 * a miss simply falls back to calling the AI as before.
 */
import { createHash } from 'crypto';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_ENTRIES = 200; // Bound memory; evict oldest when exceeded.

const store = new Map<string, CacheEntry<unknown>>();

/** Stable cache key from arbitrary string inputs (e.g. a namespace + raw text). */
export function cacheKey(...parts: string[]): string {
  return createHash('sha256').update(parts.join('\u0000')).digest('hex');
}

function evictIfNeeded(): void {
  if (store.size <= MAX_ENTRIES) return;
  // Map preserves insertion order, so the first key is the oldest.
  const oldest = store.keys().next().value;
  if (oldest !== undefined) store.delete(oldest);
}

/**
 * Return the cached value for `key`, or compute it via `factory`, cache, and return it.
 * Concurrent callers with the same key share a single in-flight computation.
 */
const inFlight = new Map<string, Promise<unknown>>();

export async function getOrCompute<T>(
  key: string,
  factory: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.value as T;
  }
  if (hit) store.delete(key); // Expired — drop it.

  // De-duplicate concurrent computations for the same key.
  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = (async () => {
    try {
      const value = await factory();
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
      evictIfNeeded();
      return value;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise as Promise<T>;
}
