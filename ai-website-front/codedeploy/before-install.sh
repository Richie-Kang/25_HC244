#!/bin/bash
set -euo pipefail
APP_DIR="/home/ec2-user/trynic-front"

echo "=== [BeforeInstall] $(date) ==="

# PM2 프로세스 중지 & 기존 코드 삭제
if command -v pm2 >/dev/null 2>&1; then
  pm2 delete trynic-front || true
fi

rm -rf "$APP_DIR"
mkdir -p "$APP_DIR"
chown ec2-user:ec2-user "$APP_DIR"
