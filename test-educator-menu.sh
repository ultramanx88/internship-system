#!/bin/bash

# 🎓 TEST EDUCATOR MENU SYSTEM
echo "🎓 Testing Educator Menu System"
echo "==============================="

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
    log_info "Testing Educator API endpoints..."
    
    # Test educator roles API
    log_info "Testing /api/educator-roles..."
    ROLES_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8080/api/educator-roles)
    ROLES_HTTP_CODE="${ROLES_RESPONSE: -3}"
    ROLES_BODY="${ROLES_RESPONSE%???}"
    
    if [ "$ROLES_HTTP_CODE" = "200" ]; then
        ROLES_COUNT=$(echo "$ROLES_BODY" | jq 'length' 2>/dev/null || echo "0")
        log_success "Educator Roles API: OK ($ROLES_COUNT roles)"
    else
        log_error "Educator Roles API: FAILED (HTTP $ROLES_HTTP_CODE)"
    fi
    
    # Test educator management API
    log_info "Testing /api/educator-management..."
    EDUCATOR_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8080/api/educator-management)
    EDUCATOR_HTTP_CODE="${EDUCATOR_RESPONSE: -3}"
    EDUCATOR_BODY="${EDUCATOR_RESPONSE%???}"
    
    if [ "$EDUCATOR_HTTP_CODE" = "200" ]; then
        ROLES_COUNT=$(echo "$EDUCATOR_BODY" | jq '.educatorRoles | length' 2>/dev/null || echo "0")
        INSTRUCTORS_COUNT=$(echo "$EDUCATOR_BODY" | jq '.courseInstructors | length' 2>/dev/null || echo "0")
        log_success "Educator Management API: OK ($ROLES_COUNT roles, $INSTRUCTORS_COUNT instructors)"
    else
        log_error "Educator Management API: FAILED (HTTP $EDUCATOR_HTTP_CODE)"
    fi
}

# Test pages
test_pages() {
    log_info "Testing Educator pages..."
    
    # Test educator demo page
    log_info "Testing /educator/demo..."
    DEMO_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8080/educator/demo)
    DEMO_HTTP_CODE="${DEMO_RESPONSE: -3}"
    
    if [ "$DEMO_HTTP_CODE" = "200" ]; then
        log_success "Educator Demo Page: OK"
    else
        log_error "Educator Demo Page: FAILED (HTTP $DEMO_HTTP_CODE)"
    fi
    
    # Test educator role selector page
    log_info "Testing /educator/role-selector..."
    SELECTOR_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8080/educator/role-selector)
    SELECTOR_HTTP_CODE="${SELECTOR_RESPONSE: -3}"
    
    if [ "$SELECTOR_HTTP_CODE" = "200" ]; then
        log_success "Educator Role Selector Page: OK"
    else
        log_error "Educator Role Selector Page: FAILED (HTTP $SELECTOR_HTTP_CODE)"
    fi
}

# Test database data
test_database_data() {
    log_info "Testing educator database data..."
    
    # Check educator roles
    ROLES_COUNT=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM educator_roles;" 2>/dev/null || echo "0")
    if [ "$ROLES_COUNT" -gt 0 ]; then
        log_success "Educator Roles in DB: $ROLES_COUNT"
    else
        log_error "No educator roles in database"
    fi
    
    # Check course instructors
    INSTRUCTORS_COUNT=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM course_instructors;" 2>/dev/null || echo "0")
    if [ "$INSTRUCTORS_COUNT" -gt 0 ]; then
        log_success "Course Instructors in DB: $INSTRUCTORS_COUNT"
    else
        log_error "No course instructors in database"
    fi
    
    # Check users with educator roles
    EDUCATOR_USERS=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM users WHERE educatorRoleId IS NOT NULL;" 2>/dev/null || echo "0")
    if [ "$EDUCATOR_USERS" -gt 0 ]; then
        log_success "Users with Educator Roles: $EDUCATOR_USERS"
    else
        log_warning "No users with educator roles found"
    fi
}

# Test menu system
test_menu_system() {
    log_info "Testing menu system components..."
    
    # Check if components exist
    if [ -f "src/components/educator/EducatorMenu.tsx" ]; then
        log_success "EducatorMenu component: EXISTS"
    else
        log_error "EducatorMenu component: MISSING"
    fi
    
    if [ -f "src/hooks/useEducatorRole.ts" ]; then
        log_success "useEducatorRole hook: EXISTS"
    else
        log_error "useEducatorRole hook: MISSING"
    fi
    
    if [ -f "src/app/(dashboard)/educator/layout.tsx" ]; then
        log_success "Educator layout: EXISTS"
    else
        log_error "Educator layout: MISSING"
    fi
}

# Main test function
main() {
    echo ""
    log_info "Starting Educator Menu System Test..."
    echo ""
    
    # Test 1: Database Data
    test_database_data
    echo ""
    
    # Test 2: API Endpoints
    test_api_endpoints
    echo ""
    
    # Test 3: Pages
    test_pages
    echo ""
    
    # Test 4: Menu System
    test_menu_system
    echo ""
    
    echo "📊 TEST SUMMARY:"
    echo "================"
    log_info "All tests completed. Check results above for any issues."
    echo ""
    log_info "💡 To test the menu system:"
    log_info "   1. Open http://localhost:8080/educator/demo"
    log_info "   2. Try different role combinations"
    log_info "   3. Check if menu items appear/disappear correctly"
    echo ""
    log_info "🎯 Menu System Features:"
    log_info "   - Dynamic menu based on user role and educator role"
    log_info "   - Role-based access control"
    log_info "   - Responsive design"
    log_info "   - Easy role switching"
}

# Run main function
main
