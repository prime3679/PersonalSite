const WORDS_PER_MINUTE = 200;

/**
 * Estimate reading time in whole minutes from a raw markdown body.
 * Word count is approximate (markdown syntax is counted), which is fine
 * for a "N min read" estimate. Always returns at least 1.
 */
export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
