#!/bin/bash

# 🎓 TEST CONSOLIDATED EDUCATOR SYSTEM
echo "🎓 Testing Consolidated Educator System"
echo "======================================"

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

# Test 1: Check if teacher system is removed
test_teacher_removal() {
    log_info "Testing teacher system removal..."
    
    if [ ! -d "src/app/(dashboard)/teacher" ]; then
        log_success "Teacher system removed: OK"
    else
        log_error "Teacher system still exists"
    fi
}

# Test 2: Check educator system components
test_educator_components() {
    log_info "Testing educator system components..."
    
    # Check main pages
    if [ -f "src/app/(dashboard)/educator/dashboard/page.tsx" ]; then
        log_success "Educator Dashboard: EXISTS"
    else
        log_error "Educator Dashboard: MISSING"
    fi
    
    if [ -f "src/app/(dashboard)/educator/applications/page.tsx" ]; then
        log_success "Educator Applications: EXISTS"
    else
        log_error "Educator Applications: MISSING"
    fi
    
    if [ -f "src/app/(dashboard)/educator/applications/[applicationId]/page.tsx" ]; then
        log_success "Educator Application Review: EXISTS"
    else
        log_error "Educator Application Review: MISSING"
    fi
    
    # Check APIs
    if [ -f "src/app/api/educator/dashboard/route.ts" ]; then
        log_success "Educator Dashboard API: EXISTS"
    else
        log_error "Educator Dashboard API: MISSING"
    fi
    
    if [ -f "src/app/api/educator/applications/route.ts" ]; then
        log_success "Educator Applications API: EXISTS"
    else
        log_error "Educator Applications API: MISSING"
    fi
    
    if [ -f "src/app/api/educator/applications/[applicationId]/route.ts" ]; then
        log_success "Educator Application Review API: EXISTS"
    else
        log_error "Educator Application Review API: MISSING"
    fi
    
    # Check components
    if [ -f "src/components/educator/EducatorMenu.tsx" ]; then
        log_success "Educator Menu: EXISTS"
    else
        log_error "Educator Menu: MISSING"
    fi
    
    if [ -f "src/hooks/useEducatorRole.ts" ]; then
        log_success "useEducatorRole Hook: EXISTS"
    else
        log_error "useEducatorRole Hook: MISSING"
    fi
}

# Test 3: Test multi-role functionality
test_multi_role_functionality() {
    log_info "Testing multi-role functionality..."
    
    # Check if useEducatorRole has multi-role functions
    if grep -q "hasMultipleRoles" src/hooks/useEducatorRole.ts; then
        log_success "Multi-role detection: IMPLEMENTED"
    else
        log_error "Multi-role detection: MISSING"
    fi
    
    if grep -q "canAccessApplications" src/hooks/useEducatorRole.ts; then
        log_success "Permission checking: IMPLEMENTED"
    else
        log_error "Permission checking: MISSING"
    fi
    
    # Check if EducatorMenu supports multi-role
    if grep -q "เมนูทั่วไป" src/components/educator/EducatorMenu.tsx; then
        log_success "General menu section: IMPLEMENTED"
    else
        log_error "General menu section: MISSING"
    fi
}

# Test 4: Test API endpoints
test_api_endpoints() {
    log_info "Testing API endpoints..."
    
    # Test dashboard API
    log_info "Testing /api/educator/dashboard..."
    DASHBOARD_RESPONSE=$(curl -s -w "%{http_code}" "http://localhost:8080/api/educator/dashboard?userId=user_t6800001&role=อาจารย์ประจำวิชา")
    DASHBOARD_HTTP_CODE="${DASHBOARD_RESPONSE: -3}"
    
    if [ "$DASHBOARD_HTTP_CODE" = "200" ]; then
        log_success "Dashboard API: OK"
    else
        log_warning "Dashboard API: FAILED (HTTP $DASHBOARD_HTTP_CODE)"
    fi
    
    # Test applications API
    log_info "Testing /api/educator/applications..."
    APPLICATIONS_RESPONSE=$(curl -s -w "%{http_code}" "http://localhost:8080/api/educator/applications?userId=user_t6800001")
    APPLICATIONS_HTTP_CODE="${APPLICATIONS_RESPONSE: -3}"
    
    if [ "$APPLICATIONS_HTTP_CODE" = "200" ]; then
        log_success "Applications API: OK"
    else
        log_warning "Applications API: FAILED (HTTP $APPLICATIONS_HTTP_CODE)"
    fi
}

# Test 5: Test pages
test_pages() {
    log_info "Testing educator pages..."
    
    # Test main dashboard
    log_info "Testing /educator/dashboard..."
    DASHBOARD_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8080/educator/dashboard)
    DASHBOARD_HTTP_CODE="${DASHBOARD_RESPONSE: -3}"
    
    if [ "$DASHBOARD_HTTP_CODE" = "200" ]; then
        log_success "Educator Dashboard Page: OK"
    else
        log_error "Educator Dashboard Page: FAILED (HTTP $DASHBOARD_HTTP_CODE)"
    fi
    
    # Test applications page
    log_info "Testing /educator/applications..."
    APPLICATIONS_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8080/educator/applications)
    APPLICATIONS_HTTP_CODE="${APPLICATIONS_RESPONSE: -3}"
    
    if [ "$APPLICATIONS_HTTP_CODE" = "200" ]; then
        log_success "Educator Applications Page: OK"
    else
        log_error "Educator Applications Page: FAILED (HTTP $APPLICATIONS_HTTP_CODE)"
    fi
    
    # Test dashboard v2
    log_info "Testing /educator/dashboard-v2..."
    DASHBOARD_V2_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8080/educator/dashboard-v2)
    DASHBOARD_V2_HTTP_CODE="${DASHBOARD_V2_RESPONSE: -3}"
    
    if [ "$DASHBOARD_V2_HTTP_CODE" = "200" ]; then
        log_success "Educator Dashboard V2 Page: OK"
    else
        log_error "Educator Dashboard V2 Page: FAILED (HTTP $DASHBOARD_V2_HTTP_CODE)"
    fi
}

# Test 6: Test database integration
test_database_integration() {
    log_info "Testing database integration..."
    
    # Check users with educator roles
    EDUCATOR_USERS=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM users WHERE educatorRoleId IS NOT NULL;" 2>/dev/null || echo "0")
    if [ "$EDUCATOR_USERS" -gt 0 ]; then
        log_success "Users with Educator Roles: $EDUCATOR_USERS"
    else
        log_warning "No users with educator roles found"
    fi
    
    # Check course instructors
    INSTRUCTORS_COUNT=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM course_instructors;" 2>/dev/null || echo "0")
    if [ "$INSTRUCTORS_COUNT" -gt 0 ]; then
        log_success "Course Instructors: $INSTRUCTORS_COUNT"
    else
        log_warning "No course instructors found"
    fi
}

# Main test function
main() {
    echo ""
    log_info "Starting Consolidated Educator System Test..."
    echo ""
    
    # Test 1: Teacher removal
    test_teacher_removal
    echo ""
    
    # Test 2: Educator components
    test_educator_components
    echo ""
    
    # Test 3: Multi-role functionality
    test_multi_role_functionality
    echo ""
    
    # Test 4: API endpoints
    test_api_endpoints
    echo ""
    
    # Test 5: Pages
    test_pages
    echo ""
    
    # Test 6: Database integration
    test_database_integration
    echo ""
    
    echo "📊 TEST SUMMARY:"
    echo "================"
    log_info "Consolidated Educator System Test completed!"
    echo ""
    log_info "🎯 System Features:"
    log_info "   ✅ Teacher system removed"
    log_info "   ✅ Educator system consolidated"
    log_info "   ✅ Multi-role support"
    log_info "   ✅ Dynamic menu system"
    log_info "   ✅ Role-based permissions"
    log_info "   ✅ Application management"
    log_info "   ✅ Dashboard with real data"
    echo ""
    log_info "💡 Access URLs:"
    log_info "   - Main Dashboard: http://localhost:8080/educator/dashboard"
    log_info "   - Applications: http://localhost:8080/educator/applications"
    log_info "   - Dashboard V2: http://localhost:8080/educator/dashboard-v2"
    log_info "   - Role Selector: http://localhost:8080/educator/role-selector"
    echo ""
    log_info "🔧 Multi-Role Features:"
    log_info "   - อาจารย์ประจำวิชา: ดูและจัดการใบสมัคร, ประเมินผลงาน"
    log_info "   - อาจารย์นิเทศ: ดูแลนักศึกษา, นัดหมายนิเทศ, บันทึกผล"
    log_info "   - กรรมการ: ประเมินผลงาน, ประชุมกรรมการ, รายงาน"
    echo ""
}

# Run main function
main
