#!/usr/bin/env bash
# Boot helper for Cloud Agent start: free ports, then launch dev servers in tmux.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

for port in 8787 5173 4173; do
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${port}/tcp" 2>/dev/null || true
  fi
done

pkill -f "node --watch server/index.js" 2>/dev/null || true
pkill -f "node server/index.js" 2>/dev/null || true

TMUX="${TMUX:-tmux -f /exec-daemon/tmux.portal.conf}"
SESSION="khazak-dev"

$TMUX has-session -t "=$SESSION" 2>/dev/null && $TMUX kill-session -t "$SESSION"
$TMUX new-session -d -s "$SESSION" -c "$ROOT" -- "${SHELL:-bash}" -l
$TMUX send-keys -t "$SESSION:0.0" "cd $ROOT && npm run dev" C-m

for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:8787/health" >/dev/null 2>&1; then
    bash "$ROOT/scripts/dev-verify.sh" && exit 0
  fi
  sleep 1
done

echo "Dev servers started but health check timed out — run npm run dev:verify"
exit 0
