#!/bin/bash

# 🚀 PULL DEPLOY SCRIPT
# Simple and fast deployment to VPS
# Usage: ./scripts/pull-deploy.sh

set -e

# Configuration
VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PASSWORD="rp4QkUUvmbi5qB"
VPS_PROJECT_DIR="/var/www/internship-system"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

echo "🚀 Pull Deploy Script v1.0"
echo "=========================="

# Step 1: Commit and push local changes
log_info "Step 1: Committing and pushing local changes..."
git add .
if git diff --staged --quiet; then
    log_info "No changes to commit"
else
    read -p "📝 Enter commit message (or press Enter for auto): " commit_msg
    if [ -z "$commit_msg" ]; then
        commit_msg="Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    git commit -m "$commit_msg"
    log_success "Changes committed: $commit_msg"
fi

git push origin main
log_success "Code pushed to repository"

# Step 2: Deploy to VPS
log_info "Step 2: Deploying to VPS..."

DEPLOY_OUTPUT=$(sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
set -e

cd /var/www/internship-system
echo "📍 Working in: $(pwd)"

# Stash any local changes to avoid conflicts
echo "🔄 Stashing local changes..."
git stash || true

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Switch to production schema
echo "🔄 Switching to PostgreSQL schema..."
if [ -f "prisma/schema.production.prisma" ]; then
    cp prisma/schema.production.prisma prisma/schema.prisma
    echo "✅ Using PostgreSQL schema"
fi

# Copy production environment
echo "🔧 Setting up production environment..."
if [ -f ".env.production" ]; then
    cp .env.production .env
    echo "✅ Production environment configured"
fi

# Set production environment variables
export NODE_ENV=production
export NEXT_DISABLE_SOURCEMAPS=1

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations (this is Step 3 - always run)
echo "🗄️ Running database migrations..."
npx prisma db push --accept-data-loss

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build application
echo "🏗️ Building application..."
npm run build

# Restart PM2 process
echo "🔄 Restarting PM2 process..."
pm2 restart internship-system || pm2 start npm --name "internship-system" -- start

# Save PM2 configuration
pm2 save

echo "✅ Deployment completed successfully"
EOF
 2>&1)

# Check if deployment was successful
if [ $? -eq 0 ] && echo "$DEPLOY_OUTPUT" | grep -q "✅ Deployment completed successfully"; then
    log_success "Deployment successful!"
else
    log_error "Deployment failed!"
    echo "Error details:"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

# Step 3: Health check
log_info "Step 3: Running health check..."
sleep 5

HEALTH_RESPONSE=$(sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" "curl -s http://localhost:8080/api/health" 2>/dev/null || echo "{}")

if echo "$HEALTH_RESPONSE" | grep -q '"success":true'; then
    log_success "Health check passed!"
    echo "🌐 VPS URL: http://$VPS_HOST:8080"
else
    log_warning "Health check failed, but deployment may still be starting..."
    echo "🌐 VPS URL: http://$VPS_HOST:8080"
fi

# Final summary
echo ""
echo "📊 PULL DEPLOY SUMMARY:"
echo "======================="
echo "✅ Code pushed to repository"
echo "✅ VPS updated with latest code"
echo "✅ Database migrations applied"
echo "✅ Application restarted"
echo "🌐 VPS URL: http://$VPS_HOST:8080"
echo ""
log_success "Pull deploy completed! 🎉"
