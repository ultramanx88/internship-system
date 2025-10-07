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
    
    # Backup SQLite database
    if [ -f "prisma/prisma/dev.db" ]; then
        cp "prisma/prisma/dev.db" "$BACKUP_DIR/dev.db"
        success "Database backed up to $BACKUP_DIR/dev.db"
    fi
    
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

# Run database migrations
log "Running database migrations..."
if [ "$ENVIRONMENT" = "production" ]; then
    if npx prisma migrate deploy; then
        success "Database migrations applied"
    else
        error "Database migration failed"
    fi
else
    if npx prisma migrate dev --name "deploy-$(date +%Y%m%d-%H%M%S)"; then
        success "Database migrations applied"
    else
        error "Database migration failed"
    fi
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
# STEP 7: Deploy to platform
# =============================================================================
log "Step 7/8: Deploying to platform"

# Check if Vercel CLI is available
if command -v vercel &> /dev/null; then
    log "Deploying to Vercel..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        if vercel --prod --yes; then
            success "Deployed to Vercel production"
        else
            error "Vercel deployment failed"
        fi
    else
        if vercel --yes; then
            success "Deployed to Vercel preview"
        else
            error "Vercel deployment failed"
        fi
    fi
else
    # Fallback: manual deployment instructions
    warning "Vercel CLI not found. Manual deployment required."
    info "Please deploy manually using your preferred method:"
    info "1. Push to your git repository"
    info "2. Trigger deployment on your hosting platform"
    info "3. Or use your hosting platform's CLI"
fi

# =============================================================================
# STEP 8: Post-deployment verification
# =============================================================================
log "Step 8/8: Post-deployment verification"

# Wait a moment for deployment to complete
sleep 5

# Check if the application is running
log "Verifying deployment..."

# Get deployment URL (if using Vercel)
if command -v vercel &> /dev/null; then
    DEPLOYMENT_URL=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null || echo "")
    if [ -n "$DEPLOYMENT_URL" ]; then
        info "Deployment URL: https://$DEPLOYMENT_URL"
        
        # Test health endpoint
        log "Testing health endpoint..."
        if curl -f -s "https://$DEPLOYMENT_URL/api/health" > /dev/null; then
            success "Health check passed"
        else
            warning "Health check failed - application may still be starting"
        fi
    fi
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

if [ -n "$DEPLOYMENT_URL" ]; then
    info "Application URL: https://$DEPLOYMENT_URL"
fi

# Show next steps
echo -e "${CYAN}"
echo "Next steps:"
echo "1. Test the application thoroughly"
echo "2. Monitor logs for any issues"
echo "3. Update documentation if needed"
echo "4. Notify team of deployment"
echo -e "${NC}"

log "Deployment script completed successfully"
