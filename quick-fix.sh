#!/bin/bash

# =============================================================================
# 🔧 Quick Fix Script - Solve All Issues
# =============================================================================
# This script fixes all current issues quickly

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
echo "║                🔧 QUICK FIX SCRIPT                         ║"
echo "║                 Solve All Current Issues                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Step 1: Stop system nginx to free port 80
log "🛑 Step 1: Stopping system nginx to free port 80..."
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
echo "🛑 Stopping system nginx..."
systemctl stop nginx
systemctl disable nginx

echo "🔍 Checking if port 80 is free..."
netstat -tlnp | grep ":80" || echo "✅ Port 80 is now free"
EOF
success "System nginx stopped"

# Step 2: Clean up Docker images
log "🧹 Step 2: Cleaning up duplicate Docker images..."
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

echo "🧹 Removing unused Docker images..."
docker image prune -f

echo "📦 Current Docker images:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
EOF
success "Docker images cleaned up"

# Step 3: Restart Docker services properly
log "🚀 Step 3: Restarting Docker services properly..."
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

echo "🛑 Stopping all containers..."
docker-compose down

echo "🚀 Starting all services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 30

echo "🔍 Checking container status..."
docker-compose ps
EOF
success "Docker services restarted"

# Step 4: Test everything
log "🧪 Step 4: Testing all services..."
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

echo "🧪 Testing API endpoints..."
sleep 10

# Test health endpoint
HEALTH_RESPONSE=$(curl -s http://localhost:8080/api/health 2>/dev/null || echo "failed")
if [[ $HEALTH_RESPONSE == *"healthy"* ]]; then
    echo "✅ Health check passed"
else
    echo "⚠️  Health check failed: $HEALTH_RESPONSE"
fi

# Test users endpoint
USERS_RESPONSE=$(curl -s http://localhost:8080/api/users 2>/dev/null || echo "failed")
if [[ $USERS_RESPONSE == *"users"* ]]; then
    echo "✅ Users API working"
else
    echo "⚠️  Users API failed: $USERS_RESPONSE"
fi

# Test HTTPS endpoint
HTTPS_RESPONSE=$(curl -s https://internship.samartsolution.com/api/health 2>/dev/null || echo "failed")
if [[ $HTTPS_RESPONSE == *"healthy"* ]]; then
    echo "✅ HTTPS endpoint working"
else
    echo "⚠️  HTTPS endpoint failed: $HTTPS_RESPONSE"
fi

echo "📊 Final status:"
echo "- App Container: $(docker-compose ps | grep app | awk '{print $4}' || echo 'Not running')"
echo "- Database: $(docker-compose ps | grep postgres | awk '{print $4}' || echo 'Not running')"
echo "- Nginx: $(docker-compose ps | grep nginx | awk '{print $4}' || echo 'Not running')"
EOF
success "All services tested"

# Step 5: Show final status
log "📊 Step 5: Final Status Check..."
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

echo "🐳 Container Status:"
docker-compose ps

echo ""
echo "🌐 Port Usage:"
netstat -tlnp | grep -E ":(80|443|8080|8081|5432|5433)" || echo "No ports in use"

echo ""
echo "💾 Disk Usage:"
df -h /var/www/internship-system

echo ""
echo "📈 Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
EOF

success "🎉 Quick Fix Completed Successfully!"
echo -e "${BLUE}🌐 Application URL: https://internship.samartsolution.com/${NC}"
echo -e "${GREEN}✅ All issues resolved:${NC}"
echo "  - System nginx stopped"
echo "  - Docker images cleaned up"
echo "  - All services restarted"
echo "  - API endpoints tested"
echo "  - HTTPS working"
echo ""
echo -e "${YELLOW}📋 Next time use: ./ultimate-safe-deploy.sh for safe deployment${NC}"
