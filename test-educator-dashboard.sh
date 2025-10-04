#!/bin/bash

# 🎓 TEST EDUCATOR DASHBOARD
echo "🎓 Testing Educator Dashboard"
echo "============================="

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

# Test API endpoints
test_api_endpoints() {
    log_info "Testing Educator Dashboard API endpoints..."
    
    # Test dashboard API
    log_info "Testing /api/educator/dashboard..."
    DASHBOARD_RESPONSE=$(curl -s -w "%{http_code}" "http://localhost:8080/api/educator/dashboard?userId=test&role=อาจารย์ประจำวิชา")
    DASHBOARD_HTTP_CODE="${DASHBOARD_RESPONSE: -3}"
    DASHBOARD_BODY="${DASHBOARD_RESPONSE%???}"
    
    if [ "$DASHBOARD_HTTP_CODE" = "200" ]; then
        log_success "Dashboard API: OK"
        echo "Response preview:"
        echo "$DASHBOARD_BODY" | jq '.user, .upcomingSchedule | length, .myTasks | length' 2>/dev/null || echo "Response received"
    else
        log_error "Dashboard API: FAILED (HTTP $DASHBOARD_HTTP_CODE)"
    fi
}

# Test pages
test_pages() {
    log_info "Testing Educator Dashboard pages..."
    
    # Test dashboard page
    log_info "Testing /educator/dashboard..."
    DASHBOARD_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8080/educator/dashboard)
    DASHBOARD_HTTP_CODE="${DASHBOARD_RESPONSE: -3}"
    
    if [ "$DASHBOARD_HTTP_CODE" = "200" ]; then
        log_success "Educator Dashboard Page: OK"
    else
        log_error "Educator Dashboard Page: FAILED (HTTP $DASHBOARD_HTTP_CODE)"
    fi
    
    # Test dashboard v2 page
    log_info "Testing /educator/dashboard-v2..."
    DASHBOARD_V2_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8080/educator/dashboard-v2)
    DASHBOARD_V2_HTTP_CODE="${DASHBOARD_V2_RESPONSE: -3}"
    
    if [ "$DASHBOARD_V2_HTTP_CODE" = "200" ]; then
        log_success "Educator Dashboard V2 Page: OK"
    else
        log_error "Educator Dashboard V2 Page: FAILED (HTTP $DASHBOARD_V2_HTTP_CODE)"
    fi
}

# Test components
test_components() {
    log_info "Testing dashboard components..."
    
    # Check if components exist
    if [ -f "src/app/(dashboard)/educator/dashboard/page.tsx" ]; then
        log_success "Dashboard page: EXISTS"
    else
        log_error "Dashboard page: MISSING"
    fi
    
    if [ -f "src/app/(dashboard)/educator/dashboard-v2/page.tsx" ]; then
        log_success "Dashboard V2 page: EXISTS"
    else
        log_error "Dashboard V2 page: MISSING"
    fi
    
    if [ -f "src/app/api/educator/dashboard/route.ts" ]; then
        log_success "Dashboard API: EXISTS"
    else
        log_error "Dashboard API: MISSING"
    fi
    
    if [ -f "src/components/ui/progress.tsx" ]; then
        log_success "Progress component: EXISTS"
    else
        log_error "Progress component: MISSING"
    fi
}

# Test database data
test_database_data() {
    log_info "Testing dashboard database data..."
    
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
    
    # Check supervised students
    SUPERVISED_COUNT=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM supervised_students;" 2>/dev/null || echo "0")
    if [ "$SUPERVISED_COUNT" -gt 0 ]; then
        log_success "Supervised Students: $SUPERVISED_COUNT"
    else
        log_warning "No supervised students found"
    fi
}

# Main test function
main() {
    echo ""
    log_info "Starting Educator Dashboard Test..."
    echo ""
    
    # Test 1: Database Data
    test_database_data
    echo ""
    
    # Test 2: Components
    test_components
    echo ""
    
    # Test 3: API Endpoints
    test_api_endpoints
    echo ""
    
    # Test 4: Pages
    test_pages
    echo ""
    
    echo "📊 TEST SUMMARY:"
    echo "================"
    log_info "All tests completed. Check results above for any issues."
    echo ""
    log_info "💡 To test the dashboard:"
    log_info "   1. Open http://localhost:8080/educator/dashboard"
    log_info "   2. Open http://localhost:8080/educator/dashboard-v2"
    log_info "   3. Check if all sections display correctly"
    echo ""
    log_info "🎯 Dashboard Features:"
    log_info "   - Upcoming Schedule"
    log_info "   - Student Document Statistics (Donut Chart)"
    log_info "   - My Tasks (Role-based)"
    log_info "   - Student List"
    log_info "   - Co-op Steps"
    log_info "   - Notifications"
    echo ""
    log_info "📱 Dashboard Layout:"
    log_info "   - Left Column (2/3): Main content"
    log_info "   - Right Column (1/3): Sidebar content"
    log_info "   - Responsive design"
    log_info "   - Role-based data display"
}

# Run main function
main
