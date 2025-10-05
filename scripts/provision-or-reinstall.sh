#!/bin/bash

# One-shot provision/reinstall on VPS:
# - Stop/remove old PM2 process
# - Fresh install deps and build
# - Configure Nginx reverse proxy to 127.0.0.1:8080
# - Start app with PM2 and enable startup

set -euo pipefail

VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PASSWORD="rp4QkUUvmbi5qB"
PROJECT_DIR="/var/www/internship-system"
SITE_NAME="internship-system"
DOMAIN="internship.samartsolution.com"

echo "🧰 Provision/Reinstall on VPS $VPS_HOST ($SITE_NAME)"

sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
set -euo pipefail

SITE_NAME="internship-system"
DOMAIN="internship.samartsolution.com"
PROJECT_DIR="/var/www/internship-system"

echo "🔧 Ensure base packages"
apt-get update -y >/dev/null 2>&1 || true
apt-get install -y nginx curl >/dev/null 2>&1 || true

echo "🛑 Stop/remove old PM2 process"
pm2 delete "${SITE_NAME}" >/dev/null 2>&1 || true

echo "📦 Prepare project"
mkdir -p "${PROJECT_DIR}"
cd "${PROJECT_DIR}"
git pull || true

echo "🧹 Clean install deps"
rm -rf node_modules
npm ci

echo "🏗️  Build production"
NODE_ENV=production npm run build

echo "🌐 Configure Nginx site"
cat >/etc/nginx/sites-available/${SITE_NAME}.conf <<NGINX
server {
    listen 80;
    server_name ${DOMAIN} ${HOSTNAME};

    location / {
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_pass http://127.0.0.1:8080;
        proxy_read_timeout 120s;
    }
}
NGINX

ln -sf "/etc/nginx/sites-available/${SITE_NAME}.conf" "/etc/nginx/sites-enabled/${SITE_NAME}.conf"
nginx -t
systemctl reload nginx || systemctl restart nginx

echo "🚀 Start app on port 8080"
pm2 start npm --name "${SITE_NAME}" -- start
pm2 save

echo "🩺 Health checks"
for url in \
  "http://127.0.0.1:8080" \
  "http://127.0.0.1:8080/api/health"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "${url}" || echo 000)
  echo "URL: ${url} -> ${code}"
done

echo "📜 PM2 status"
pm2 status
EOF

echo "✅ Provision/Reinstall completed."





