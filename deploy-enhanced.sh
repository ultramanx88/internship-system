#!/bin/bash

# =============================================================================
# 🚀 Enhanced Deployment Script for Internship System
# =============================================================================
# Correct Workflow: Build → Push → Deploy → (Export/Sync if needed)

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

# Logging functions
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
echo "║                🚀 ENHANCED DEPLOYMENT SCRIPT                 ║"
echo "║                 Internship Management System                 ║"
echo "║              Correct Workflow: Build → Push → Deploy         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Parse command line arguments
DEPLOYMENT_TYPE="code-only"
ENVIRONMENT="production"
SKIP_TESTS=false
SKIP_BUILD=false
FORCE_DEPLOY=false
BACKUP_DB=false
EXPORT_DB=false
SYNC_DATA=false
COMMIT_MESSAGE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --type)
            DEPLOYMENT_TYPE="$2"
            shift 2
            ;;
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
        --backup-db)
            BACKUP_DB=true
            shift
            ;;
        --export-db)
            EXPORT_DB=true
            shift
            ;;
        --sync-data)
            SYNC_DATA=true
            shift
            ;;
        --commit-msg)
            COMMIT_MESSAGE="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Deployment Types:"
            echo "  --type code-only     Deploy code changes only (default)"
            echo "  --type full          Deploy with database changes"
            echo "  --type data-sync     Deploy with data synchronization"
            echo ""
            echo "Options:"
            echo "  --env ENV           Environment (production|staging) [default: production]"
            echo "  --skip-tests        Skip running tests"
            echo "  --skip-build        Skip build process"
            echo "  --force             Force deployment even if tests fail"
            echo "  --backup-db         Create database backup before deploy"
            echo "  --export-db         Export database before deploy"
            echo "  --sync-data         Sync data between local and VPS"
            echo "  --commit-msg MSG    Custom commit message"
            echo "  --help              Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --type code-only --commit-msg 'Fix UI bug'"
            echo "  $0 --type full --backup-db --commit-msg 'Add new feature'"
            echo "  $0 --type data-sync --export-db --sync-data"
            exit 0
            ;;
        *)
            error "Unknown option: $1. Use --help for usage information."
            ;;
    esac
done

log "Starting $DEPLOYMENT_TYPE deployment for environment: $ENVIRONMENT"

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
        warning "Working directory has uncommitted changes."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Deployment cancelled. Please commit or stash changes first."
        fi
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
# STEP 2: Database operations (if needed)
# =============================================================================
if [ "$EXPORT_DB" = true ] || [ "$BACKUP_DB" = true ] || [ "$DEPLOYMENT_TYPE" = "full" ] || [ "$DEPLOYMENT_TYPE" = "data-sync" ]; then
    log "Step 2/8: Database operations"
    
    if [ "$EXPORT_DB" = true ] || [ "$BACKUP_DB" = true ]; then
        log "Creating database backup/export..."
        mkdir -p "$BACKUP_DIR"
        
        # Export database
        if npm run db:export; then
            success "Database exported successfully"
        else
            warning "Database export failed, continuing without backup"
        fi
        
        # Move latest backup to backup directory
        LATEST_BACKUP=$(ls -t backups/data-backup-*.json 2>/dev/null | head -1)
        if [ -n "$LATEST_BACKUP" ]; then
            cp "$LATEST_BACKUP" "$BACKUP_DIR/"
            success "Backup saved to $BACKUP_DIR"
        fi
    fi
else
    log "Step 2/8: Skipping database operations"
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
# STEP 5: Build application (LOCAL)
# =============================================================================
if [ "$SKIP_BUILD" = false ]; then
    log "Step 5/8: Building application (LOCAL)"
    
    # Clean previous build
    log "Cleaning previous build..."
    rm -rf .next out dist
    
    # Generate Prisma client
    log "Generating Prisma client..."
    if npx prisma generate; then
        success "Prisma client generated"
    else
        error "Failed to generate Prisma client"
    fi
    
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
    log "Step 5/8: Skipping build"
fi

# =============================================================================
# STEP 6: Git operations (PUSH)
# =============================================================================
log "Step 6/8: Git operations (PUSH)"

# Get commit message
if [ -z "$COMMIT_MESSAGE" ]; then
    read -p "📝 Enter commit message: " COMMIT_MESSAGE
fi

if [ -z "$COMMIT_MESSAGE" ]; then
    COMMIT_MESSAGE="Deploy: $DEPLOYMENT_TYPE deployment $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Add and commit changes
log "Adding and committing changes..."
git add .

if git commit -m "$COMMIT_MESSAGE"; then
    success "Changes committed locally"
else
    warning "Nothing to commit or commit failed"
fi

# Push to repository
log "Pushing to repository..."
if git push origin "$CURRENT_BRANCH"; then
    success "Code pushed to repository"
else
    error "Failed to push to repository"
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
# STEP 8: Data synchronization (if needed)
# =============================================================================
if [ "$SYNC_DATA" = true ] || [ "$DEPLOYMENT_TYPE" = "data-sync" ]; then
    log "Step 8/8: Data synchronization"
    
    # Compare data between local and VPS
    log "Comparing data between local and VPS..."
    
    # Get local data count
    LOCAL_DATA=$(npx tsx -e "
    import { PrismaClient } from '@prisma/client';
    const prisma = new PrismaClient();
    
    async function getLocalData() {
        try {
            const users = await prisma.user.count();
            const companies = await prisma.company.count();
            const applications = await prisma.application.count();
            console.log(JSON.stringify({ users, companies, applications }));
        } catch (error) {
            console.log(JSON.stringify({ error: error.message }));
        } finally {
            await prisma.\$disconnect();
        }
    }
    
    getLocalData();
    " 2>/dev/null)
    
    # Get VPS data count
    VPS_DATA=$(ssh -o StrictHostKeyChecking=no -T $VPS_USER@$VPS_HOST "cd $VPS_PATH && \
    PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -t -c \"
    SELECT json_build_object(
        'users', (SELECT COUNT(*) FROM users),
        'companies', (SELECT COUNT(*) FROM companies),
        'applications', (SELECT COUNT(*) FROM applications)
    );
    \"" 2>/dev/null | tr -d ' ')
    
    echo "Local data: $LOCAL_DATA"
    echo "VPS data: $VPS_DATA"
    
    # Ask user which direction to sync
    echo ""
    echo "🔄 Data Sync Options:"
    echo "1. 📤 Local → VPS (overwrite VPS with local data)"
    echo "2. 📥 VPS → Local (keep VPS data, sync to local)"
    echo "3. ⏭️  Skip data sync"
    echo ""
    read -p "Choose sync direction (1-3): " sync_choice
    
    case $sync_choice in
        1) 
            log "Syncing Local → VPS..."
            # Export local data and import to VPS
            if npm run db:export; then
                LATEST_BACKUP=$(ls -t backups/data-backup-*.json 2>/dev/null | head -1)
                if [ -n "$LATEST_BACKUP" ]; then
                    scp "$LATEST_BACKUP" "$VPS_USER@$VPS_HOST:/tmp/sync-data.json"
                    ssh -o StrictHostKeyChecking=no -T $VPS_USER@$VPS_HOST "cd $VPS_PATH && \
                    npx tsx scripts/import-data.ts /tmp/sync-data.json && \
                    pm2 restart internship-system"
                    success "Local data synced to VPS"
                else
                    error "No backup file found for sync"
                fi
            else
                error "Failed to export local data"
            fi
            ;;
        2) 
            log "Syncing VPS → Local..."
            # Export VPS data and import to local
            ssh -o StrictHostKeyChecking=no -T $VPS_USER@$VPS_HOST "cd $VPS_PATH && npx tsx scripts/export-data.ts"
            VPS_EXPORT=$(ssh -o StrictHostKeyChecking=no -T $VPS_USER@$VPS_HOST "ls -t $VPS_PATH/backups/data-backup-*.json | head -1")
            if [ -n "$VPS_EXPORT" ]; then
                scp "$VPS_USER@$VPS_HOST:$VPS_EXPORT" "backups/vps-sync-data.json"
                npx tsx scripts/import-data.ts backups/vps-sync-data.json
                success "VPS data synced to local"
            else
                error "No VPS export file found"
            fi
            ;;
        3) 
            log "Data sync skipped"
            ;;
        *) 
            warning "Invalid choice, skipping data sync"
            ;;
    esac
else
    log "Step 8/8: Skipping data synchronization"
fi

# =============================================================================
# POST-DEPLOYMENT VERIFICATION
# =============================================================================
log "Post-deployment verification"

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
info "Deployment type: $DEPLOYMENT_TYPE"
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

log "Enhanced deployment script completed successfully"
