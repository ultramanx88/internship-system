#!/bin/bash

# =============================================================================
# 📊 VPS Status Checker Script
# =============================================================================
# This script checks VPS resources and prevents overfilling

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
echo "║                📊 VPS STATUS CHECKER                        ║"
echo "║                 Prevent Server Overfilling                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to check VPS resources
check_vps_resources() {
    log "📊 Checking VPS Resources..."
    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'

echo "💾 Disk Usage:"
df -h

echo ""
echo "🧠 Memory Usage:"
free -h

echo ""
echo "⚡ CPU Usage:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}'

echo ""
echo "🐳 Docker System Info:"
docker system df

echo ""
echo "📦 Docker Images:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

echo ""
echo "🐳 Running Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Size}}"

echo ""
echo "🗂️  Project Directory Size:"
du -sh /var/www/internship-system

echo ""
echo "📁 Largest Directories in Project:"
du -sh /var/www/internship-system/* | sort -hr | head -10

echo ""
echo "🌐 Network Connections:"
netstat -tlnp | grep -E ":(80|443|8080|5432|6379)"

echo ""
echo "🔍 Process List (Top 10 by Memory):"
ps aux --sort=-%mem | head -11

EOF
}

# Function to check if VPS is safe for deployment
check_deployment_safety() {
    log "🔍 Checking Deployment Safety..."
    
    # Get disk usage percentage
    DISK_USAGE=$(sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "df / | tail -1 | awk '{print \$5}' | sed 's/%//'")
    
    # Get memory usage percentage
    MEMORY_USAGE=$(sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "free | grep Mem | awk '{printf \"%.0f\", \$3/\$2 * 100.0}'")
    
    # Get Docker container count
    CONTAINER_COUNT=$(sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "docker ps -a | wc -l")
    CONTAINER_COUNT=$((CONTAINER_COUNT - 1))
    
    echo "📊 VPS Status Summary:"
    echo "  💾 Disk Usage: ${DISK_USAGE}%"
    echo "  🧠 Memory Usage: ${MEMORY_USAGE}%"
    echo "  🐳 Docker Containers: ${CONTAINER_COUNT}"
    
    # Safety checks
    if [ "$DISK_USAGE" -gt 85 ]; then
        error "❌ Disk usage too high (${DISK_USAGE}%). Please free up space before deploying."
    elif [ "$DISK_USAGE" -gt 75 ]; then
        warning "⚠️  Disk usage is high (${DISK_USAGE}%). Consider cleaning up."
    else
        success "✅ Disk usage is safe (${DISK_USAGE}%)"
    fi
    
    if [ "$MEMORY_USAGE" -gt 90 ]; then
        error "❌ Memory usage too high (${MEMORY_USAGE}%). Please free up memory before deploying."
    elif [ "$MEMORY_USAGE" -gt 80 ]; then
        warning "⚠️  Memory usage is high (${MEMORY_USAGE}%). Consider restarting services."
    else
        success "✅ Memory usage is safe (${MEMORY_USAGE}%)"
    fi
    
    if [ "$CONTAINER_COUNT" -gt 10 ]; then
        warning "⚠️  Many Docker containers running (${CONTAINER_COUNT}). Consider cleanup."
    else
        success "✅ Container count is reasonable (${CONTAINER_COUNT})"
    fi
}

# Function to clean up VPS
cleanup_vps() {
    log "🧹 Cleaning up VPS..."
    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'

echo "🧹 Starting VPS cleanup..."

echo "🐳 Cleaning Docker system..."
docker system prune -f

echo "📦 Removing unused Docker images..."
docker image prune -f

echo "🗑️  Removing unused Docker volumes..."
docker volume prune -f

echo "🧹 Cleaning package cache..."
apt-get clean
apt-get autoclean

echo "📁 Cleaning log files..."
find /var/log -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true
find /var/log -name "*.gz" -type f -mtime +7 -delete 2>/dev/null || true

echo "🗂️  Cleaning temporary files..."
rm -rf /tmp/*
rm -rf /var/tmp/*

echo "📊 Checking cleanup results..."
echo "💾 Disk usage after cleanup:"
df -h /

echo "🐳 Docker system after cleanup:"
docker system df

echo "✅ VPS cleanup completed"
EOF
    success "VPS cleanup completed"
}

# Function to show deployment recommendations
show_recommendations() {
    log "💡 Deployment Recommendations..."
    
    echo -e "${CYAN}📋 Safe Deployment Checklist:${NC}"
    echo "  1. ✅ Use 'safe-docker-deploy.sh' instead of regular docker-deploy"
    echo "  2. ✅ Check VPS resources before deploying"
    echo "  3. ✅ Use '--no-recreate' flag to prevent container duplication"
    echo "  4. ✅ Monitor disk usage (keep below 80%)"
    echo "  5. ✅ Monitor memory usage (keep below 85%)"
    echo ""
    
    echo -e "${YELLOW}⚠️  Warning Signs:${NC}"
    echo "  - Disk usage > 85%"
    echo "  - Memory usage > 90%"
    echo "  - More than 10 Docker containers"
    echo "  - Multiple containers with same name"
    echo ""
    
    echo -e "${GREEN}✅ Best Practices:${NC}"
    echo "  - Always backup before deployment"
    echo "  - Use graceful container stops"
    echo "  - Monitor logs after deployment"
    echo "  - Test API endpoints after deployment"
    echo "  - Clean up unused Docker resources regularly"
}

# Main menu
case "${1:-check}" in
    "check")
        check_vps_resources
        check_deployment_safety
        ;;
    "safety")
        check_deployment_safety
        ;;
    "cleanup")
        cleanup_vps
        check_vps_resources
        ;;
    "recommendations")
        show_recommendations
        ;;
    "help")
        echo -e "${CYAN}Usage: $0 [command]${NC}"
        echo ""
        echo "Commands:"
        echo "  check           - Check VPS resources and safety (default)"
        echo "  safety          - Check deployment safety only"
        echo "  cleanup         - Clean up VPS resources"
        echo "  recommendations - Show deployment recommendations"
        echo "  help            - Show this help"
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac

success "VPS status check completed"
