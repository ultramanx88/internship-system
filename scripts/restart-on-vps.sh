#!/bin/bash

# Quick restart script for production app on VPS (ensures port 8080)

set -euo pipefail

VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PASSWORD="rp4QkUUvmbi5qB"
PROJECT_DIR="/var/www/internship-system"

echo "🔄 Restarting production app on VPS (${VPS_HOST})..."

sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
set -euo pipefail
cd /var/www/internship-system

echo "🛑 Removing old process (if any)"
pm2 delete internship-system >/dev/null 2>&1 || true

echo "🚀 Starting app with npm start (next start -p 8080)"
pm2 start npm --name internship-system -- start
pm2 save

echo "🩺 Health checks"
for url in \
  "http://127.0.0.1:3000/api/health" \
  "http://127.0.0.1:8080/api/health" \
  "http://127.0.0.1:8080"; do
  code="$(curl -s -o /dev/null -w '%{http_code}' "${url}" || echo 000)"
  echo "URL: \\${url} -> \\${code}"
done

echo "📜 PM2 status"
pm2 status
EOF

echo "✅ Restart command executed. Check output above for status."





