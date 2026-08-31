#!/usr/bin/env bash
# Stop stale Kazakh API dev processes and start a fresh API + Vite pair.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Stopping stale dev listeners on 8787, 5173, 4173…"
for port in 8787 5173 4173; do
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${port}/tcp" 2>/dev/null || true
  else
    pid="$(lsof -ti :"$port" 2>/dev/null || true)"
    [[ -n "$pid" ]] && kill -9 $pid 2>/dev/null || true
  fi
done

pkill -f "/workspace/node_modules/.bin/vite" 2>/dev/null || true
pkill -f "node --watch server/index.js" 2>/dev/null || true
pkill -f "concurrently.*dev:server" 2>/dev/null || true
pkill -f "node server/index.js" 2>/dev/null || true
pkill -f "vite preview" 2>/dev/null || true
sleep 2

echo "Starting npm run dev (API :8787 + Vite :5173)…"
exec npm run dev
