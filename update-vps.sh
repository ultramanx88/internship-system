#!/bin/bash

# Quick Update Script for VPS
# Usage: ./update-vps.sh

echo "🔄 Quick update to VPS..."
echo "📋 Password: rp4QkUUvmbi5qB"
echo ""

ssh root@203.170.129.199 << 'EOF'
echo "🔍 Connected to VPS"

# Try different common project paths
if [ -d "/var/www/internship-system" ]; then
    cd /var/www/internship-system
    echo "📁 Found project at /var/www/internship-system"
elif [ -d "/home/internship-system" ]; then
    cd /home/internship-system
    echo "📁 Found project at /home/internship-system"
elif [ -d "/root/internship-system" ]; then
    cd /root/internship-system
    echo "📁 Found project at /root/internship-system"
else
    echo "❌ Project directory not found!"
    echo "📍 Current directory contents:"
    ls -la
    exit 1
fi

echo "📍 Working in: $(pwd)"

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Restart PM2
echo "🔄 Restarting PM2..."
pm2 restart internship-system

# Show status
echo "📊 PM2 Status:"
pm2 status

echo "✅ Update completed!"
EOF

echo "🎉 Done!"