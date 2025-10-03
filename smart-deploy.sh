#!/bin/bash

# Smart Deployment Script
# Handles different databases for local vs VPS
# Usage: ./smart-deploy.sh

echo "🚀 Smart Deployment to VPS..."

# VPS Configuration
VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PASSWORD="rp4QkUUvmbi5qB"

echo "📡 Connecting to VPS..."

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

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Switch to production schema
echo "🔄 Switching to PostgreSQL schema..."
if [ -f "prisma/schema.production.prisma" ]; then
    cp prisma/schema.production.prisma prisma/schema.prisma
    echo "✅ Using PostgreSQL schema"
else
    echo "⚠️  Production schema not found, using current schema"
fi

# Copy production environment
echo "🔧 Setting up production environment..."
if [ -f ".env.production" ]; then
    cp .env.production .env
    echo "✅ Production environment configured"
else
    echo "⚠️  .env.production not found"
fi

# Generate Prisma client for PostgreSQL (only if schema changed)
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations (only if needed)
echo "🗄️ Running database migrations..."
npx prisma migrate deploy || {
    echo "⚠️  Migration failed, trying db push..."
    npx prisma db push
}

# Restart PM2
echo "🔄 Restarting PM2..."
pm2 restart internship-system || {
    echo "⚠️  Starting new PM2 process..."
    pm2 start npm --name "internship-system" -- start
}

# Show status
echo "📊 PM2 Status:"
pm2 status

echo "✅ Smart deployment completed!"
EOF

echo "🎉 Smart deployment finished!"