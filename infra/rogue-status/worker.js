// rogue-status worker: receives heartbeats from the mac mini and serves a
// public status document for adrianlumley.co's live layer.
//
// endpoints:
//   POST /v1/heartbeat  (bearer auth, allowlisted fields only)
//   GET  /v1/status     (public, cached 60s)
//
// design rule: "gray beats false green". the worker never invents freshness;
// last_signal is stamped server side and staleness is computed at read time.

const STALE_MS = 6 * 60 * 60 * 1000;
const EPOCH = '2026-04-15';

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'authorization, content-type',
};

function timingSafeEqual(a, b) {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

function intInRange(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max ? value : undefined;
}

async function handleHeartbeat(request, env) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!env.HEARTBEAT_TOKEN || !token || !timingSafeEqual(token, env.HEARTBEAT_TOKEN)) {
    return new Response(null, { status: 401, headers: CORS_HEADERS });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400, headers: CORS_HEADERS });
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return new Response(null, { status: 400, headers: CORS_HEADERS });
  }

  // privacy allowlist: only these fields are ever stored. everything else in
  // the payload is dropped. new fields require editing this worker AND
  // docs/rogue-telemetry.md in the site repo.
  const record = { last_signal: new Date().toISOString() };
  const loops = intInRange(body.loops_today, 0, 10000);
  const actions = intInRange(body.actions_today, 0, 100000);
  if (loops !== undefined) record.loops_today = loops;
  if (actions !== undefined) record.actions_today = actions;

  await env.ROGUE_STATUS.put('current', JSON.stringify(record));
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

async function handleStatus(env) {
  const raw = await env.ROGUE_STATUS.get('current');
  let record = null;
  if (raw) {
    try {
      record = JSON.parse(raw);
    } catch {
      record = null;
    }
  }

  const lastSignal = record?.last_signal ?? null;
  const fresh = lastSignal !== null && Date.now() - Date.parse(lastSignal) <= STALE_MS;

  const status = {
    agent: 'rogue',
    epoch: EPOCH,
    last_signal: lastSignal,
    status: fresh ? 'live' : 'quiet',
  };
  if (record?.loops_today !== undefined) status.loops_today = record.loops_today;
  if (record?.actions_today !== undefined) status.actions_today = record.actions_today;

  return new Response(JSON.stringify(status), {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'content-type': 'application/json',
      'cache-control': 'public, max-age=60',
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (url.pathname === '/v1/heartbeat') {
      if (request.method !== 'POST') {
        return new Response(null, { status: 405, headers: CORS_HEADERS });
      }
      return handleHeartbeat(request, env);
    }
    if (url.pathname === '/v1/status') {
      if (request.method !== 'GET') {
        return new Response(null, { status: 405, headers: CORS_HEADERS });
      }
      return handleStatus(env);
    }
    return new Response(null, { status: 404, headers: CORS_HEADERS });
  },
};
