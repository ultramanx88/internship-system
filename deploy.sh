#!/bin/bash

# =============================================================================
# 🚀 Enhanced Deployment Script Wrapper
# =============================================================================
# This script provides easy access to the enhanced deployment workflow

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                🚀 DEPLOYMENT SCRIPT WRAPPER                  ║"
echo "║                 Internship Management System                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if enhanced script exists
if [ ! -f "./deploy-enhanced.sh" ]; then
    echo -e "${RED}Error: deploy-enhanced.sh not found!${NC}"
    exit 1
fi

# Show menu
show_menu() {
    echo ""
    echo -e "${BLUE}🎯 Select deployment type:${NC}"
    echo "1. 📝 Code-only deployment (UI, API changes)"
    echo "2. 🗄️  Full deployment (with database changes)"
    echo "3. 🔄 Data sync deployment (with data synchronization)"
    echo "4. 🚀 Quick code deploy (skip tests, force deploy)"
    echo "5. 📊 Export database only"
    echo "6. 🔧 Custom deployment (advanced options)"
    echo "7. ❌ Exit"
    echo ""
    read -p "Choose option (1-7): " choice
}

# Handle menu selection
case "${1:-menu}" in
    "1"|"code-only")
        echo -e "${GREEN}🚀 Starting code-only deployment...${NC}"
        ./deploy-enhanced.sh --type code-only
        ;;
    "2"|"full")
        echo -e "${GREEN}🚀 Starting full deployment...${NC}"
        ./deploy-enhanced.sh --type full --backup-db
        ;;
    "3"|"data-sync")
        echo -e "${GREEN}🚀 Starting data sync deployment...${NC}"
        ./deploy-enhanced.sh --type data-sync --export-db --sync-data
        ;;
    "4"|"quick")
        echo -e "${GREEN}🚀 Starting quick deployment...${NC}"
        ./deploy-enhanced.sh --type code-only --skip-tests --force
        ;;
    "5"|"export")
        echo -e "${GREEN}📊 Exporting database...${NC}"
        ./deploy-enhanced.sh --export-db
        ;;
    "6"|"custom")
        echo -e "${YELLOW}🔧 Custom deployment options:${NC}"
        echo ""
        echo "Available options:"
        echo "  --type code-only|full|data-sync"
        echo "  --env production|staging"
        echo "  --skip-tests"
        echo "  --skip-build"
        echo "  --force"
        echo "  --backup-db"
        echo "  --export-db"
        echo "  --sync-data"
        echo "  --commit-msg 'message'"
        echo ""
        echo "Example: ./deploy-enhanced.sh --type full --backup-db --commit-msg 'Add new feature'"
        echo ""
        read -p "Enter custom command: " custom_cmd
        if [ -n "$custom_cmd" ]; then
            ./deploy-enhanced.sh $custom_cmd
        fi
        ;;
    "menu"|"")
        while true; do
            show_menu
            case $choice in
                1) ./deploy-enhanced.sh --type code-only ;;
                2) ./deploy-enhanced.sh --type full --backup-db ;;
                3) ./deploy-enhanced.sh --type data-sync --export-db --sync-data ;;
                4) ./deploy-enhanced.sh --type code-only --skip-tests --force ;;
                5) ./deploy-enhanced.sh --export-db ;;
                6) 
                    echo -e "${YELLOW}🔧 Custom deployment options:${NC}"
                    echo ""
                    echo "Available options:"
                    echo "  --type code-only|full|data-sync"
                    echo "  --env production|staging"
                    echo "  --skip-tests"
                    echo "  --skip-build"
                    echo "  --force"
                    echo "  --backup-db"
                    echo "  --export-db"
                    echo "  --sync-data"
                    echo "  --commit-msg 'message'"
                    echo ""
                    echo "Example: ./deploy-enhanced.sh --type full --backup-db --commit-msg 'Add new feature'"
                    echo ""
                    read -p "Enter custom command: " custom_cmd
                    if [ -n "$custom_cmd" ]; then
                        ./deploy-enhanced.sh $custom_cmd
                    fi
                    ;;
                7) 
                    echo -e "${GREEN}Goodbye! 👋${NC}"
                    exit 0
                    ;;
                *) 
                    echo -e "${RED}Invalid option. Please choose 1-7.${NC}"
                    ;;
            esac
            echo ""
            read -p "Press Enter to continue..."
        done
        ;;
    "help"|"-h"|"--help")
        echo -e "${BLUE}Usage:${NC}"
        echo "  ./deploy.sh                    # Show interactive menu"
        echo "  ./deploy.sh code-only          # Code-only deployment"
        echo "  ./deploy.sh full               # Full deployment with DB"
        echo "  ./deploy.sh data-sync          # Data sync deployment"
        echo "  ./deploy.sh quick              # Quick deployment (skip tests)"
        echo "  ./deploy.sh export             # Export database only"
        echo "  ./deploy.sh custom             # Custom deployment options"
        echo "  ./deploy.sh help               # Show this help"
        echo ""
        echo -e "${BLUE}Examples:${NC}"
        echo "  ./deploy.sh code-only"
        echo "  ./deploy.sh full"
        echo "  ./deploy.sh data-sync"
        ;;
    *)
        echo -e "${RED}Unknown option: $1${NC}"
        echo "Use './deploy.sh help' for usage information"
        exit 1
        ;;
esac