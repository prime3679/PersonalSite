# rogue telemetry: protocol and runbook

the live layer is **opt-in and dormant by default**. the status worker
(`infra/rogue-status/`) is not deployed, so the default production build
ships no status url and makes **no request** to `api.adrianlumley.co`. the
homepage strip and lab card stay in the honest gray "running since ..."
epoch state, which needs no network.

to enable the live layer once the worker is actually deployed, set the
build-time env var `PUBLIC_ROGUE_STATUS_URL` (see `src/data/rogue.ts`):

```bash
PUBLIC_ROGUE_STATUS_URL=https://api.adrianlumley.co/v1/status npm run build
```

with that set, the live layer reads a tiny status document from the worker.
the mac mini posts a heartbeat every 15 minutes. if the heartbeat stops for
6 hours the site shows the gray quiet state. the site never renders the live
state without a fresh server timestamp: gray beats false green.

## protocol

### POST /v1/heartbeat

- auth: `authorization: Bearer <token>` matching the `HEARTBEAT_TOKEN` worker secret.
- body: json object. **field allowlist** (everything else is dropped server side):
  - `loops_today`: integer 0..10000
  - `actions_today`: integer 0..100000
- `last_signal` is stamped by the worker (`new Date().toISOString()`), never by the client.
- responses: `204` stored · `401` bad token · `400` bad body · `405` wrong method.

adding a field requires editing `infra/rogue-status/worker.js` AND this doc.
never send names, locations, calendar contents, or free text.

### GET /v1/status

public, `cache-control: public, max-age=60`, cors `*`. shape:

```json
{
  "agent": "rogue",
  "epoch": "2026-04-15",
  "last_signal": "2026-07-02T17:40:12.000Z",
  "status": "live",
  "loops_today": 12,
  "actions_today": 48
}
```

- `status` is `live` when `last_signal` is within 6 hours, else `quiet`.
- `last_signal` is `null` and `status` is `quiet` when no heartbeat was ever stored.
- `loops_today` / `actions_today` are omitted when not posted.

## deploy the worker (one time, from `infra/rogue-status/`)

```bash
npx wrangler kv namespace create ROGUE_STATUS
# paste the returned id into wrangler.toml (kv_namespaces id)
npx wrangler secret put HEARTBEAT_TOKEN
# generate one first: openssl rand -hex 32
npx wrangler deploy
```

the custom domain `api.adrianlumley.co` attaches automatically from
`wrangler.toml` (`custom_domain = true`); the zone is already on cloudflare.

## mac mini setup

```bash
mkdir -p ~/.config/rogue
openssl rand -hex 32 > ~/.config/rogue/heartbeat-token   # same value as the worker secret
chmod 600 ~/.config/rogue/heartbeat-token
cp <repo>/infra/rogue-status/heartbeat.sh ~/.local/bin/rogue-heartbeat.sh
chmod +x ~/.local/bin/rogue-heartbeat.sh
```

launchd plist at `~/Library/LaunchAgents/co.adrianlumley.rogue.heartbeat.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>co.adrianlumley.rogue.heartbeat</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/sh</string>
    <string>-c</string>
    <string>$HOME/.local/bin/rogue-heartbeat.sh</string>
  </array>
  <key>StartInterval</key>
  <integer>900</integer>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>
```

```bash
launchctl load ~/Library/LaunchAgents/co.adrianlumley.rogue.heartbeat.plist
```

optional counters: write `~/.hermes/state/rogue-loops/signals/today-counts.json`
as `{"loops_today": 12, "actions_today": 48}` from the rogue loop and the
heartbeat script will include it.

## smoke tests

```bash
# no token: expect 401
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://api.adrianlumley.co/v1/heartbeat

# with token: expect 204
curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  -H "authorization: Bearer $(cat ~/.config/rogue/heartbeat-token)" \
  -H "content-type: application/json" -d '{}' \
  https://api.adrianlumley.co/v1/heartbeat

# public read: expect the json shape above with status "live"
curl -s https://api.adrianlumley.co/v1/status
```

with the live layer disabled (the default), the homepage makes no status
request at all and stays in the gray epoch-only state. once enabled, the
site also tolerates the worker being absent entirely (dns unresolvable,
404, or timeout): the strip and lab card fall back to the same gray state
and no console errors appear. the default no-request contract is covered by
`tests/e2e/live-status.spec.ts`; the live/quiet/stale decision logic is
covered by `evaluateStatus` in `src/data/rogue.test.ts`.
