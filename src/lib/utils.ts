/**
 * Utility helpers used across the application.
 * A "grab bag" of small, pure, reusable functions (no side effects, no state) —
 * the equivalent of a StringUtils/CollectionUtils class in Java.
 */

/**
 * Strip markdown code fences from AI responses that ignore instructions
 * and wrap their JSON in ```json ... ``` blocks anyway.
 */
export function stripJsonFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '') // Remove an opening ``` or ```json at the start
    .replace(/\s*```\s*$/i, '')       // Remove a closing ``` at the end
    .trim();
}

/**
 * Safe JSON parse with a fallback value.
 * `<T>` is a GENERIC (like Java generics): the return type matches whatever the
 * caller passes as `fallback`, so this works for any expected shape.
 */
export function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(stripJsonFences(text)) as T;
  } catch {
    return fallback; // On invalid JSON, return the fallback instead of throwing
  }
}

/**
 * Truncate text to a maximum length to avoid exceeding token limits.
 */
export function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '\n\n[Content truncated to fit processing limits]';
}

/**
 * Check whether a string is a valid URL.
 * Uses the built-in URL constructor (throws on invalid) and only accepts http/https.
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Build a human-readable file size string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Clamp a number between min and max (e.g. keep a score within 0–100).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Merge class names (lightweight utility without dependencies).
 * `...classes` is a REST parameter — collects all args into an array. We drop any
 * falsy entries (undefined/null/false/'') so you can write:
 *   cn('base', isActive && 'active')  →  "base active"  (or just "base")
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
