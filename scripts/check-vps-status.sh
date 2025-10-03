#!/bin/bash

# Check VPS Web Server Status
echo "🔍 Checking VPS web server status..."

VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PASSWORD="rp4QkUUvmbi5qB"

echo "📡 Connecting to VPS for diagnostics..."

sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
echo "🔍 Connected to VPS"

# Find project directory
PROJECT_DIR=""
if [ -d "/var/www/internship-system" ]; then
    PROJECT_DIR="/var/www/internship-system"
elif [ -d "/home/internship-system" ]; then
    PROJECT_DIR="/home/internship-system"
elif [ -d "/root/internship-system" ]; then
    PROJECT_DIR="/root/internship-system"
else
    echo "❌ Project directory not found!"
    exit 1
fi

cd "$PROJECT_DIR"
echo "📍 Working in: $(pwd)"

echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📋 PM2 Logs (last 20 lines):"
pm2 logs internship-system --lines 20 --nostream

echo ""
echo "🌐 Port Usage:"
netstat -tlnp | grep :8080 || echo "Port 8080 not in use"
netstat -tlnp | grep :3000 || echo "Port 3000 not in use"

echo ""
echo "🔥 Firewall Status:"
ufw status

echo ""
echo "🧪 Testing local connection:"
curl -I http://localhost:8080 2>/dev/null || echo "❌ localhost:8080 not responding"
curl -I http://localhost:3000 2>/dev/null || echo "❌ localhost:3000 not responding"

echo ""
echo "📦 Node.js Process:"
ps aux | grep node | grep -v grep

echo ""
echo "🔧 Environment Check:"
echo "NODE_ENV: $NODE_ENV"
ls -la .env* 2>/dev/null || echo "No .env files found"

echo ""
echo "📝 Package.json start script:"
grep -A 1 -B 1 '"start"' package.json

echo ""
echo "🔄 Attempting to restart application..."
pm2 restart internship-system
sleep 3
pm2 status

echo ""
echo "🌐 Final connection test:"
sleep 2
curl -I http://localhost:8080 2>/dev/null && echo "✅ localhost:8080 responding" || echo "❌ localhost:8080 still not responding"
EOF

echo ""
echo "🌍 External connectivity test:"
echo "Testing http://$VPS_HOST:8080"
curl -I "http://$VPS_HOST:8080" 2>/dev/null && echo "✅ External access working" || echo "❌ External access failed"

echo ""
echo "💡 Troubleshooting suggestions:"
echo "1. Check if port 8080 is open in firewall"
echo "2. Verify Next.js is running on correct port"
echo "3. Check PM2 logs for errors"
echo "4. Try accessing: http://$VPS_HOST:8080"
