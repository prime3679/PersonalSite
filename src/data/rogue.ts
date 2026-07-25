// rogue live-layer constants. the epoch is the day the current rogue stack
// started running; the lab stat and the homepage strip derive "days running"
// from it instead of a hardcoded number.
import { relativeTime } from '../lib/relativeTime';

export const ROGUE_EPOCH = '2026-04-15';

// the status endpoint is opt-in. it stays empty unless PUBLIC_ROGUE_STATUS_URL
// is set at build time, so the default production build makes no request to the
// currently dormant status worker. set it to re-enable the live layer once the
// worker is actually deployed (see docs/rogue-telemetry.md).
export const ROGUE_STATUS_URL = import.meta.env.PUBLIC_ROGUE_STATUS_URL ?? '';

// a heartbeat older than this renders the quiet state. mirrors the worker.
export const STALE_MS = 6 * 60 * 60 * 1000;

export function daysRunning(now: Date): number {
  const epoch = Date.parse(`${ROGUE_EPOCH}T00:00:00Z`);
  const diff = now.getTime() - epoch;
  return Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)));
}

export type RogueStatus =
  | { status: 'live'; text: string; loops_today: number | null }
  | { status: 'quiet'; text: string };

// derive the visible status from a status payload. freshness is computed here
// from the server timestamp and never trusted from the payload's own claim:
// gray beats false green. a fetch failure is handled by the caller (unknown),
// not here.
export function evaluateStatus(data: unknown, now: Date): RogueStatus {
  const payload = (data ?? {}) as Record<string, unknown>;
  const lastSignal = typeof payload.last_signal === 'string' ? payload.last_signal : null;

  if (!lastSignal) {
    return { status: 'quiet', text: 'rogue is quiet' };
  }

  const age = now.getTime() - Date.parse(lastSignal);
  if (Number.isFinite(age) && age >= 0 && age <= STALE_MS) {
    const loops = Number.isInteger(payload.loops_today) ? (payload.loops_today as number) : null;
    let text = `rogue · live · ${daysRunning(now)} days running · last signal ${relativeTime(lastSignal, now)}`;
    if (loops !== null) text += ` · ${loops} loops today`;
    return { status: 'live', text, loops_today: loops };
  }

  return { status: 'quiet', text: `rogue is quiet · last signal ${relativeTime(lastSignal, now)}` };
}
