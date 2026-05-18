#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -z "${DOCKERHUB_USER:-}" ]; then
  echo "Set DOCKERHUB_USER to your Docker Hub username, e.g.:"
  echo "  export DOCKERHUB_USER=yourusername"
  exit 1
fi

echo "Building images..."
docker compose build

echo "Pushing images to Docker Hub as ${DOCKERHUB_USER}..."
docker compose push

echo "Done. Images:"
echo "  ${DOCKERHUB_USER}/invoice-generator-backend:latest"
echo "  ${DOCKERHUB_USER}/invoice-generator-payment:latest"
echo "  ${DOCKERHUB_USER}/invoice-generator-frontend:latest"
