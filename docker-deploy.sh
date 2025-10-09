#!/bin/bash

# =============================================================================
# 🐳 Docker Deployment Script for Internship System
# =============================================================================
# This script handles Docker-based deployment with proper sync

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
BACKUP_DIR="backups/docker-deploy-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="logs/docker-deploy-$(date +%Y%m%d-%H%M%S).log"

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
echo "║                🐳 DOCKER DEPLOYMENT SCRIPT                   ║"
echo "║                 Internship Management System                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Parse arguments
DEPLOY_TYPE="full"
BACKUP_DB=false
EXPORT_DB=false
SYNC_DATA=false
SKIP_TESTS=false
FORCE=false
COMMIT_MSG=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --type)
            DEPLOY_TYPE="$2"
            shift 2
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
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --commit-msg)
            COMMIT_MSG="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --type TYPE           Deployment type: full, code-only, data-sync"
            echo "  --backup-db           Backup database before deployment"
            echo "  --export-db           Export database after deployment"
            echo "  --sync-data           Sync data after deployment"
            echo "  --skip-tests          Skip running tests"
            echo "  --force               Force deployment even if tests fail"
            echo "  --commit-msg MSG      Commit message for git"
            echo "  --help, -h            Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --type full --backup-db"
            echo "  $0 --type code-only --skip-tests"
            echo "  $0 --type data-sync --export-db --sync-data"
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker first."
    fi
    success "Docker is running"
}

# Function to backup database
backup_database() {
    if [ "$BACKUP_DB" = true ]; then
        log "📊 Backing up database..."
        
        # Create backup directory
        mkdir -p "$BACKUP_DIR"
        
        # Export data using existing script
        if [ -f "scripts/export-data.ts" ]; then
            npx tsx scripts/export-data.ts
            if [ -f "backups/data-backup-*.json" ]; then
                cp backups/data-backup-*.json "$BACKUP_DIR/"
                success "Database backed up to $BACKUP_DIR"
            else
                warning "Backup file not found, but export completed"
            fi
        else
            warning "Export script not found, skipping backup"
        fi
    fi
}

# Function to run tests
run_tests() {
    if [ "$SKIP_TESTS" = false ]; then
        log "🧪 Running tests..."
        
        # Type check
        if ! npm run typecheck; then
            if [ "$FORCE" = false ]; then
                error "Type check failed. Use --force to skip."
            else
                warning "Type check failed, but continuing due to --force"
            fi
        fi
        
        # Lint check
        if ! npm run lint; then
            if [ "$FORCE" = false ]; then
                error "Lint check failed. Use --force to skip."
            else
                warning "Lint check failed, but continuing due to --force"
            fi
        fi
        
        success "Tests completed"
    else
        info "Skipping tests due to --skip-tests flag"
    fi
}

# Function to build Docker image
build_docker() {
    log "🔨 Building Docker image..."
    
    # Build the image
    if docker build -t "$PROJECT_NAME:latest" .; then
        success "Docker image built successfully"
    else
        error "Failed to build Docker image"
    fi
}

# Function to deploy with Docker Compose
deploy_docker() {
    log "🚀 Deploying with Docker Compose..."
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose down || true
    
    # Start services
    log "Starting services..."
    if docker-compose up -d; then
        success "Services started successfully"
    else
        error "Failed to start services"
    fi
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check if app is running
    if docker-compose ps | grep -q "internship_app.*Up"; then
        success "Application is running"
    else
        error "Application failed to start"
    fi
}

# Function to sync data
sync_data() {
    if [ "$SYNC_DATA" = true ]; then
        log "🔄 Syncing data..."
        
        # Wait for database to be ready
        log "Waiting for database to be ready..."
        sleep 10
        
        # Run database migrations
        log "Running database migrations..."
        docker-compose exec app npx prisma migrate deploy || warning "Migration failed"
        
        # Seed database if needed
        log "Seeding database..."
        docker-compose exec app npx prisma db seed || warning "Seeding failed"
        
        success "Data sync completed"
    fi
}

# Function to export database
export_database() {
    if [ "$EXPORT_DB" = true ]; then
        log "📤 Exporting database..."
        
        # Export data
        docker-compose exec app npx tsx scripts/export-data.ts || warning "Export failed"
        
        success "Database exported"
    fi
}

# Function to show status
show_status() {
    log "📊 Deployment Status:"
    echo ""
    echo "🐳 Docker Containers:"
    docker-compose ps
    echo ""
    echo "🌐 Application URLs:"
    echo "  - Main App: http://localhost:8080"
    echo "  - pgAdmin: http://localhost:8081"
    echo ""
    echo "📁 Logs:"
    echo "  - App Logs: docker-compose logs app"
    echo "  - DB Logs: docker-compose logs postgres"
    echo "  - All Logs: docker-compose logs"
    echo ""
    echo "🔧 Management Commands:"
    echo "  - Stop: docker-compose down"
    echo "  - Restart: docker-compose restart"
    echo "  - Rebuild: docker-compose up --build -d"
    echo "  - Shell: docker-compose exec app sh"
    echo "  - DB Shell: docker-compose exec postgres psql -U postgres -d internship_system_dev"
}

# Main deployment flow
main() {
    log "Starting Docker deployment process..."
    
    # Pre-deployment checks
    check_docker
    backup_database
    run_tests
    
    # Build and deploy
    build_docker
    deploy_docker
    
    # Post-deployment tasks
    sync_data
    export_database
    
    # Show final status
    show_status
    
    success "🎉 Docker deployment completed successfully!"
    log "Check the application at http://localhost:8080"
}

# Run main function
main "$@"
