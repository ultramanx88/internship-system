#!/bin/bash

# Auto Update Script for VPS (No password prompt)
# Usage: ./auto-update-vps.sh

echo "🚀 Auto updating VPS..."

# VPS Configuration
VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PASSWORD="rp4QkUUvmbi5qB"

echo "📡 Connecting to VPS..."

sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
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

echo "🎉 Auto update finished!"