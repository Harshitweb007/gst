#!/bin/bash
set -euo pipefail
exec > /var/log/invoice-deploy.log 2>&1

echo "=== Invoice Generator bootstrap started at $(date) ==="

dnf update -y
dnf install -y docker git
systemctl enable --now docker

mkdir -p /usr/local/lib/docker/cli-plugins
curl -fsSL "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

TOKEN=""
if command -v curl >/dev/null; then
  TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" || true)
fi
PUBLIC_IP=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/public-ipv4)

rm -rf /opt/invoice-app
git clone --depth 1 --branch ${git_branch} ${git_repo_url} /opt/invoice-app
cd /opt/invoice-app

cat > .env <<ENVFILE
JWT_SECRET=${jwt_secret}
RAZORPAY_KEY_ID=${razorpay_key_id}
RAZORPAY_KEY_SECRET=${razorpay_key_secret}
FRONTEND_URL=http://$PUBLIC_IP
VITE_API_URL=
VITE_PAYMENT_URL=
ENVFILE

chmod +x deploy/aws/remote-deploy.sh
bash deploy/aws/remote-deploy.sh

echo "=== Deployment finished at $(date) ==="
