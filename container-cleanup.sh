#!/bin/bash

# =============================================================================
# 🧹 Container Cleanup Script
# =============================================================================
# This script removes duplicate containers and fixes issues

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
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Header
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                🧹 CONTAINER CLEANUP SCRIPT                  ║"
echo "║                 Remove Duplicates & Fix Issues             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to show current status
show_status() {
    log "📊 Current Container Status:"
    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

echo "🐳 All Docker Containers:"
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"

echo ""
echo "📦 Docker Images:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

echo ""
echo "🌐 Port Usage:"
netstat -tlnp | grep -E ":(80|443|8080|8081|5432|5433|6379)" || echo "No ports in use"

echo ""
echo "💾 Disk Usage:"
df -h /var/www/internship-system
EOF
}

# Function to clean up everything
cleanup_all() {
    log "🧹 Cleaning up all containers and images..."
    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

echo "🛑 Stopping all containers..."
docker-compose down 2>/dev/null || true

echo "🗑️  Removing all internship containers..."
docker ps -a --filter "name=internship" --format "{{.Names}}" | xargs -r docker rm -f

echo "🧹 Cleaning up Docker system..."
docker system prune -f

echo "📦 Removing unused images..."
docker image prune -f

echo "🗂️  Removing unused volumes..."
docker volume prune -f

echo "🌐 Removing unused networks..."
docker network prune -f

echo "✅ Cleanup completed"
EOF
    success "All containers and images cleaned up"
}

# Function to restart with clean state
restart_clean() {
    log "🚀 Restarting with clean state..."
    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

echo "🔧 Ensuring environment configuration..."
if [ ! -f "docker.env" ]; then
    cat > docker.env << 'ENVEOF'
# Clean Environment Configuration
NODE_ENV=production
PORT=8080

# Database Configuration
DATABASE_URL=postgresql://postgres:password@postgres:5432/internship_system?schema=public

# NextAuth Configuration
NEXTAUTH_URL=https://internship.samartsolution.com
NEXTAUTH_SECRET=your-production-secret-key-here

# Application Configuration
APP_URL=https://internship.samartsolution.com
ENVEOF
fi

echo "🚀 Starting services with clean state..."
docker-compose up -d --build

echo "⏳ Waiting for services to be ready..."
sleep 30

echo "🔍 Checking service status..."
docker-compose ps

echo "🔄 Running database migration..."
docker-compose exec -T app npx prisma migrate deploy 2>/dev/null || echo "No migrations to apply"

echo "🌱 Checking database data..."
USER_COUNT=$(docker-compose exec -T postgres psql -U postgres -d internship_system -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' \n' || echo "0")

if [ "$USER_COUNT" = "0" ]; then
    echo "📊 Database is empty, running seed data..."
    docker-compose exec -T app npm run db:seed
else
    echo "✅ Database has $USER_COUNT users"
fi

echo "🧪 Testing API endpoints..."
sleep 10

# Test health endpoint
HEALTH_RESPONSE=$(curl -s http://localhost:8080/api/health 2>/dev/null || echo "failed")
if [[ $HEALTH_RESPONSE == *"healthy"* ]]; then
    echo "✅ Health check passed"
else
    echo "⚠️  Health check failed: $HEALTH_RESPONSE"
fi

echo "✅ Clean restart completed"
EOF
    success "Services restarted with clean state"
}

# Function to fix nginx issue
fix_nginx() {
    log "🔧 Fixing Nginx configuration..."
    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

echo "🔍 Checking Nginx container status..."
docker-compose ps nginx

echo "🔄 Restarting Nginx container..."
docker-compose restart nginx

echo "⏳ Waiting for Nginx to start..."
sleep 10

echo "🔍 Checking Nginx logs..."
docker-compose logs nginx

echo "🌐 Testing Nginx..."
NGINX_RESPONSE=$(curl -s http://localhost:8081 2>/dev/null || echo "failed")
if [[ $NGINX_RESPONSE != "failed" ]]; then
    echo "✅ Nginx is responding"
else
    echo "⚠️  Nginx is not responding"
fi
EOF
    success "Nginx configuration fixed"
}

# Main menu
case "${1:-status}" in
    "status")
        show_status
        ;;
    "cleanup")
        cleanup_all
        show_status
        ;;
    "restart")
        restart_clean
        show_status
        ;;
    "fix-nginx")
        fix_nginx
        show_status
        ;;
    "full-reset")
        cleanup_all
        restart_clean
        fix_nginx
        show_status
        ;;
    "help")
        echo -e "${CYAN}Usage: $0 [command]${NC}"
        echo ""
        echo "Commands:"
        echo "  status      - Show current container status (default)"
        echo "  cleanup     - Remove all containers and images"
        echo "  restart     - Restart with clean state"
        echo "  fix-nginx   - Fix Nginx configuration"
        echo "  full-reset  - Complete cleanup and restart"
        echo "  help        - Show this help"
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac

success "Container cleanup completed"
