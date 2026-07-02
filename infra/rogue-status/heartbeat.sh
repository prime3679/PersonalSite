#!/bin/sh
# rogue heartbeat: posts a minimal liveness signal to api.adrianlumley.co.
# runs on the mac mini via launchd every 15 minutes (StartInterval 900).
# see docs/rogue-telemetry.md for setup and the field allowlist.
set -eu

TOKEN_FILE="$HOME/.config/rogue/heartbeat-token"
ENDPOINT="https://api.adrianlumley.co/v1/heartbeat"

[ -r "$TOKEN_FILE" ] || { echo "heartbeat: token file missing at $TOKEN_FILE" >&2; exit 1; }
TOKEN=$(cat "$TOKEN_FILE")

# optional counters: if rogue's local state exposes them, include them.
# both fields are integers; anything else is dropped by the worker anyway.
PAYLOAD="{}"
COUNTS_FILE="$HOME/.hermes/state/rogue-loops/signals/today-counts.json"
if [ -r "$COUNTS_FILE" ]; then
  PAYLOAD=$(cat "$COUNTS_FILE")
fi

curl --fail --silent --show-error --max-time 10 \
  -X POST \
  -H "authorization: Bearer $TOKEN" \
  -H "content-type: application/json" \
  -d "$PAYLOAD" \
  "$ENDPOINT"
