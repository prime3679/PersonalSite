import { describe, expect, it } from 'vitest';
import { relativeTime } from './relativeTime';

const NOW = new Date('2026-07-02T12:00:00Z');
const at = (iso: string) => relativeTime(iso, NOW);

describe('relativeTime', () => {
  it('under a minute reads just now', () => {
    expect(at('2026-07-02T11:59:30Z')).toBe('just now');
  });

  it('singular and plural minutes', () => {
    expect(at('2026-07-02T11:59:00Z')).toBe('1 minute ago');
    expect(at('2026-07-02T11:56:00Z')).toBe('4 minutes ago');
    expect(at('2026-07-02T11:01:00Z')).toBe('59 minutes ago');
  });

  it('singular and plural hours', () => {
    expect(at('2026-07-02T11:00:00Z')).toBe('1 hour ago');
    expect(at('2026-07-02T09:00:00Z')).toBe('3 hours ago');
  });

  it('the six hour staleness boundary reads in hours', () => {
    expect(at('2026-07-02T06:00:00Z')).toBe('6 hours ago');
    expect(at('2026-07-02T05:59:00Z')).toBe('6 hours ago');
  });

  it('singular and plural days', () => {
    expect(at('2026-07-01T11:00:00Z')).toBe('1 day ago');
    expect(at('2026-06-25T12:00:00Z')).toBe('7 days ago');
  });

  it('future or garbage input degrades safely', () => {
    expect(at('2026-07-02T13:00:00Z')).toBe('just now');
    expect(at('not-a-date')).toBe('unknown');
  });
});
