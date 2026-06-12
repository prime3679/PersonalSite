import { describe, expect, it } from 'vitest';
import { episodeTitle, formatLongDate, formatMonthYear, padEpisode, snapshotLabel } from './format';

describe('formatLongDate', () => {
  it('formats a date-only value without shifting the day', () => {
    // UTC midnight — a local-zone formatter west of UTC would show June 11.
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

describe('padEpisode', () => {
  it('pads single digits', () => {
    expect(padEpisode(3)).toBe('03');
  });

  it('leaves two-digit numbers alone', () => {
    expect(padEpisode(12)).toBe('12');
  });
});

describe('episodeTitle', () => {
  it('builds the composite title shared by RSS and JSON-LD', () => {
    expect(episodeTitle(5, 'night shift')).toBe('signal room 05 · night shift');
  });
});

describe('snapshotLabel', () => {
  it('renders a lowercase month + year', () => {
    expect(snapshotLabel('2026-06-01T00:00:00Z')).toBe('jun 2026');
  });

  it('returns a dash for missing or invalid input', () => {
    expect(snapshotLabel(null)).toBe('—');
    expect(snapshotLabel(undefined)).toBe('—');
    expect(snapshotLabel('not a date')).toBe('—');
  });
});
