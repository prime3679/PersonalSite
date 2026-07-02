// rogue live-layer constants. the epoch is the day the current rogue stack
// started running; the lab stat and the homepage strip derive "days running"
// from it instead of a hardcoded number.
export const ROGUE_EPOCH = '2026-04-15';

export const ROGUE_STATUS_URL = 'https://api.adrianlumley.co/v1/status';

// a heartbeat older than this renders the quiet state. mirrors the worker.
export const STALE_MS = 6 * 60 * 60 * 1000;

export function daysRunning(now: Date): number {
  const epoch = Date.parse(`${ROGUE_EPOCH}T00:00:00Z`);
  const diff = now.getTime() - epoch;
  return Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)));
}
