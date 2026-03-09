#!/usr/bin/env bash
# Update public/bishop-stats.json with live Bishop stats
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
OUT="$REPO_DIR/public/bishop-stats.json"

# Count active cron jobs
CRON_COUNT=$(openclaw cron list --json 2>/dev/null | python3 -c "import json,sys; jobs=json.load(sys.stdin); print(len([j for j in jobs if j.get('enabled', True)]))" 2>/dev/null || echo 0)

# Days since Feb 1 2026
DAYS_RUNNING=$(python3 -c "from datetime import date; print((date.today()-date(2026,2,1)).days)")

# ISO timestamp
UPDATED_AT=$(python3 -c "from datetime import datetime,timezone; print(datetime.now(timezone.utc).isoformat())")

# Write JSON
cat > "$OUT" <<EOF
{
  "daysRunning": $DAYS_RUNNING,
  "cronCount": $CRON_COUNT,
  "uptime": "24/7",
  "updatedAt": "$UPDATED_AT"
}
EOF

echo "Wrote $OUT: days=$DAYS_RUNNING crons=$CRON_COUNT"
