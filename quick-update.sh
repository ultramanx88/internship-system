#!/bin/bash

# Quick Update Script for VPS
# Usage: ./quick-update.sh

echo "🚀 Quick updating VPS..."

# VPS Configuration
VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PASSWORD="rp4QkUUvmbi5qB"

echo "📡 Connecting to VPS and updating..."

# Single command execution
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" '
echo "🔍 Connected to VPS";
cd /var/www/internship-system || cd /home/internship-system || cd /root/internship-system || { echo "❌ Project not found"; exit 1; };
echo "📍 Working in: $(pwd)";
echo "📥 Pulling code...";
git pull origin main;
echo "🔄 Restarting PM2...";
pm2 restart internship-system;
echo "📊 PM2 Status:";
pm2 status;
echo "✅ Update completed!";
'

echo "🎉 Quick update finished!"