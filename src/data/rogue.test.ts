import { describe, expect, it } from 'vitest';
import { ROGUE_EPOCH, STALE_MS, daysRunning } from './rogue';

describe('rogue live-layer constants', () => {
  it('epoch is a valid utc date string', () => {
    expect(ROGUE_EPOCH).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(`${ROGUE_EPOCH}T00:00:00Z`))).toBe(false);
  });

  it('staleness threshold is six hours', () => {
    expect(STALE_MS).toBe(6 * 60 * 60 * 1000);
  });
});

describe('daysRunning', () => {
  it('is zero on the epoch day', () => {
    expect(daysRunning(new Date(`${ROGUE_EPOCH}T12:00:00Z`))).toBe(0);
  });

  it('floors partial days', () => {
    expect(daysRunning(new Date('2026-04-16T23:59:00Z'))).toBe(1);
    expect(daysRunning(new Date('2026-04-17T00:01:00Z'))).toBe(2);
  });

  it('matches the historical hardcoded stat: 67 days on 2026-06-21', () => {
    expect(daysRunning(new Date('2026-06-21T12:00:00Z'))).toBe(67);
  });

  it('never goes negative before the epoch', () => {
    expect(daysRunning(new Date('2026-01-01T00:00:00Z'))).toBe(0);
  });
});
