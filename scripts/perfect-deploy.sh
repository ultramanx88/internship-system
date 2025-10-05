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
    echo "7. 🔐 SSH into VPS shell"
    echo "8. 🔄 Quick Restart app on VPS"
    echo "9. 🛠️  Reinstall app + configure Nginx (one-shot)"
    echo "10. 🧠 Smart Deploy (auto-sync + error detection)"
    echo "11. ❌ Exit"
    echo ""
    read -p "Choose option (1-11): " choice
}

# Compare data between local and VPS
compare_data() {
    log_info "Comparing Local ↔ VPS databases..."
    
    # Ensure local schema is correct
    log_info "Ensuring local SQLite schema..."
    cp prisma/schema.local.prisma prisma/schema.prisma
    npx prisma generate > /dev/null 2>&1
    
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
            const committees = await prisma.committee.count();
            const committeeMembers = await prisma.committeeMember.count();
            const printRecords = await prisma.printRecord.count();
            
            // Get latest update timestamp (only from users table)
            const latestUser = await prisma.user.findFirst({
                orderBy: { updatedAt: 'desc' },
                select: { updatedAt: true }
            });
            
            const localTimestamp = latestUser?.updatedAt || new Date(0);
            
            console.log(JSON.stringify({
                users, companies, internships, applications, committees, committeeMembers, printRecords,
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
    'committees', COALESCE((SELECT COUNT(*) FROM committees), 0),
    'committeeMembers', COALESCE((SELECT COUNT(*) FROM committee_members), 0),
    'printRecords', COALESCE((SELECT COUNT(*) FROM print_records), 0),
    'lastUpdate', COALESCE(
        (SELECT MAX(\"updatedAt\") FROM users),
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
    
    LOCAL_COMMITTEES=$(echo "$LOCAL_INFO" | jq -r '.committees // 0' 2>/dev/null || echo "0")
    VPS_COMMITTEES=$(echo "$VPS_INFO" | jq -r '.committees // 0' 2>/dev/null || echo "0")
    
    LOCAL_PRINT_RECORDS=$(echo "$LOCAL_INFO" | jq -r '.printRecords // 0' 2>/dev/null || echo "0")
    VPS_PRINT_RECORDS=$(echo "$VPS_INFO" | jq -r '.printRecords // 0' 2>/dev/null || echo "0")
    
    echo "📈 SUMMARY:"
    echo "Users:        Local=$LOCAL_USERS, VPS=$VPS_USERS"
    echo "Applications: Local=$LOCAL_APPS, VPS=$VPS_APPS"
    echo "Committees:   Local=$LOCAL_COMMITTEES, VPS=$VPS_COMMITTEES"
    echo "Print Records: Local=$LOCAL_PRINT_RECORDS, VPS=$VPS_PRINT_RECORDS"
    echo ""
    
    # Calculate data difference
    USER_DIFF=$((LOCAL_USERS - VPS_USERS))
    APP_DIFF=$((LOCAL_APPS - VPS_APPS))
    COMMITTEE_DIFF=$((LOCAL_COMMITTEES - VPS_COMMITTEES))
    PRINT_DIFF=$((LOCAL_PRINT_RECORDS - VPS_PRINT_RECORDS))
    
    TOTAL_LOCAL_DIFF=$((USER_DIFF + APP_DIFF + COMMITTEE_DIFF + PRINT_DIFF))
    
    if [ "$TOTAL_LOCAL_DIFF" -gt 0 ]; then
        log_warning "📊 Local has MORE data (+$USER_DIFF users, +$APP_DIFF apps, +$COMMITTEE_DIFF committees, +$PRINT_DIFF print records)"
        log_warning "💡 Recommendation: Deploy Local → VPS (overwrite production)"
    elif [ "$TOTAL_LOCAL_DIFF" -lt 0 ]; then
        log_success "📊 VPS has MORE data ($((-USER_DIFF)) more users, $((-APP_DIFF)) more apps, $((-COMMITTEE_DIFF)) more committees, $((-PRINT_DIFF)) more print records)"
        log_success "💡 Recommendation: Sync VPS → Local (keep production data)"
    else
        log_success "📊 Data counts match between Local and VPS"
        log_info "💡 No sync needed or use manual choice"
    fi
}

# Deploy local to VPS
deploy_local_to_vps() {
    log_info "Deploying Local → VPS with backup..."
    
    # Ensure local schema is up to date
    log_info "Updating local schema..."
    npx prisma db push
    npx prisma generate
    
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

# Switch to production schema for PostgreSQL
cp prisma/schema.production.prisma prisma/schema.prisma
npx prisma generate

# Run database migrations to ensure schema is up to date
log_info "Running database migrations..."
npx prisma db push --accept-data-loss

# Clear and import
PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -c "
TRUNCATE TABLE print_records, documents, applications, internships, companies, users, majors, curriculums, departments, faculties, supervised_students, course_instructors, educator_roles, semesters, academic_years, evaluation_answers, evaluations, evaluation_questions, evaluation_forms, subdistricts, districts, provinces RESTART IDENTITY CASCADE;
"

npx tsx scripts/import-data.ts backups/deploy-data.json

# Check if educator tables exist and seed if needed
log_info "Checking educator system tables..."
TABLE_EXISTS=$(PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'academic_years');" | tr -d ' ')

if [ "$TABLE_EXISTS" = "t" ]; then
    log_info "Educator tables exist, checking if data needs seeding..."
    DATA_COUNT=$(PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -t -c "SELECT COUNT(*) FROM academic_years;" | tr -d ' ')
    if [ "$DATA_COUNT" = "0" ]; then
        log_info "Seeding educator system data..."
        npx tsx scripts/seed-vps-educator-data.ts
    else
        log_success "Educator data already exists ($DATA_COUNT academic years)"
    fi
else
    log_warning "Educator tables not found, they should have been created by prisma db push"
fi

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
    
    # Switch to local schema for SQLite
    log_info "Switching to local SQLite schema..."
    cp prisma/schema.local.prisma prisma/schema.prisma
    npx prisma generate
    
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
    echo "🤖 Smart Sync Options:"
    echo "l = Local → VPS (overwrite production with local data)"
    echo "v = VPS → Local (keep production data, sync to local)"
    echo "s = Skip sync"
    echo ""
    read -p "Based on comparison above, sync direction (l/v/s): " direction
    
    case $direction in
        l|L) 
            log_warning "⚠️  This will OVERWRITE VPS production data!"
            read -p "Are you sure? (yes/no): " confirm
            if [ "$confirm" = "yes" ]; then
                deploy_local_to_vps
            else
                log_info "Sync cancelled"
            fi
            ;;
        v|V) 
            log_info "📥 Syncing VPS → Local (keeping production data)"
            sync_vps_to_local
            ;;
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

# Switch to production schema
cp prisma/schema.production.prisma prisma/schema.prisma
npx prisma generate

npm install
npm run build

# Run database migrations if needed
npx prisma db push --accept-data-loss

# Ensure PM2 app runs on port 8080 (Next.js production)
echo "-- Ensuring PM2 process on port 8080 --"
if ! pm2 describe internship-system >/dev/null 2>&1; then
  pm2 start npm --name internship-system -- start
else
  # Reload gracefully if already exists
  pm2 reload internship-system || pm2 restart internship-system
fi

# Verify port 8080 is listening; if not, restart with npm start
LISTEN_8080=$(ss -ltnp 2>/dev/null | grep -c ":8080")
if [ "$LISTEN_8080" = "0" ]; then
  echo "Port 8080 not listening. Restarting with npm start..."
  pm2 delete internship-system || true
  pm2 start npm --name internship-system -- start
fi

# Check if all required tables exist and seed if needed
log_info "Checking all system tables..."
TABLES_TO_CHECK=("academic_years" "committees" "committee_members" "print_records" "provinces" "districts" "subdistricts")

for table in "${TABLES_TO_CHECK[@]}"; do
    TABLE_EXISTS=$(PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$table');" | tr -d ' ')
    
    if [ "$TABLE_EXISTS" = "t" ]; then
        DATA_COUNT=$(PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -t -c "SELECT COUNT(*) FROM $table;" | tr -d ' ')
        log_success "Table $table exists with $DATA_COUNT records"
    else
        log_warning "Table $table not found"
    fi
done

# Seed educator system data if needed
log_info "Checking if educator system data needs seeding..."
ACADEMIC_YEARS_COUNT=$(PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -t -c "SELECT COUNT(*) FROM academic_years;" | tr -d ' ' 2>/dev/null || echo "0")

if [ "$ACADEMIC_YEARS_COUNT" = "0" ]; then
    log_info "Seeding educator system data..."
    npx tsx scripts/seed-vps-educator-data.ts
else
    log_success "Educator data already exists ($ACADEMIC_YEARS_COUNT academic years)"
fi

pm2 save
EOF
    
    # Handle database
    echo ""
    read -p "🗄️  Deploy database changes? (y/n): " deploy_db
    if [ "$deploy_db" = "y" ] || [ "$deploy_db" = "Y" ]; then
        # Compare data first
        log_info "Comparing data before sync..."
        compare_data
        
        echo ""
        echo "🎯 Data Sync Strategy:"
        echo "1. 📤 Local → VPS (overwrite VPS with local data)"
        echo "2. 📥 VPS → Local (keep VPS data, sync to local)"
        echo "3. 🔄 Smart Sync (auto-detect newer data)"
        echo "4. ⏭️  Skip database sync"
        echo ""
        read -p "Choose sync strategy (1-4): " sync_choice
        
        case $sync_choice in
            1) 
                log_warning "⚠️  This will OVERWRITE VPS data with local data!"
                read -p "Are you sure? (yes/no): " confirm
                if [ "$confirm" = "yes" ]; then
                    deploy_local_to_vps
                else
                    log_info "Database sync cancelled"
                fi
                ;;
            2) 
                log_info "📥 Syncing VPS → Local (keeping production data)"
                sync_vps_to_local
                ;;
            3) smart_sync ;;
            4) log_info "Database sync skipped" ;;
            *) log_warning "Invalid choice, skipping database sync" ;;
        esac
    fi
    
    # Verify deployment
    log_info "Verifying deployment..."
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
cd /var/www/internship-system
pm2 status
echo ""
echo "🌐 Application Status:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:8080 || echo "❌ Application not responding"

echo "-- Additional health checks --"
for url in "http://127.0.0.1:3000" "http://127.0.0.1:3000/api/health"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
  echo "URL: $url -> $code"
done

if ! curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 | grep -qE '2..|3..'; then
  echo "\n❌ Health check failed. Showing recent logs:"
  echo "---- PM2 logs (last 200) ----"
  pm2 logs internship-system --lines 200 --nostream || true
  echo "---- NGINX error (last 100) ----"
  tail -n 100 /var/log/nginx/error.log 2>/dev/null || true
fi
EOF
    
    log_success "Full deployment completed!"
    log_info "🌐 VPS: http://$VPS_HOST:8080"
    log_info "📊 Check PM2 status above for application health"
}

# Smart Deploy with Error Detection
smart_deploy_with_error_detection() {
    log_info "🧠 Smart Deploy with Error Detection starting..."
    
    # Step 1: Auto-sync data first
    log_info "Step 1: Auto-detecting data sync needs..."
    compare_data
    
    echo ""
    echo "🤖 Smart Deploy Options:"
    echo "1. 📤 Deploy Local → VPS (overwrite production with local data)"
    echo "2. 📥 Sync VPS → Local (keep production data, sync to local)"
    echo "3. 🔄 Skip data sync (deploy code only)"
    echo ""
    read -p "Choose data sync strategy (1-3): " sync_choice
    
    case $sync_choice in
        1) 
            log_warning "⚠️  This will OVERWRITE VPS data with local data!"
            read -p "Are you sure? (yes/no): " confirm
            if [ "$confirm" = "yes" ]; then
                deploy_local_to_vps
            else
                log_info "Data sync cancelled, proceeding with code-only deploy"
                sync_choice=3
            fi
            ;;
        2) 
            log_info "📥 Syncing VPS → Local (keeping production data)"
            sync_vps_to_local
            ;;
        3) log_info "Skipping data sync, deploying code only" ;;
        *) 
            log_warning "Invalid choice, skipping data sync"
            sync_choice=3
            ;;
    esac
    
    # Step 2: Deploy code with enhanced error detection
    log_info "Step 2: Deploying code with error detection..."
    
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
    
    # Deploy with comprehensive error handling
    log_info "Deploying to VPS with error detection..."
    
    DEPLOY_SUCCESS=false
    ERROR_LOG=""
    
    # Execute deployment with error capture
    ERROR_LOG=$(sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
set -e  # Exit on any error

cd /var/www/internship-system
echo "📍 Working in: $(pwd)"

# Pull latest code
echo "📥 Pulling latest code..."
if ! git pull origin main; then
    echo "❌ Git pull failed"
    exit 1
fi

# Switch to production schema
echo "🔄 Switching to PostgreSQL schema..."
if [ -f "prisma/schema.production.prisma" ]; then
    cp prisma/schema.production.prisma prisma/schema.prisma
    echo "✅ Using PostgreSQL schema"
else
    echo "⚠️  Production schema not found, using current schema"
fi

# Copy production environment
echo "🔧 Setting up production environment..."
if [ -f ".env.production" ]; then
    cp .env.production .env
    echo "✅ Production environment configured"
else
    echo "⚠️  .env.production not found"
fi

# Set production environment variables
export NODE_ENV=production
export NEXT_DISABLE_SOURCEMAPS=1

# Generate Prisma client
echo "🔧 Generating Prisma client..."
if ! npx prisma generate; then
    echo "❌ Prisma generate failed"
    exit 1
fi

# Run database migrations
echo "🗄️ Running database migrations..."
if ! npx prisma db push --accept-data-loss; then
    echo "❌ Database migration failed"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
if ! npm install; then
    echo "❌ npm install failed"
    exit 1
fi

# Build application
echo "🏗️ Building application..."
if ! npm run build; then
    echo "❌ Build failed"
    exit 1
fi

# Stop existing PM2 process
echo "🔄 Managing PM2 process..."
pm2 delete internship-system >/dev/null 2>&1 || true

# Start with enhanced settings
echo "🚀 Starting application with PM2..."
if ! pm2 start npm --name "internship-system" -- start --instances 1 --max-memory-restart 350M --update-env; then
    echo "❌ PM2 start failed"
    exit 1
fi

# Save PM2 configuration
pm2 save

echo "✅ Deployment completed successfully"
EOF
 2>&1)
    
    # Check deployment result
    if [ $? -eq 0 ] && echo "$ERROR_LOG" | grep -q "✅ Deployment completed successfully"; then
        DEPLOY_SUCCESS=true
        log_success "Code deployment successful!"
    else
        log_error "Code deployment failed!"
        echo "Error details:"
        echo "$ERROR_LOG"
    fi
    
    # Step 3: Comprehensive health checks
    log_info "Step 3: Running comprehensive health checks..."
    
    HEALTH_CHECKS_PASSED=0
    TOTAL_CHECKS=0
    
    # Check 1: PM2 Status
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    log_info "Health Check 1: PM2 Status"
    PM2_STATUS=$(sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" "cd /var/www/internship-system && pm2 status" 2>/dev/null)
    if echo "$PM2_STATUS" | grep -q "online"; then
        log_success "✅ PM2 process is online"
        HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1))
    else
        log_error "❌ PM2 process is not online"
        echo "$PM2_STATUS"
    fi
    
    # Check 2: Port 8080 listening
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    log_info "Health Check 2: Port 8080 Listening"
    PORT_CHECK=$(sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" "ss -ltnp | grep :8080" 2>/dev/null)
    if [ -n "$PORT_CHECK" ]; then
        log_success "✅ Port 8080 is listening"
        HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1))
    else
        log_error "❌ Port 8080 is not listening"
    fi
    
    # Check 3: Application HTTP response
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    log_info "Health Check 3: Application HTTP Response"
    HTTP_RESPONSE=$(sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" "curl -s -o /dev/null -w '%{http_code}' http://localhost:8080" 2>/dev/null)
    if [ "$HTTP_RESPONSE" = "200" ] || [ "$HTTP_RESPONSE" = "302" ]; then
        log_success "✅ Application responds with HTTP $HTTP_RESPONSE"
        HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1))
    else
        log_error "❌ Application HTTP response: $HTTP_RESPONSE"
    fi
    
    # Check 4: Database connectivity
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    log_info "Health Check 4: Database Connectivity"
    DB_CHECK=$(sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" "cd /var/www/internship-system && PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -c 'SELECT 1;' -t" 2>/dev/null)
    if [ "$DB_CHECK" = "1" ]; then
        log_success "✅ Database connection successful"
        HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1))
    else
        log_error "❌ Database connection failed"
    fi
    
    # Check 5: Nginx status (if applicable)
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    log_info "Health Check 5: Nginx Status"
    NGINX_STATUS=$(sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" "systemctl is-active nginx" 2>/dev/null)
    if [ "$NGINX_STATUS" = "active" ]; then
        log_success "✅ Nginx is active"
        HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1))
    else
        log_warning "⚠️  Nginx status: $NGINX_STATUS"
    fi
    
    # Step 4: Error diagnosis and auto-fix
    log_info "Step 4: Error diagnosis and auto-fix..."
    
    if [ $HEALTH_CHECKS_PASSED -lt $TOTAL_CHECKS ]; then
        log_warning "⚠️  Some health checks failed ($HEALTH_CHECKS_PASSED/$TOTAL_CHECKS passed)"
        
        # Auto-fix attempts
        log_info "Attempting auto-fixes..."
        
        # Fix 1: Restart PM2 if not online
        if ! echo "$PM2_STATUS" | grep -q "online"; then
            log_info "Auto-fix: Restarting PM2..."
            sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
cd /var/www/internship-system
pm2 delete internship-system || true
pm2 start npm --name "internship-system" -- start
pm2 save
EOF
        fi
        
        # Fix 2: Check and fix port binding
        if [ -z "$PORT_CHECK" ]; then
            log_info "Auto-fix: Checking port binding..."
            sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
cd /var/www/internship-system
# Kill any process on port 8080
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
# Restart PM2
pm2 restart internship-system || pm2 start npm --name "internship-system" -- start
EOF
        fi
        
        # Re-run health checks after fixes
        log_info "Re-running health checks after fixes..."
        sleep 5
        
        # Quick re-check
        FINAL_HTTP=$(sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" "curl -s -o /dev/null -w '%{http_code}' http://localhost:8080" 2>/dev/null)
        if [ "$FINAL_HTTP" = "200" ] || [ "$FINAL_HTTP" = "302" ]; then
            log_success "✅ Auto-fix successful! Application now responding"
        else
            log_error "❌ Auto-fix failed. Manual intervention required."
            
            # Show diagnostic information
            log_info "Diagnostic information:"
            sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
echo "=== PM2 Status ==="
pm2 status
echo ""
echo "=== PM2 Logs (last 50 lines) ==="
pm2 logs internship-system --lines 50 --nostream || true
echo ""
echo "=== Port Status ==="
ss -ltnp | grep :8080 || echo "Port 8080 not listening"
echo ""
echo "=== Nginx Status ==="
systemctl status nginx --no-pager || true
EOF
        fi
    else
        log_success "🎉 All health checks passed! ($HEALTH_CHECKS_PASSED/$TOTAL_CHECKS)"
    fi
    
    # Final summary
    echo ""
    echo "📊 SMART DEPLOY SUMMARY:"
    echo "========================"
    echo "Data Sync: $([ $sync_choice -ne 3 ] && echo "✅ Completed" || echo "⏭️  Skipped")"
    echo "Code Deploy: $([ "$DEPLOY_SUCCESS" = true ] && echo "✅ Successful" || echo "❌ Failed")"
    echo "Health Checks: $HEALTH_CHECKS_PASSED/$TOTAL_CHECKS passed"
    echo "Application URL: http://$VPS_HOST:8080"
    echo ""
    
    if [ "$DEPLOY_SUCCESS" = true ] && [ $HEALTH_CHECKS_PASSED -eq $TOTAL_CHECKS ]; then
        log_success "🎉 Smart Deploy completed successfully!"
    else
        log_warning "⚠️  Smart Deploy completed with issues. Check logs above."
    fi
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
                log_info "Opening SSH session to VPS..."
                sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST"
                ;;
            8)
                log_info "Running quick restart script on VPS..."
                bash scripts/restart-on-vps.sh
                ;;
            9)
                log_warning "This will rebuild app and rewrite Nginx config. Continue?"
                read -p "Type 'yes' to proceed: " confirm
                if [ "$confirm" = "yes" ]; then
                    bash scripts/provision-or-reinstall.sh
                else
                    log_info "Skipped provision/reinstall"
                fi
                ;;
            10)
                smart_deploy_with_error_detection
                ;;
            11) 
                log_success "Goodbye! 👋"
                exit 0
                ;;
            *)
                log_warning "Invalid option. Please choose 1-11."
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
