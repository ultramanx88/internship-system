#!/bin/bash

# 🧪 TEST PERFECT DEPLOY SCRIPT
echo "🧪 Testing Perfect Deploy Script"
echo "================================"

# Configuration
VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PASSWORD="rp4QkUUvmbi5qB"
VPS_PROJECT_DIR="/var/www/internship-system"

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

# Test VPS connection
test_vps_connection() {
    log_info "Testing VPS connection..."
    if sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" "echo 'VPS connection successful'"; then
        log_success "VPS connection OK"
        return 0
    else
        log_error "VPS connection failed"
        return 1
    fi
}

# Test if educator tables exist in VPS
test_educator_tables() {
    log_info "Checking educator tables in VPS..."
    
    TABLE_EXISTS=$(sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
cd /var/www/internship-system
PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'academic_years');" | tr -d ' '
EOF
)

    if [ "$TABLE_EXISTS" = "t" ]; then
        log_success "Educator tables exist in VPS"
        
        # Check data count
        DATA_COUNT=$(sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
cd /var/www/internship-system
PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -t -c "SELECT COUNT(*) FROM academic_years;" | tr -d ' '
EOF
)
        
        log_info "Academic years count: $DATA_COUNT"
        
        if [ "$DATA_COUNT" = "0" ]; then
            log_warning "No educator data found, seeding needed"
            return 2
        else
            log_success "Educator data exists ($DATA_COUNT academic years)"
            return 0
        fi
    else
        log_error "Educator tables not found in VPS"
        return 1
    fi
}

# Test local educator data
test_local_educator_data() {
    log_info "Checking local educator data..."
    
    # Check if local tables exist
    if sqlite3 prisma/dev.db "SELECT name FROM sqlite_master WHERE type='table' AND name='academic_years';" | grep -q "academic_years"; then
        log_success "Local educator tables exist"
        
        # Check data count
        LOCAL_COUNT=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM academic_years;")
        log_info "Local academic years count: $LOCAL_COUNT"
        
        if [ "$LOCAL_COUNT" -gt 0 ]; then
            log_success "Local educator data exists"
            return 0
        else
            log_warning "No local educator data found"
            return 1
        fi
    else
        log_error "Local educator tables not found"
        return 1
    fi
}

# Main test function
main() {
    echo ""
    log_info "Starting Perfect Deploy Test..."
    echo ""
    
    # Test 1: VPS Connection
    if ! test_vps_connection; then
        log_error "Cannot proceed without VPS connection"
        exit 1
    fi
    
    echo ""
    
    # Test 2: Local Educator Data
    test_local_educator_data
    LOCAL_STATUS=$?
    
    echo ""
    
    # Test 3: VPS Educator Tables
    test_educator_tables
    VPS_STATUS=$?
    
    echo ""
    echo "📊 TEST RESULTS:"
    echo "================"
    
    if [ $LOCAL_STATUS -eq 0 ]; then
        log_success "Local educator data: OK"
    else
        log_warning "Local educator data: NEEDS SETUP"
    fi
    
    if [ $VPS_STATUS -eq 0 ]; then
        log_success "VPS educator data: OK"
    elif [ $VPS_STATUS -eq 1 ]; then
        log_error "VPS educator tables: MISSING"
    else
        log_warning "VPS educator data: NEEDS SEEDING"
    fi
    
    echo ""
    
    if [ $VPS_STATUS -eq 1 ]; then
        log_warning "💡 Recommendation: Run Full Deploy (Option 5) to create tables and seed data"
    elif [ $VPS_STATUS -eq 2 ]; then
        log_warning "💡 Recommendation: Run Full Deploy (Option 5) to seed data only"
    else
        log_success "💡 System is ready for normal deployment"
    fi
}

# Run main function
main
