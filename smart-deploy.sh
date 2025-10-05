#!/bin/bash

# Smart Deployment Script with Error Detection
# Handles different databases for local vs VPS with comprehensive error handling
# Usage: ./smart-deploy.sh

echo "🚀 Smart Deployment to VPS with Error Detection..."

# VPS Configuration
VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PASSWORD="rp4QkUUvmbi5qB"

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

echo "📡 Connecting to VPS..."

# Execute deployment with comprehensive error handling
log_info "Starting deployment with error detection..."

DEPLOY_SUCCESS=false
ERROR_LOG=""

# Execute deployment with error capture
ERROR_LOG=$(sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
set -e  # Exit on any error

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
if ! git pull origin main; then
    echo "❌ Git pull failed"
    exit 1
fi

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

# Set production environment variables
export NODE_ENV=production
export NEXT_DISABLE_SOURCEMAPS=1

# Generate Prisma client
echo "🔧 Generating Prisma client..."
if ! npx prisma generate; then
    echo "❌ Prisma generate failed"
    exit 1
fi

# Run database migrations
echo "🗄️ Running database migrations..."
if ! npx prisma db push --accept-data-loss; then
    echo "❌ Database migration failed"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
if ! npm install; then
    echo "❌ npm install failed"
    exit 1
fi

# Build application
echo "🏗️ Building application..."
if ! npm run build; then
    echo "❌ Build failed"
    exit 1
fi

# Stop existing PM2 process
echo "🔄 Managing PM2 process..."
pm2 delete internship-system >/dev/null 2>&1 || true

# Start with enhanced settings
echo "🚀 Starting application with PM2..."
if ! pm2 start npm --name "internship-system" -- start --instances 1 --max-memory-restart 350M --update-env; then
    echo "❌ PM2 start failed"
    exit 1
fi

# Save PM2 configuration
pm2 save

echo "✅ Deployment completed successfully"
EOF
2>&1)

# Check deployment result
if [ $? -eq 0 ] && echo "$ERROR_LOG" | grep -q "✅ Deployment completed successfully"; then
    DEPLOY_SUCCESS=true
    log_success "Code deployment successful!"
else
    log_error "Code deployment failed!"
    echo "Error details:"
    echo "$ERROR_LOG"
fi

# Comprehensive health checks
log_info "Running comprehensive health checks..."

HEALTH_CHECKS_PASSED=0
TOTAL_CHECKS=0

# Check 1: PM2 Status
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
log_info "Health Check 1: PM2 Status"
PM2_STATUS=$(sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" "cd /var/www/internship-system && pm2 status" 2>/dev/null)
if echo "$PM2_STATUS" | grep -q "online"; then
    log_success "✅ PM2 process is online"
    HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1))
else
    log_error "❌ PM2 process is not online"
    echo "$PM2_STATUS"
fi

# Check 2: Port 8080 listening
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
log_info "Health Check 2: Port 8080 Listening"
PORT_CHECK=$(sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" "ss -ltnp | grep :8080" 2>/dev/null)
if [ -n "$PORT_CHECK" ]; then
    log_success "✅ Port 8080 is listening"
    HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1))
else
    log_error "❌ Port 8080 is not listening"
fi

# Check 3: Application HTTP response
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
log_info "Health Check 3: Application HTTP Response"
HTTP_RESPONSE=$(sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" "curl -s -o /dev/null -w '%{http_code}' http://localhost:8080" 2>/dev/null)
if [ "$HTTP_RESPONSE" = "200" ] || [ "$HTTP_RESPONSE" = "302" ]; then
    log_success "✅ Application responds with HTTP $HTTP_RESPONSE"
    HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1))
else
    log_error "❌ Application HTTP response: $HTTP_RESPONSE"
fi

# Check 4: Database connectivity
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
log_info "Health Check 4: Database Connectivity"
DB_CHECK=$(sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" "cd /var/www/internship-system && PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -c 'SELECT 1;' -t" 2>/dev/null)
if [ "$DB_CHECK" = "1" ]; then
    log_success "✅ Database connection successful"
    HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1))
else
    log_error "❌ Database connection failed"
fi

# Check 5: Nginx status (if applicable)
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
log_info "Health Check 5: Nginx Status"
NGINX_STATUS=$(sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" "systemctl is-active nginx" 2>/dev/null)
if [ "$NGINX_STATUS" = "active" ]; then
    log_success "✅ Nginx is active"
    HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1))
else
    log_warning "⚠️  Nginx status: $NGINX_STATUS"
fi

# Error diagnosis and auto-fix
log_info "Error diagnosis and auto-fix..."

if [ $HEALTH_CHECKS_PASSED -lt $TOTAL_CHECKS ]; then
    log_warning "⚠️  Some health checks failed ($HEALTH_CHECKS_PASSED/$TOTAL_CHECKS passed)"
    
    # Auto-fix attempts
    log_info "Attempting auto-fixes..."
    
    # Fix 1: Restart PM2 if not online
    if ! echo "$PM2_STATUS" | grep -q "online"; then
        log_info "Auto-fix: Restarting PM2..."
        sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
cd /var/www/internship-system
pm2 delete internship-system || true
pm2 start npm --name "internship-system" -- start
pm2 save
EOF
    fi
    
    # Fix 2: Check and fix port binding
    if [ -z "$PORT_CHECK" ]; then
        log_info "Auto-fix: Checking port binding..."
        sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
cd /var/www/internship-system
# Kill any process on port 8080
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
# Restart PM2
pm2 restart internship-system || pm2 start npm --name "internship-system" -- start
EOF
    fi
    
    # Re-run health checks after fixes
    log_info "Re-running health checks after fixes..."
    sleep 5
    
    # Quick re-check
    FINAL_HTTP=$(sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" "curl -s -o /dev/null -w '%{http_code}' http://localhost:8080" 2>/dev/null)
    if [ "$FINAL_HTTP" = "200" ] || [ "$FINAL_HTTP" = "302" ]; then
        log_success "✅ Auto-fix successful! Application now responding"
    else
        log_error "❌ Auto-fix failed. Manual intervention required."
        
        # Show diagnostic information
        log_info "Diagnostic information:"
        sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
echo "=== PM2 Status ==="
pm2 status
echo ""
echo "=== PM2 Logs (last 50 lines) ==="
pm2 logs internship-system --lines 50 --nostream || true
echo ""
echo "=== Port Status ==="
ss -ltnp | grep :8080 || echo "Port 8080 not listening"
echo ""
echo "=== Nginx Status ==="
systemctl status nginx --no-pager || true
EOF
    fi
else
    log_success "🎉 All health checks passed! ($HEALTH_CHECKS_PASSED/$TOTAL_CHECKS)"
fi

# Final summary
echo ""
echo "📊 SMART DEPLOY SUMMARY:"
echo "========================"
echo "Code Deploy: $([ "$DEPLOY_SUCCESS" = true ] && echo "✅ Successful" || echo "❌ Failed")"
echo "Health Checks: $HEALTH_CHECKS_PASSED/$TOTAL_CHECKS passed"
echo "Application URL: http://$VPS_HOST:8080"
echo ""

if [ "$DEPLOY_SUCCESS" = true ] && [ $HEALTH_CHECKS_PASSED -eq $TOTAL_CHECKS ]; then
    log_success "🎉 Smart Deploy completed successfully!"
else
    log_warning "⚠️  Smart Deploy completed with issues. Check logs above."
fi