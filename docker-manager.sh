#!/bin/bash

# =============================================================================
# 🔍 Docker Container Management Script
# =============================================================================
# This script helps manage Docker containers and prevents duplication

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
echo "║                🔍 DOCKER CONTAINER MANAGER                   ║"
echo "║                 Prevent Container Duplication               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to show container status
show_status() {
    log "📊 Current Container Status:"
    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

echo "🐳 Docker Containers:"
docker-compose ps

echo ""
echo "📈 Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

echo ""
echo "💾 Disk Usage:"
df -h /var/www/internship-system

echo ""
echo "🗂️  Container Images:"
docker images | grep internship

echo ""
echo "🌐 Network Status:"
docker network ls | grep internship
EOF
}

# Function to clean up duplicate containers
cleanup_duplicates() {
    log "🧹 Cleaning up duplicate containers..."
    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

echo "🛑 Stopping all internship containers..."
docker-compose down

echo "🗑️  Removing orphaned containers..."
docker-compose down --remove-orphans

echo "🧹 Cleaning up unused Docker resources..."
docker system prune -f

echo "📦 Removing unused images..."
docker image prune -f

echo "✅ Cleanup completed"
EOF
    success "Duplicate containers cleaned up"
}

# Function to restart services safely
restart_services() {
    log "🔄 Restarting services safely..."
    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

echo "🛑 Gracefully stopping services..."
docker-compose stop

echo "⏳ Waiting 10 seconds..."
sleep 10

echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 30

echo "🔍 Checking service status..."
docker-compose ps

echo "🧪 Testing API endpoints..."
sleep 10

HEALTH_RESPONSE=$(curl -s http://localhost:8080/api/health 2>/dev/null || echo "failed")
if [[ $HEALTH_RESPONSE == *"healthy"* ]]; then
    echo "✅ Health check passed"
else
    echo "⚠️  Health check failed: $HEALTH_RESPONSE"
fi
EOF
    success "Services restarted safely"
}

# Function to check for duplicates
check_duplicates() {
    log "🔍 Checking for duplicate containers..."
    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

echo "🔍 Checking for duplicate containers..."
CONTAINER_COUNT=$(docker ps -a --filter "name=internship" | wc -l)
echo "Total internship containers: $((CONTAINER_COUNT - 1))"

echo ""
echo "📋 All internship containers:"
docker ps -a --filter "name=internship" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔍 Checking for duplicate images..."
docker images | grep internship

echo ""
echo "🌐 Checking port usage..."
netstat -tlnp | grep -E ":(8080|5432|6379|80|443)" || echo "No ports in use"
EOF
}

# Function to show logs
show_logs() {
    log "📋 Showing container logs..."
    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

echo "📋 App container logs (last 50 lines):"
docker-compose logs --tail=50 app

echo ""
echo "📋 Database container logs (last 20 lines):"
docker-compose logs --tail=20 postgres

echo ""
echo "📋 Nginx container logs (last 20 lines):"
docker-compose logs --tail=20 nginx
EOF
}

# Main menu
case "${1:-status}" in
    "status")
        show_status
        ;;
    "cleanup")
        cleanup_duplicates
        show_status
        ;;
    "restart")
        restart_services
        show_status
        ;;
    "check")
        check_duplicates
        ;;
    "logs")
        show_logs
        ;;
    "help")
        echo -e "${CYAN}Usage: $0 [command]${NC}"
        echo ""
        echo "Commands:"
        echo "  status   - Show current container status (default)"
        echo "  cleanup  - Clean up duplicate containers"
        echo "  restart  - Restart services safely"
        echo "  check    - Check for duplicate containers"
        echo "  logs     - Show container logs"
        echo "  help     - Show this help"
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac

success "Docker container management completed"
