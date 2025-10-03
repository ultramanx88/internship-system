#!/bin/bash

# 🚀 PERFECT DEPLOYMENT SCRIPT
# Handles: 2-way sync, git workflow, intelligent data comparison, VPS deployment
echo "🚀 Perfect Deployment Script v1.0"
echo "=================================="

# Configuration
VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PASSWORD="rp4QkUUvmbi5qB"
VPS_PROJECT_DIR="/var/www/internship-system"
LOCAL_PROJECT_DIR="$(pwd)"

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

# Show menu
show_menu() {
    echo ""
    echo "🎯 Select deployment action:"
    echo "1. 📊 Compare Local ↔ VPS Data"
    echo "2. 📤 Deploy Local → VPS (with backup)"
    echo "3. 📥 Sync VPS → Local (get production data)"
    echo "4. 🔄 Smart Sync (auto-detect newer data)"
    echo "5. 🚀 Full Deploy (git + migrate + restart)"
    echo "6. 🧹 Cleanup old scripts"
    echo "7. ❌ Exit"
    echo ""
    read -p "Choose option (1-7): " choice
}

# Compare data between local and VPS
compare_data() {
    log_info "Comparing Local ↔ VPS databases..."
    
    # Get local data info
    log_info "Analyzing local SQLite database..."
    LOCAL_INFO=$(npx tsx -e "
    import { PrismaClient } from '@prisma/client';
    const prisma = new PrismaClient();
    
    async function getLocalInfo() {
        try {
            const users = await prisma.user.count();
            const companies = await prisma.company.count();
            const internships = await prisma.internship.count();
            const applications = await prisma.application.count();
            
            // Get latest update timestamp
            const latestUser = await prisma.user.findFirst({
                orderBy: { updatedAt: 'desc' },
                select: { updatedAt: true }
            });
            
            const latestApp = await prisma.application.findFirst({
                orderBy: { updatedAt: 'desc' },
                select: { updatedAt: true }
            });
            
            const localTimestamp = latestUser?.updatedAt || latestApp?.updatedAt || new Date(0);
            
            console.log(JSON.stringify({
                users, companies, internships, applications,
                lastUpdate: localTimestamp.toISOString(),
                source: 'local'
            }));
        } catch (error) {
            console.log(JSON.stringify({ error: error.message }));
        } finally {
            await prisma.\$disconnect();
        }
    }
    
    getLocalInfo();
    " 2>/dev/null)
    
    # Get VPS data info
    log_info "Analyzing VPS PostgreSQL database..."
    VPS_INFO=$(sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
cd /var/www/internship-system
PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -t -c "
SELECT json_build_object(
    'users', (SELECT COUNT(*) FROM users),
    'companies', (SELECT COUNT(*) FROM companies),
    'internships', (SELECT COUNT(*) FROM internships),
    'applications', (SELECT COUNT(*) FROM applications),
    'lastUpdate', COALESCE(
        (SELECT MAX(\"updatedAt\") FROM users),
        (SELECT MAX(\"updatedAt\") FROM applications),
        '1970-01-01T00:00:00.000Z'
    ),
    'source', 'vps'
);
" | tr -d ' '
EOF
)
    
    echo ""
    echo "📊 DATABASE COMPARISON:"
    echo "======================"
    echo "🏠 Local:  $LOCAL_INFO"
    echo "🌐 VPS:    $VPS_INFO"
    echo ""
    
    # Parse and compare
    LOCAL_USERS=$(echo "$LOCAL_INFO" | jq -r '.users // 0' 2>/dev/null || echo "0")
    VPS_USERS=$(echo "$VPS_INFO" | jq -r '.users // 0' 2>/dev/null || echo "0")
    
    LOCAL_APPS=$(echo "$LOCAL_INFO" | jq -r '.applications // 0' 2>/dev/null || echo "0")
    VPS_APPS=$(echo "$VPS_INFO" | jq -r '.applications // 0' 2>/dev/null || echo "0")
    
    echo "📈 SUMMARY:"
    echo "Users:        Local=$LOCAL_USERS, VPS=$VPS_USERS"
    echo "Applications: Local=$LOCAL_APPS, VPS=$VPS_APPS"
    
    if [ "$LOCAL_USERS" -gt "$VPS_USERS" ] || [ "$LOCAL_APPS" -gt "$VPS_APPS" ]; then
        log_warning "Local has more data - consider deploying Local → VPS"
    elif [ "$VPS_USERS" -gt "$LOCAL_USERS" ] || [ "$VPS_APPS" -gt "$LOCAL_APPS" ]; then
        log_warning "VPS has more data - consider syncing VPS → Local"
    else
        log_success "Data counts match between Local and VPS"
    fi
}

# Deploy local to VPS
deploy_local_to_vps() {
    log_info "Deploying Local → VPS with backup..."
    
    # Create VPS backup first
    log_info "Creating VPS backup..."
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
cd /var/www/internship-system
mkdir -p backups
BACKUP_FILE="backups/vps-backup-$(date +%Y%m%d-%H%M%S).sql"
PGPASSWORD=internship_pass pg_dump -U internship_user -h localhost internship_system > "$BACKUP_FILE"
echo "✅ VPS backup created: $BACKUP_FILE"
EOF
    
    # Export local data
    log_info "Exporting local data..."
    npm run db:export
    
    # Find latest backup
    BACKUP_FILE=$(ls -t backups/data-backup-*.json 2>/dev/null | head -1)
    if [ -z "$BACKUP_FILE" ]; then
        log_error "No backup file found"
        return 1
    fi
    
    # Upload and import to VPS
    log_info "Uploading and importing to VPS..."
    sshpass -p "$VPS_PASSWORD" scp "$BACKUP_FILE" "$VPS_USER@$VPS_HOST:/tmp/deploy-data.json"
    
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
cd /var/www/internship-system
mv /tmp/deploy-data.json backups/deploy-data.json

# Clear and import
PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -c "
TRUNCATE TABLE print_records, documents, applications, internships, companies, users, majors, curriculums, departments, faculties RESTART IDENTITY CASCADE;
"

npx tsx scripts/import-data.ts backups/deploy-data.json

# Fix passwords
NEW_HASH=$(node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('123456', 12));")
PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -c "UPDATE users SET password = '$NEW_HASH';"

pm2 restart internship-system
EOF
    
    log_success "Local data deployed to VPS successfully!"
}

# Sync VPS to local
sync_vps_to_local() {
    log_info "Syncing VPS → Local (getting production data)..."
    
    # Create local backup
    log_info "Creating local backup..."
    npm run db:export
    
    # Export from VPS
    log_info "Exporting VPS data..."
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
cd /var/www/internship-system
npx tsx scripts/export-data.ts
EOF
    
    # Download VPS export
    VPS_EXPORT=$(sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" "ls -t /var/www/internship-system/backups/data-backup-*.json | head -1")
    
    sshpass -p "$VPS_PASSWORD" scp "$VPS_USER@$VPS_HOST:$VPS_EXPORT" backups/vps-production-data.json
    
    # Import to local
    log_info "Importing VPS data to local..."
    npx tsx scripts/import-data.ts backups/vps-production-data.json
    
    # Fix local passwords
    npx tsx -e "
    import { PrismaClient } from '@prisma/client';
    import bcrypt from 'bcryptjs';
    
    const prisma = new PrismaClient();
    const hash = bcrypt.hashSync('123456', 12);
    
    prisma.user.updateMany({ data: { password: hash } })
        .then(result => console.log('✅ Updated', result.count, 'local passwords'))
        .finally(() => prisma.\$disconnect());
    "
    
    log_success "VPS production data synced to local!"
}

# Smart sync (auto-detect)
smart_sync() {
    log_info "Smart sync - auto-detecting newer data..."
    
    compare_data
    
    echo ""
    read -p "Based on comparison above, sync direction (l=Local→VPS, v=VPS→Local, s=skip): " direction
    
    case $direction in
        l|L) deploy_local_to_vps ;;
        v|V) sync_vps_to_local ;;
        s|S) log_info "Sync skipped" ;;
        *) log_warning "Invalid choice, skipping sync" ;;
    esac
}

# Full deploy workflow
full_deploy() {
    log_info "Full deployment workflow starting..."
    
    # Git workflow
    echo ""
    read -p "🔄 Commit and push changes? (y/n): " git_push
    if [ "$git_push" = "y" ] || [ "$git_push" = "Y" ]; then
        log_info "Git workflow..."
        git add .
        read -p "📝 Commit message: " commit_msg
        git commit -m "$commit_msg"
        git push origin main
        log_success "Code pushed to repository"
    fi
    
    # Deploy code to VPS
    log_info "Deploying code to VPS..."
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
cd /var/www/internship-system
git pull origin main
npm install
npm run build
pm2 restart internship-system
EOF
    
    # Handle database
    echo ""
    read -p "🗄️  Deploy database changes? (y/n): " deploy_db
    if [ "$deploy_db" = "y" ] || [ "$deploy_db" = "Y" ]; then
        smart_sync
    fi
    
    log_success "Full deployment completed!"
    log_info "🌐 VPS: http://$VPS_HOST:8080"
}

# Cleanup old scripts
cleanup_scripts() {
    log_info "Cleaning up old scripts..."
    
    OLD_SCRIPTS=(
        "scripts/import-demo-users-to-vps.sh"
        "scripts/debug-login-api.sh"
        "scripts/fresh-export-import.sh"
        "scripts/compare-data-local-vps.sh"
        "scripts/reset-passwords-vps.sh"
        "scripts/fix-demo-users-import.sh"
        "scripts/test-login-final.sh"
        "scripts/fix-password-hash-vps.sh"
        "scripts/test-login-after-restore.sh"
        "scripts/restore-complete-database.sh"
        "scripts/check-database-completeness.sh"
        "scripts/sync-passwords-from-vps.sh"
        "scripts/compare-local-vps-complete.sh"
        "scripts/fix-local-passwords.sh"
    )
    
    echo ""
    echo "🗑️  Scripts to be removed:"
    for script in "${OLD_SCRIPTS[@]}"; do
        if [ -f "$script" ]; then
            echo "   - $script"
        fi
    done
    
    echo ""
    read -p "❓ Remove these old scripts? (y/n): " confirm
    
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        for script in "${OLD_SCRIPTS[@]}"; do
            if [ -f "$script" ]; then
                rm "$script"
                log_success "Removed $script"
            fi
        done
        log_success "Cleanup completed! Only perfect-deploy.sh remains."
    else
        log_info "Cleanup cancelled"
    fi
}

# Main execution
main() {
    while true; do
        show_menu
        
        case $choice in
            1) compare_data ;;
            2) deploy_local_to_vps ;;
            3) sync_vps_to_local ;;
            4) smart_sync ;;
            5) full_deploy ;;
            6) cleanup_scripts ;;
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
    done
}

# Check dependencies
check_dependencies() {
    command -v jq >/dev/null 2>&1 || { log_error "jq is required but not installed. Install with: brew install jq"; exit 1; }
    command -v sshpass >/dev/null 2>&1 || { log_error "sshpass is required but not installed. Install with: brew install sshpass"; exit 1; }
}

# Initialize
check_dependencies
main
