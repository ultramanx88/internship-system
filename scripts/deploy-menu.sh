#!/bin/bash

# 🚀 DEPLOY MENU SCRIPT
# Interactive deployment menu
# Usage: ./scripts/deploy-menu.sh

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

echo "🚀 Deployment Menu v1.0"
echo "======================="
echo ""

# Show menu
show_menu() {
    echo "🎯 Select deployment option:"
    echo "1. 🚀 Full Deploy (code + database migrations)"
    echo "2. 📦 Code-Only Deploy (no database changes)"
    echo "3. 🔄 Quick Deploy (existing script)"
    echo "4. 🧠 Smart Deploy (with error detection)"
    echo "5. 📊 Compare Local ↔ VPS Data"
    echo "6. 🔐 SSH into VPS"
    echo "7. ❌ Exit"
    echo ""
    read -p "Choose option (1-7): " choice
}

# Main execution
while true; do
    show_menu
    
    case $choice in
        1)
            log_info "Starting Full Deploy..."
            bash scripts/pull-deploy.sh
            ;;
        2)
            log_info "Starting Code-Only Deploy..."
            bash scripts/pull-deploy-code-only.sh
            ;;
        3)
            log_info "Starting Quick Deploy..."
            bash scripts/quick-deploy.sh
            ;;
        4)
            log_info "Starting Smart Deploy..."
            bash scripts/perfect-deploy.sh
            ;;
        5)
            log_info "Comparing data between Local and VPS..."
            # This would need to be implemented or use existing compare function
            echo "Feature coming soon..."
            ;;
        6)
            log_info "Opening SSH session to VPS..."
            sshpass -p "rp4QkUUvmbi5qB" ssh -o StrictHostKeyChecking=no root@203.170.129.199
            ;;
        7)
            log_success "Goodbye! 👋"
            exit 0
            ;;
        *)
            log_warning "Invalid option. Please choose 1-7."
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    echo ""
done
