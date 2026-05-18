#!/usr/bin/env bash
set -euo pipefail

# One-time setup on a fresh EC2 (Amazon Linux 2023).
# Run as root or with sudo: sudo bash ec2-bootstrap.sh

APP_DIR="${APP_DIR:-/opt/invoice-app}"
REPO_URL="${REPO_URL:-https://github.com/Harshitweb007/gst.git}"
BRANCH="${BRANCH:-main}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run with sudo: sudo bash $0"
  exit 1
fi

echo "==> Installing Docker..."
dnf update -y
dnf install -y docker git
systemctl enable --now docker

mkdir -p /usr/local/lib/docker/cli-plugins
if [ ! -x /usr/local/lib/docker/cli-plugins/docker-compose ]; then
  curl -fsSL "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi

usermod -aG docker ec2-user || true

echo "==> Cloning repository..."
rm -rf "$APP_DIR"
git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
cd "$APP_DIR"

if [ ! -f .env ]; then
  cp deploy/aws/env.production.example .env
  PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo "localhost")
  sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=http://${PUBLIC_IP}|" .env
  echo ""
  echo "Created .env — edit secrets before first deploy:"
  echo "  sudo nano $APP_DIR/.env"
fi

chown -R ec2-user:ec2-user "$APP_DIR"

echo "==> Bootstrap complete."
echo "Next: edit .env, then run remote-deploy.sh as ec2-user"
