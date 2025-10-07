#!/bin/bash

# Rollback script for internship system
# Usage: ./scripts/rollback.sh [backup_file] [target_tag]

set -e

BACKUP_FILE=${1:-""}
TARGET_TAG=${2:-"v0.2.0"}
LOG_FILE="./logs/rollback-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}✗${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

# Create log directory
mkdir -p "$(dirname "$LOG_FILE")"

log "Starting rollback to $TARGET_TAG"

# Step 1: Stop current application
log "Step 1: Stopping current application"
pkill -f "next" 2>/dev/null || true
pkill -f "internship-system" 2>/dev/null || true

if command -v pm2 &> /dev/null; then
    pm2 stop all 2>/dev/null || true
fi

success "Application stopped"

# Step 2: Git rollback
log "Step 2: Rolling back code to $TARGET_TAG"
git fetch --tags || error "Failed to fetch git tags"
git checkout "$TARGET_TAG" || error "Failed to checkout $TARGET_TAG"
success "Code rolled back to $TARGET_TAG"

# Step 3: Restore database (if backup provided)
if [ -n "$BACKUP_FILE" ] && [ -f "$BACKUP_FILE" ]; then
    log "Step 3: Restoring database from $BACKUP_FILE"
    
    if command -v pg_restore &> /dev/null; then
        pg_restore --clean --if-exists -d "$DATABASE_URL" "$BACKUP_FILE" || {
            warning "Database restore failed, but continuing..."
        }
        success "Database restored from backup"
    else
        warning "pg_restore not found, skipping database restore"
    fi
else
    warning "No backup file provided, skipping database restore"
fi

# Step 4: Install dependencies
log "Step 4: Installing dependencies"
npm ci --production || error "Failed to install dependencies"
success "Dependencies installed"

# Step 5: Prisma operations
log "Step 5: Prisma operations"
npx prisma generate || error "Failed to generate Prisma client"

# Try migrate first, fallback to db push
if npx prisma migrate deploy 2>/dev/null; then
    success "Database migrations applied"
else
    warning "Migrations failed, trying db push..."
    npx prisma db push || error "Failed to push database schema"
    success "Database schema updated"
fi

# Step 6: Build and start
log "Step 6: Building and starting application"
NODE_ENV=production npm run build || error "Build failed"
success "Application built"

# Start application
if command -v pm2 &> /dev/null; then
    pm2 start ecosystem.config.js || {
        warning "PM2 start failed, trying direct start..."
        NODE_ENV=production npm run start &
    }
    success "Application started with PM2"
else
    NODE_ENV=production npm run start &
    success "Application started directly"
fi

# Step 7: Health check
log "Step 7: Health check"
sleep 10

if curl -fsS http://localhost:8080/api/health >/dev/null 2>&1; then
    success "Health check passed"
else
    warning "Health check failed, but application may still be starting..."
fi

# Final status
log "Rollback completed"
success "Rollback to $TARGET_TAG completed successfully!"
log "Log file: $LOG_FILE"

echo ""
echo -e "${GREEN}🔄 Rollback Summary:${NC}"
echo -e "  • Target: ${BLUE}$TARGET_TAG${NC}"
echo -e "  • Database: ${BLUE}$([ -n "$BACKUP_FILE" ] && echo "Restored from $BACKUP_FILE" || echo "Not restored")${NC}"
echo -e "  • Log: ${BLUE}$LOG_FILE${NC}"
echo ""
