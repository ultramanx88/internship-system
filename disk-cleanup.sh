#!/bin/bash

# =============================================================================
# 🧹 Disk Cleanup Script
# =============================================================================
# This script cleans up disk space by removing unnecessary files

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Header
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                🧹 DISK CLEANUP SCRIPT                      ║"
echo "║                 Free Up Disk Space                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to show current disk usage
show_disk_usage() {
    log "📊 Current Disk Usage:"
    echo "💾 Total disk usage:"
    du -sh . 2>/dev/null || echo "Cannot calculate total"
    
    echo ""
    echo "📁 Top 10 largest directories:"
    du -sh * 2>/dev/null | sort -hr | head -10
    
    echo ""
    echo "🗂️  Hidden directories:"
    du -sh .* 2>/dev/null | grep -E "^\s*[0-9]+[MGK]" | sort -hr | head -5
}

# Function to clean up build files
cleanup_build_files() {
    log "🧹 Cleaning up build files..."
    
    if [ -d ".next" ]; then
        echo "🗑️  Removing .next directory (676MB)..."
        rm -rf .next
        success "Removed .next directory"
    else
        echo "ℹ️  .next directory not found"
    fi
    
    if [ -f "tsconfig.tsbuildinfo" ]; then
        echo "🗑️  Removing tsconfig.tsbuildinfo (552KB)..."
        rm -f tsconfig.tsbuildinfo
        success "Removed tsconfig.tsbuildinfo"
    fi
}

# Function to clean up logs
cleanup_logs() {
    log "🧹 Cleaning up log files..."
    
    if [ -d "logs" ]; then
        echo "🗑️  Cleaning up logs directory..."
        find logs -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true
        find logs -name "*.gz" -type f -mtime +7 -delete 2>/dev/null || true
        success "Cleaned up old log files"
    else
        echo "ℹ️  logs directory not found"
    fi
}

# Function to clean up backups
cleanup_backups() {
    log "🧹 Cleaning up old backups..."
    
    if [ -d "backups" ]; then
        echo "🗑️  Cleaning up old backups..."
        find backups -name "*.json" -type f -mtime +30 -delete 2>/dev/null || true
        find backups -name "*.sql" -type f -mtime +30 -delete 2>/dev/null || true
        success "Cleaned up old backup files"
    else
        echo "ℹ️  backups directory not found"
    fi
}

# Function to clean up node_modules (optional)
cleanup_node_modules() {
    log "🧹 Cleaning up node_modules (optional)..."
    
    if [ -d "node_modules" ]; then
        echo "⚠️  node_modules directory found (1.4GB)"
        echo "   This will be recreated when you run 'npm install'"
        read -p "   Do you want to remove it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🗑️  Removing node_modules directory..."
            rm -rf node_modules
            success "Removed node_modules directory"
            echo "💡 Run 'npm install' to reinstall dependencies"
        else
            echo "ℹ️  Keeping node_modules directory"
        fi
    else
        echo "ℹ️  node_modules directory not found"
    fi
}

# Function to clean up git history (optional)
cleanup_git_history() {
    log "🧹 Cleaning up git history (optional)..."
    
    if [ -d ".git" ]; then
        echo "⚠️  .git directory found (270MB)"
        echo "   This contains git history and can be large"
        read -p "   Do you want to clean git history? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🗑️  Cleaning git history..."
            git gc --aggressive --prune=now
            success "Cleaned git history"
        else
            echo "ℹ️  Keeping git history"
        fi
    else
        echo "ℹ️  .git directory not found"
    fi
}

# Function to clean up temporary files
cleanup_temp_files() {
    log "🧹 Cleaning up temporary files..."
    
    echo "🗑️  Removing temporary files..."
    find . -name "*.tmp" -type f -delete 2>/dev/null || true
    find . -name "*.temp" -type f -delete 2>/dev/null || true
    find . -name ".DS_Store" -type f -delete 2>/dev/null || true
    find . -name "Thumbs.db" -type f -delete 2>/dev/null || true
    
    success "Cleaned up temporary files"
}

# Function to show space saved
show_space_saved() {
    log "📊 Disk Usage After Cleanup:"
    echo "💾 Current disk usage:"
    du -sh . 2>/dev/null || echo "Cannot calculate total"
    
    echo ""
    echo "📁 Top 10 largest directories:"
    du -sh * 2>/dev/null | sort -hr | head -10
}

# Main menu
case "${1:-show}" in
    "show")
        show_disk_usage
        ;;
    "build")
        cleanup_build_files
        show_space_saved
        ;;
    "logs")
        cleanup_logs
        show_space_saved
        ;;
    "backups")
        cleanup_backups
        show_space_saved
        ;;
    "node")
        cleanup_node_modules
        show_space_saved
        ;;
    "git")
        cleanup_git_history
        show_space_saved
        ;;
    "temp")
        cleanup_temp_files
        show_space_saved
        ;;
    "all")
        show_disk_usage
        echo ""
        cleanup_build_files
        cleanup_logs
        cleanup_backups
        cleanup_temp_files
        echo ""
        show_space_saved
        ;;
    "help")
        echo -e "${CYAN}Usage: $0 [command]${NC}"
        echo ""
        echo "Commands:"
        echo "  show      - Show current disk usage (default)"
        echo "  build     - Clean up build files (.next, tsconfig.tsbuildinfo)"
        echo "  logs      - Clean up old log files"
        echo "  backups   - Clean up old backup files"
        echo "  node      - Clean up node_modules (optional)"
        echo "  git       - Clean up git history (optional)"
        echo "  temp      - Clean up temporary files"
        echo "  all       - Clean up all non-essential files"
        echo "  help      - Show this help"
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac

success "Disk cleanup completed"
