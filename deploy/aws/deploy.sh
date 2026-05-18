#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TF_DIR="$ROOT/deploy/aws/terraform"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

echo "Checking prerequisites..."
require_cmd terraform
require_cmd aws
require_cmd git

if ! aws sts get-caller-identity >/dev/null 2>&1; then
  echo "AWS CLI is not configured. Run: aws configure"
  exit 1
fi

if [ ! -f "$TF_DIR/terraform.tfvars" ]; then
  echo "Create $TF_DIR/terraform.tfvars from terraform.tfvars.example"
  echo "  cp $TF_DIR/terraform.tfvars.example $TF_DIR/terraform.tfvars"
  exit 1
fi

echo ""
echo "IMPORTANT: Push deploy/aws files to GitHub before deploying."
echo "  git add deploy/aws frontendpart/src/config/api.js"
echo "  git commit -m 'Add AWS deployment'"
echo "  git push origin main"
echo ""
read -r -p "Have you pushed the latest code to GitHub? (y/N) " pushed
if [[ ! "$pushed" =~ ^[Yy]$ ]]; then
  echo "Push your code first, then run this script again."
  exit 1
fi

cd "$TF_DIR"
terraform init
terraform apply

echo ""
terraform output
