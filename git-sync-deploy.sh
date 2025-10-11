#!/bin/bash

# =============================================================================
# 🔄 Git Sync & Deploy Script
# =============================================================================
# This script syncs Git and deploys latest code to VPS

set -e

# Server Configuration
SERVER_IP="203.170.129.199"
SERVER_USER="root"
SERVER_PASSWORD="rp4QkUUvmbi5qB"
SERVER_PATH="/var/www/internship-system"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Header
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                🔄 GIT SYNC & DEPLOY SCRIPT                ║"
echo "║                 Sync Git and Deploy Latest Code           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to check Git status
check_git_status() {
    log "📊 Checking Git status..."
    
    echo "🔍 Local Git status:"
    git status --porcelain
    
    echo ""
    echo "📋 Local latest commits:"
    git log --oneline -3
    
    echo ""
    echo "🔍 VPS Git status:"
    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system
echo "📋 VPS latest commits:"
git log --oneline -3
echo ""
echo "🔍 VPS Git status:"
git status --porcelain
EOF
}

# Function to commit local changes
commit_local_changes() {
    log "💾 Committing local changes..."
    
    echo "📝 Adding all changes..."
    git add .
    
    echo "💬 Committing with message..."
    git commit -m "🧹 Cleanup: Remove unnecessary files and add new deployment scripts
    
- Removed old deployment scripts and documentation files
- Added new deployment and management scripts
- Updated application workflow with recordExternalResponse function
- Added disk cleanup and container management tools"
    
    success "Local changes committed"
}

# Function to push to remote
push_to_remote() {
    log "🚀 Pushing to remote repository..."
    
    git push origin main
    
    success "Pushed to remote repository"
}

# Function to sync VPS with latest code
sync_vps_code() {
    log "🔄 Syncing VPS with latest code..."
    
    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

echo "🔄 Pulling latest changes..."
git fetch origin
git reset --hard origin/main

echo "📋 VPS now at commit:"
git log --oneline -1

echo "🔍 Checking for changes..."
git status --porcelain
EOF
    
    success "VPS synced with latest code"
}

# Function to check API differences
check_api_differences() {
    log "🔍 Checking API differences..."
    
    echo "📋 API routes that changed:"
    git diff HEAD~5..HEAD --name-only | grep "api/" | head -10
    
    echo ""
    echo "📋 Database schema changes:"
    git diff HEAD~5..HEAD --name-only | grep -E "(schema|migration)" | head -5
    
    echo ""
    echo "📋 Source code changes:"
    git diff HEAD~5..HEAD --name-only | grep -E "\.(ts|tsx)$" | head -10
}

# Function to deploy to VPS
deploy_to_vps() {
    log "🚀 Deploying to VPS..."
    
    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

echo "🛑 Stopping containers..."
docker-compose down

echo "🔧 Building new image..."
docker-compose build --no-cache

echo "🚀 Starting containers..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 30

echo "🔄 Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy

echo "🌱 Seeding database if needed..."
docker-compose exec -T app npm run db:seed

echo "🧪 Testing API..."
sleep 10
curl -s http://localhost:8081/api/health || echo "API test failed"

echo "✅ Deployment completed"
EOF
    
    success "Deployed to VPS"
}

# Function to test deployment
test_deployment() {
    log "🧪 Testing deployment..."
    
    echo "🔍 Testing local API..."
    curl -s http://localhost:3000/api/health 2>/dev/null || echo "Local API not running"
    
    echo ""
    echo "🔍 Testing VPS API..."
    curl -s http://${SERVER_IP}:8081/api/health 2>/dev/null || echo "VPS API not accessible"
    
    echo ""
    echo "🔍 Testing VPS website..."
    curl -s -I http://${SERVER_IP}/ | head -3 || echo "VPS website not accessible"
}

# Main menu
case "${1:-status}" in
    "status")
        check_git_status
        ;;
    "commit")
        commit_local_changes
        ;;
    "push")
        push_to_remote
        ;;
    "sync")
        sync_vps_code
        ;;
    "deploy")
        deploy_to_vps
        ;;
    "test")
        test_deployment
        ;;
    "full")
        check_git_status
        echo ""
        commit_local_changes
        echo ""
        push_to_remote
        echo ""
        sync_vps_code
        echo ""
        deploy_to_vps
        echo ""
        test_deployment
        ;;
    "help")
        echo -e "${CYAN}Usage: $0 [command]${NC}"
        echo ""
        echo "Commands:"
        echo "  status    - Check Git status (default)"
        echo "  commit    - Commit local changes"
        echo "  push      - Push to remote repository"
        echo "  sync      - Sync VPS with latest code"
        echo "  deploy    - Deploy to VPS"
        echo "  test      - Test deployment"
        echo "  full      - Full sync and deploy process"
        echo "  help      - Show this help"
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac

success "Git sync and deploy completed"
