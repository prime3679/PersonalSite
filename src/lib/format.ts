/**
 * Shared display formatting. Dates in content are date-only (YYYY-MM-DD →
 * UTC midnight), so every formatter pins timeZone: 'UTC' , formatting in the
 * build machine's local zone can shift the shown day.
 */

/** "June 12, 2026" , natural casing; call sites apply `uppercase` via CSS. */
export const formatLongDate = (d: Date): string =>
  d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

/** "June 2026" , used by index lists where the day is noise. */
export const formatMonthYear = (d: Date): string =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', timeZone: 'UTC' });

/** Episode numbers render as two digits everywhere: 3 → "03". */
export const padEpisode = (n: number): string => String(n).padStart(2, '0');

/** Composite episode title , the RSS feed and JSON-LD must agree on it. */
export const episodeTitle = (episode: number, title: string): string =>
  `signal room ${padEpisode(episode)} · ${title}`;

/** "jun 2026" snapshot label for lab stats; ',' for missing/invalid input. */
export const snapshotLabel = (iso: string | undefined | null): string => {
  if (!iso) return ',';
  const date = new Date(iso);
  return isNaN(date.getTime())
    ? ','
    : date
        .toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
        .toLowerCase();
};
