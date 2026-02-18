#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/srv/drinknplay"
SERVICE="drinknplay"

echo "== Deploying $(date) =="

cd "$APP_DIR"

echo "== Git pull =="
git pull --ff-only

echo "== Install deps =="
npm ci --omit=dev

echo "== Build =="
npm run build

echo "== Restart service =="
sudo systemctl restart "$SERVICE"

echo "== Status =="
sudo systemctl --no-pager --full status "$SERVICE" | head -n 30

echo "== Done =="