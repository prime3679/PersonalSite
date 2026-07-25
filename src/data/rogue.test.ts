import { describe, expect, it } from 'vitest';
import { ROGUE_EPOCH, ROGUE_STATUS_URL, STALE_MS, daysRunning, evaluateStatus } from './rogue';

describe('rogue live-layer constants', () => {
  it('epoch is a valid utc date string', () => {
    expect(ROGUE_EPOCH).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(`${ROGUE_EPOCH}T00:00:00Z`))).toBe(false);
  });

  it('staleness threshold is six hours', () => {
    expect(STALE_MS).toBe(6 * 60 * 60 * 1000);
  });

  it('status url is opt-in: empty by default so the default build makes no request', () => {
    // PUBLIC_ROGUE_STATUS_URL is unset in the default build/test env. the
    // dead status hostname must not be requested unless it is explicitly set.
    expect(ROGUE_STATUS_URL).toBe('');
  });
});

describe('evaluateStatus', () => {
  const now = new Date('2026-06-21T12:00:00Z'); // daysRunning === 67

  it('reports live from a fresh heartbeat, including loops', () => {
    const fresh = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    const result = evaluateStatus({ last_signal: fresh, loops_today: 12 }, now);
    expect(result.status).toBe('live');
    expect(result.text).toBe(
      'rogue · live · 67 days running · last signal 5 minutes ago · 12 loops today',
    );
    if (result.status === 'live') expect(result.loops_today).toBe(12);
  });

  it('omits the loops clause when loops_today is absent or non-integer', () => {
    const fresh = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    const result = evaluateStatus({ last_signal: fresh }, now);
    expect(result.status).toBe('live');
    expect(result.text).toBe('rogue · live · 67 days running · last signal 5 minutes ago');
    if (result.status === 'live') expect(result.loops_today).toBeNull();
  });

  it('never believes a payload that claims live but is stale', () => {
    const stale = new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString();
    const result = evaluateStatus({ last_signal: stale, status: 'live' }, now);
    expect(result.status).toBe('quiet');
    expect(result.text).toBe('rogue is quiet · last signal 10 hours ago');
  });

  it('is quiet with no last signal', () => {
    const result = evaluateStatus({}, now);
    expect(result.status).toBe('quiet');
    expect(result.text).toBe('rogue is quiet');
  });

  it('does not report live for a future last_signal timestamp', () => {
    const future = new Date(now.getTime() + 5 * 60 * 1000).toISOString();
    const result = evaluateStatus({ last_signal: future }, now);
    expect(result.status).toBe('quiet');
    expect(result.text).toBe('rogue is quiet · last signal just now');
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
