/**
 * Shared display formatting. Dates in content are date-only (YYYY-MM-DD →
 * UTC midnight), so every formatter pins timeZone: 'UTC'; formatting in the
 * build machine's local zone can shift the shown day.
 */

/** "June 12, 2026": the essay date line. */
export const formatLongDate = (d: Date): string =>
  d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

/** "June 2026": used by index lists where the day is noise. */
export const formatMonthYear = (d: Date): string =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', timeZone: 'UTC' });
