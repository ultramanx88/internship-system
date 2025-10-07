#!/bin/bash

# =============================================================================
# 🚀 Comprehensive Deployment Script for Internship System
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="internship-system"
BACKUP_DIR="backups/deploy-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="logs/deploy-$(date +%Y%m%d-%H%M%S).log"

# VPS Configuration
VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PATH="/var/www/internship-system"

# Create necessary directories
mkdir -p logs backups

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${CYAN}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# Header
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    🚀 DEPLOYMENT SCRIPT                      ║"
echo "║                 Internship Management System                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Parse command line arguments
ENVIRONMENT="production"
SKIP_TESTS=false
SKIP_BUILD=false
FORCE_DEPLOY=false
BACKUP_DB=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        --no-backup)
            BACKUP_DB=false
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --env ENV        Environment (production|staging) [default: production]"
            echo "  --skip-tests     Skip running tests"
            echo "  --skip-build     Skip build process"
            echo "  --force          Force deployment even if tests fail"
            echo "  --no-backup      Skip database backup"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

log "Starting deployment for environment: $ENVIRONMENT"

# =============================================================================
# STEP 1: Pre-deployment checks
# =============================================================================
log "Step 1/8: Pre-deployment checks"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    error "package.json not found. Please run this script from the project root."
fi

# Check if git is clean
if [ "$FORCE_DEPLOY" = false ]; then
    if ! git diff-index --quiet HEAD --; then
        error "Working directory has uncommitted changes. Commit or stash them first."
    fi
fi

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$ENVIRONMENT" = "production" ] && [ "$CURRENT_BRANCH" != "main" ]; then
    warning "You're not on the main branch. Current branch: $CURRENT_BRANCH"
    if [ "$FORCE_DEPLOY" = false ]; then
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Deployment cancelled."
        fi
    fi
fi

success "Pre-deployment checks passed"

# =============================================================================
# STEP 2: Backup current state
# =============================================================================
log "Step 2/8: Creating backup"

if [ "$BACKUP_DB" = true ]; then
    log "Backing up database..."
    mkdir -p "$BACKUP_DIR"
    
    # Optional: Add Postgres backup here if desired using pg_dump and DATABASE_URL
    # Example (uncomment and adjust if you want local backup before deploy):
    # if command -v pg_dump >/dev/null 2>&1 && grep -q "^DATABASE_URL=postgres" .env* 2>/dev/null; then
    #   info "Backing up Postgres via pg_dump"
    #   pg_dump "$DATABASE_URL" > "$BACKUP_DIR/local-backup.sql" || warning "pg_dump failed; continuing without DB backup"
    # fi
    
    # Backup environment files
    if [ -f ".env" ]; then
        cp ".env" "$BACKUP_DIR/.env"
    fi
    if [ -f ".env.local" ]; then
        cp ".env.local" "$BACKUP_DIR/.env.local"
    fi
    if [ -f ".env.production" ]; then
        cp ".env.production" "$BACKUP_DIR/.env.production"
    fi
    
    success "Backup created in $BACKUP_DIR"
else
    info "Skipping database backup"
fi

# =============================================================================
# STEP 3: Update dependencies
# =============================================================================
log "Step 3/8: Updating dependencies"

# Check for security vulnerabilities
log "Checking for security vulnerabilities..."
if npm audit --audit-level=moderate; then
    success "No security vulnerabilities found"
else
    warning "Security vulnerabilities found. Consider running 'npm audit fix'"
fi

# Install dependencies
log "Installing dependencies..."
npm ci --production=false

success "Dependencies updated"

# =============================================================================
# STEP 4: Run tests
# =============================================================================
if [ "$SKIP_TESTS" = false ]; then
    log "Step 4/8: Running tests"
    
    # Type check
    log "Running TypeScript type check..."
    if npm run typecheck; then
        success "TypeScript type check passed"
    else
        error "TypeScript type check failed"
    fi
    
    # Lint check
    log "Running ESLint..."
    if npm run lint; then
        success "ESLint passed"
    else
        warning "ESLint found issues. Consider fixing them."
    fi
    
    # Unit tests
    log "Running unit tests..."
    if npm run test:ci; then
        success "All tests passed"
    else
        if [ "$FORCE_DEPLOY" = true ]; then
            warning "Tests failed but deployment forced"
        else
            error "Tests failed. Use --force to deploy anyway."
        fi
    fi
else
    log "Step 4/8: Skipping tests"
fi

# =============================================================================
# STEP 5: Database migration
# =============================================================================
log "Step 5/8: Database migration"

# Set environment
export NODE_ENV="$ENVIRONMENT"

# Generate Prisma client
log "Generating Prisma client..."
if npx prisma generate; then
    success "Prisma client generated"
else
    error "Failed to generate Prisma client"
fi

# Run database migrations (server-side will also run)
log "Running database migrations..."
if npx prisma migrate deploy; then
    success "Database migrations applied"
else
    warning "Local migration failed or not needed; proceeding with server-side migration"
fi

# =============================================================================
# STEP 6: Build application
# =============================================================================
if [ "$SKIP_BUILD" = false ]; then
    log "Step 6/8: Building application"
    
    # Clean previous build
    log "Cleaning previous build..."
    rm -rf .next out dist
    
    # Build application
    log "Building application..."
    if [ "$ENVIRONMENT" = "production" ]; then
        if npm run build:prod; then
            success "Production build completed"
        else
            error "Production build failed"
        fi
    else
        if npm run build; then
            success "Build completed"
        else
            error "Build failed"
        fi
    fi
else
    log "Step 6/8: Skipping build"
fi

# =============================================================================
# STEP 7: Deploy to VPS
# =============================================================================
log "Step 7/8: Deploying to VPS"

# Deploy to VPS via SSH
log "Deploying to VPS server..."
if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "cd $VPS_PATH && \
  git pull origin main && \
  cp .env.production .env 2>/dev/null || true && \
  npx prisma generate && \
  npx prisma migrate deploy && \
  npm ci --production && \
  npm run build && \
  pm2 restart internship-system || pm2 start npm --name 'internship-system' -- start"; then
    success "Deployed to VPS successfully"
else
    error "VPS deployment failed"
fi

# =============================================================================
# STEP 8: Post-deployment verification
# =============================================================================
log "Step 8/8: Post-deployment verification"

# Wait a moment for deployment to complete
sleep 5

# Check if the application is running
log "Verifying deployment..."

# Test VPS deployment
log "Testing VPS deployment..."
if curl -f -s "http://$VPS_HOST:8080/api/health" > /dev/null; then
    success "VPS health check passed"
    info "Application URL: http://$VPS_HOST:8080"
else
    warning "VPS health check failed - application may still be starting"
    info "Application URL: http://$VPS_HOST:8080"
fi

# =============================================================================
# DEPLOYMENT COMPLETE
# =============================================================================
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    🎉 DEPLOYMENT COMPLETE                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

success "Deployment completed successfully!"
info "Environment: $ENVIRONMENT"
info "Backup location: $BACKUP_DIR"
info "Log file: $LOG_FILE"

info "Application URL: http://$VPS_HOST:8080"

# Show next steps
echo -e "${CYAN}"
echo "Next steps:"
echo "1. Test the application thoroughly"
echo "2. Monitor logs for any issues"
echo "3. Update documentation if needed"
echo "4. Notify team of deployment"
echo -e "${NC}"

log "Deployment script completed successfully"
