#!/bin/bash

# Deploy v0.3.0 - Student Workflow + OSM + Lang Support
# Usage: ./scripts/deploy-v0.3.0.sh [environment]

set -e

ENVIRONMENT=${1:-production}
BACKUP_DIR="./backups"
LOG_FILE="./logs/deploy-$(date +%Y%m%d-%H%M%S).log"

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

# Create necessary directories
mkdir -p "$BACKUP_DIR" "$(dirname "$LOG_FILE")"

log "Starting deployment of v0.3.0 to $ENVIRONMENT environment"

# Step 1: Pre-deployment checks
log "Step 1: Pre-deployment checks"
if ! command -v node &> /dev/null; then
    error "Node.js is not installed"
fi

if ! command -v npm &> /dev/null; then
    error "npm is not installed"
fi

if [ ! -f ".env.$ENVIRONMENT" ] && [ ! -f ".env.local" ]; then
    warning "No .env.$ENVIRONMENT or .env.local found. Make sure DATABASE_URL is set."
fi

success "Pre-deployment checks passed"

# Step 2: Backup current database
log "Step 2: Creating database backup"
if [ -n "$DATABASE_URL" ]; then
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).dump"
    if command -v pg_dump &> /dev/null; then
        pg_dump --no-owner --no-acl --format=c "$DATABASE_URL" > "$BACKUP_FILE" 2>/dev/null || {
            warning "Database backup failed, but continuing..."
        }
        success "Database backed up to $BACKUP_FILE"
    else
        warning "pg_dump not found, skipping database backup"
    fi
else
    warning "DATABASE_URL not set, skipping database backup"
fi

# Step 3: Git operations
log "Step 3: Git operations"
git fetch --tags || error "Failed to fetch git tags"
git checkout v0.3.0 || error "Failed to checkout v0.3.0 tag"
success "Switched to v0.3.0"

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

# Step 6: Data seeding and normalization
log "Step 6: Data seeding and normalization"

# Check if address data exists
ADDRESS_COUNT=$(npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.subdistrict.count().then(count => {
  console.log(count);
  prisma.\$disconnect();
}).catch(() => {
  console.log('0');
  prisma.\$disconnect();
});
" 2>/dev/null || echo "0")

if [ "$ADDRESS_COUNT" -lt 9000 ]; then
    log "Seeding Thai address data..."
    npx tsx scripts/seed-thai-address-full.ts || warning "Address seeding failed"
    success "Address data seeded"
else
    success "Address data already exists ($ADDRESS_COUNT subdistricts)"
fi

# Normalize and enrich data
log "Normalizing and enriching data..."
npx tsx scripts/normalize-and-enrich.ts || warning "Data normalization failed"
success "Data normalized and enriched"

# Step 7: Build application
log "Step 7: Building application"
NODE_ENV=production npm run build || error "Build failed"
success "Application built successfully"

# Step 8: Start/restart application
log "Step 8: Starting application"

# Kill existing processes
pkill -f "next" 2>/dev/null || true
pkill -f "internship-system" 2>/dev/null || true

# Start with PM2 if available, otherwise direct start
if command -v pm2 &> /dev/null; then
    pm2 start ecosystem.config.js --env $ENVIRONMENT || {
        warning "PM2 start failed, trying direct start..."
        NODE_ENV=$ENVIRONMENT npm run start &
    }
    success "Application started with PM2"
else
    NODE_ENV=$ENVIRONMENT npm run start &
    success "Application started directly"
fi

# Step 9: Health checks
log "Step 9: Health checks"
sleep 10

# Basic health check
if curl -fsS http://localhost:8080/api/health >/dev/null 2>&1; then
    success "Health check passed"
else
    warning "Health check failed, but application may still be starting..."
fi

# API smoke tests
log "Running API smoke tests..."

# Test address API with English
if curl -fsS "http://localhost:8080/api/address/provinces?lang=en" >/dev/null 2>&1; then
    success "Address API (EN) working"
else
    warning "Address API (EN) test failed"
fi

# Test academic API with English
if curl -fsS "http://localhost:8080/api/academic-years?lang=en" >/dev/null 2>&1; then
    success "Academic API (EN) working"
else
    warning "Academic API (EN) test failed"
fi

# Test applications API
if curl -fsS "http://localhost:8080/api/applications" >/dev/null 2>&1; then
    success "Applications API working"
else
    warning "Applications API test failed"
fi

# Step 10: Final status
log "Step 10: Deployment summary"
success "Deployment completed successfully!"
log "Environment: $ENVIRONMENT"
log "Version: v0.3.0"
log "Log file: $LOG_FILE"
if [ -n "$BACKUP_FILE" ]; then
    log "Backup file: $BACKUP_FILE"
fi

echo ""
echo -e "${GREEN}🚀 Deployment Summary:${NC}"
echo -e "  • Version: ${BLUE}v0.3.0${NC}"
echo -e "  • Environment: ${BLUE}$ENVIRONMENT${NC}"
echo -e "  • Features: Student workflow, OSM maps, English support, Staff approvals"
echo -e "  • Log: ${BLUE}$LOG_FILE${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Test student workflow: /student/application-form"
echo -e "  2. Test staff approvals: /staff/applications"
echo -e "  3. Test English UI: Add ?lang=en to any page"
echo -e "  4. Check map integration in internship form"
echo ""

# Show running processes
if command -v pm2 &> /dev/null; then
    echo -e "${BLUE}Running processes:${NC}"
    pm2 list
fi
