import { describe, expect, it } from 'vitest';
import { mulberry32, toSvgPath, tracePoints, traceSeed } from './trace';

describe('mulberry32', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 10; i++) expect(a()).toBe(b());
  });

  it('yields values in [0, 1)', () => {
    const rand = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = rand();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('tracePoints', () => {
  it('same seed produces an identical path string', () => {
    const a = toSvgPath(tracePoints(1234, 600, 80, 120));
    const b = toSvgPath(tracePoints(1234, 600, 80, 120));
    expect(a).toBe(b);
    expect(a.startsWith('M')).toBe(true);
  });

  it('different seeds produce different lines', () => {
    const a = toSvgPath(tracePoints(1, 600, 80, 120));
    const b = toSvgPath(tracePoints(2, 600, 80, 120));
    expect(a).not.toBe(b);
  });

  it('stays inside the vertical bounds with headroom', () => {
    const points = tracePoints(99, 600, 80, 240, 1.4);
    for (const [x, y] of points) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(600);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(80);
    }
  });

  it('spans the full width', () => {
    const points = tracePoints(5, 600, 80, 120);
    expect(points[0][0]).toBe(0);
    expect(points[points.length - 1][0]).toBe(600);
  });
});

describe('traceSeed', () => {
  it('is stable within a utc day and changes across days', () => {
    const noon = new Date('2026-07-02T12:00:00Z');
    const evening = new Date('2026-07-02T23:59:00Z');
    const nextDay = new Date('2026-07-03T00:01:00Z');
    expect(traceSeed(78, noon)).toBe(traceSeed(78, evening));
    expect(traceSeed(78, noon)).not.toBe(traceSeed(78, nextDay));
  });
});
