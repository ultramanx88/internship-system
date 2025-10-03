#!/bin/bash

# Safe Update Script for VPS
# Only pulls code and restarts PM2 - NO BUILD
# Usage: ./safe-update.sh [--seed] [--import]
# Options:
#   --seed    Run database seed after update
#   --import  Run database import after update

# Show help if requested
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "Safe Update Script for VPS"
    echo ""
    echo "Usage: ./safe-update.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --seed      Run database seed after update (adds sample data)"
    echo "  --import    Run database import after update (imports from file)"
    echo "  --help, -h  Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./safe-update.sh                # Basic update only"
    echo "  ./safe-update.sh --seed         # Update + seed data"
    echo "  ./safe-update.sh --import       # Update + import data"
    echo "  npm run deploy:safe             # Basic update"
    echo "  npm run deploy:safe:seed        # Update + seed"
    echo ""
    exit 0
fi

# Parse command line arguments
SEED_DATA=false
IMPORT_DATA=false

for arg in "$@"; do
    case $arg in
        --seed)
            SEED_DATA=true
            shift
            ;;
        --import)
            IMPORT_DATA=true
            shift
            ;;
        *)
            # Unknown option
            ;;
    esac
done

echo "🔄 Safe updating VPS (No Build)..."
if [ "$SEED_DATA" = true ]; then
    echo "🌱 Will run database seed after update"
fi
if [ "$IMPORT_DATA" = true ]; then
    echo "📥 Will run database import after update"
fi

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

# Switch to production schema (if exists)
if [ -f "prisma/schema.production.prisma" ]; then
    echo "🔄 Switching to PostgreSQL schema..."
    cp prisma/schema.production.prisma prisma/schema.prisma
    echo "✅ Using PostgreSQL schema"
fi

# Copy production environment (if exists)
if [ -f ".env.production" ]; then
    echo "🔧 Setting up production environment..."
    cp .env.production .env
    echo "✅ Production environment configured"
fi

# Only generate Prisma client (no build)
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy || {
    echo "⚠️  Migration failed, trying db push..."
    npx prisma db push
}
EOF

# Pass arguments to the remote script
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << EOF
# Data management operations
if [ "$SEED_DATA" = true ]; then
    echo "🌱 Running database seed..."
    cd "$PROJECT_DIR"
    npm run db:seed || {
        echo "⚠️  Seed failed, trying alternative..."
        npx tsx prisma/seed.ts
    }
    echo "✅ Database seed completed"
fi

if [ "$IMPORT_DATA" = true ]; then
    echo "📥 Running database import..."
    cd "$PROJECT_DIR"
    if [ -f "scripts/import-data.ts" ]; then
        npm run db:import || npx tsx scripts/import-data.ts
        echo "✅ Database import completed"
    else
        echo "⚠️  Import script not found, skipping..."
    fi
fi

# Restart PM2
echo "🔄 Restarting PM2..."
pm2 restart internship-system || {
    echo "⚠️  Starting new PM2 process..."
    pm2 start npm --name "internship-system" -- start
}

# Show status
echo "📊 PM2 Status:"
pm2 status

echo "✅ Safe update completed!"
EOF

echo "🎉 Safe update finished!"