import { describe, expect, it } from 'vitest';
import { formatLongDate, formatMonthYear } from './format';

describe('formatLongDate', () => {
  it('formats a date-only value without shifting the day', () => {
    // UTC midnight , a local-zone formatter west of UTC would show June 11.
    expect(formatLongDate(new Date('2026-06-12'))).toBe('June 12, 2026');
  });
});

describe('formatMonthYear', () => {
  it('formats month and year only', () => {
    expect(formatMonthYear(new Date('2026-06-12'))).toBe('June 2026');
  });

  it('does not shift the month for first-of-month dates', () => {
    expect(formatMonthYear(new Date('2026-06-01'))).toBe('June 2026');
  });
});
