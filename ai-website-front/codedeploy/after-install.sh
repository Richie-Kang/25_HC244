#!/bin/bash
set -euo pipefail
APP_DIR="/home/ec2-user/trynic-front"

echo "=== [AfterInstall] $(date) ==="

cd "$APP_DIR"

# .env.production 권한 조정
chmod 600 .env.production

# Node / PM2 설치 (없으면)
command -v node >/dev/null 2>&1 || sudo yum -y install nodejs
command -v pm2  >/dev/null 2>&1 || npm install -g pm2
