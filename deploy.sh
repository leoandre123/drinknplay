#!/usr/bin/env bash
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: ./deploy.sh <tag>"
  exit 1
fi

APP_DIR="/srv/drinknplay"
BRANCH="main"
SERVICE="drinknplay"
TAG=$1

echo "== Deploying $(date) =="

cd "$APP_DIR"

echo "== Fetch latest =="
git fetch --tags origin

echo "== Reset to origin/$TAG =="
git reset --hard "$TAG"
git clean -fd

echo "== Install deps =="
npm ci

echo "== Build =="
npm run build

echo "== Restart service =="
sudo systemctl restart "$SERVICE"

echo "== Status =="
sudo systemctl --no-pager --full status "$SERVICE" | head -n 30

echo "== Deployed $TAG =="