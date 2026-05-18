#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/invoice-app}"
BRANCH="${BRANCH:-main}"
COMPOSE_FILE="${COMPOSE_FILE:-deploy/aws/docker-compose.prod.yml}"

if [ ! -d "$APP_DIR/.git" ]; then
  echo "App directory not found: $APP_DIR"
  echo "Run deploy/aws/ec2-bootstrap.sh on the server first."
  exit 1
fi

cd "$APP_DIR"

echo "==> Pulling latest code (${BRANCH})..."
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

if [ ! -f .env ]; then
  echo "Missing $APP_DIR/.env — copy from deploy/aws/env.production.example"
  exit 1
fi

echo "==> Building and starting containers..."
docker compose -f "$COMPOSE_FILE" up -d --build --remove-orphans

echo "==> Container status"
docker compose -f "$COMPOSE_FILE" ps

echo "==> Done. App should be live on port 80."
