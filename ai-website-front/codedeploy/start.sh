#!/bin/bash
set -euo pipefail
APP_DIR="/home/ec2-user/trynic-front"

echo "=== [Start] $(date) ==="
cd "$APP_DIR"

# Next.js 기본 서버 실행 (PORT=3000)
if pm2 info trynic-front >/dev/null 2>&1; then
  pm2 reload trynic-front --update-env
else
  pm2 start npm --name "trynic-front" -- start
fi

pm2 save
sudo systemctl restart nginx
