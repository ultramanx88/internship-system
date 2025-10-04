#!/bin/bash

# 🧪 TEST SETTINGS SYSTEM
echo "🧪 Testing Settings System"
echo "=========================="

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
    log_info "Testing API endpoints..."
    
    # Test faculties API
    log_info "Testing /api/faculties..."
    FACULTIES_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8080/api/faculties)
    FACULTIES_HTTP_CODE="${FACULTIES_RESPONSE: -3}"
    FACULTIES_BODY="${FACULTIES_RESPONSE%???}"
    
    if [ "$FACULTIES_HTTP_CODE" = "200" ]; then
        FACULTIES_COUNT=$(echo "$FACULTIES_BODY" | jq '.faculties | length' 2>/dev/null || echo "0")
        log_success "Faculties API: OK ($FACULTIES_COUNT faculties)"
    else
        log_error "Faculties API: FAILED (HTTP $FACULTIES_HTTP_CODE)"
    fi
    
    # Test academic years API
    log_info "Testing /api/academic-years..."
    ACADEMIC_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8080/api/academic-years)
    ACADEMIC_HTTP_CODE="${ACADEMIC_RESPONSE: -3}"
    ACADEMIC_BODY="${ACADEMIC_RESPONSE%???}"
    
    if [ "$ACADEMIC_HTTP_CODE" = "200" ]; then
        ACADEMIC_COUNT=$(echo "$ACADEMIC_BODY" | jq 'length' 2>/dev/null || echo "0")
        log_success "Academic Years API: OK ($ACADEMIC_COUNT years)"
    else
        log_error "Academic Years API: FAILED (HTTP $ACADEMIC_HTTP_CODE)"
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
    
    # Test semesters API
    log_info "Testing /api/semesters..."
    SEMESTERS_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8080/api/semesters)
    SEMESTERS_HTTP_CODE="${SEMESTERS_RESPONSE: -3}"
    SEMESTERS_BODY="${SEMESTERS_RESPONSE%???}"
    
    if [ "$SEMESTERS_HTTP_CODE" = "200" ]; then
        SEMESTERS_COUNT=$(echo "$SEMESTERS_BODY" | jq 'length' 2>/dev/null || echo "0")
        log_success "Semesters API: OK ($SEMESTERS_COUNT semesters)"
    else
        log_error "Semesters API: FAILED (HTTP $SEMESTERS_HTTP_CODE)"
    fi
}

# Test database data
test_database_data() {
    log_info "Testing database data..."
    
    # Check faculties
    FACULTIES_COUNT=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM faculties;" 2>/dev/null || echo "0")
    if [ "$FACULTIES_COUNT" -gt 0 ]; then
        log_success "Faculties in DB: $FACULTIES_COUNT"
    else
        log_error "No faculties in database"
    fi
    
    # Check academic years
    ACADEMIC_COUNT=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM academic_years;" 2>/dev/null || echo "0")
    if [ "$ACADEMIC_COUNT" -gt 0 ]; then
        log_success "Academic Years in DB: $ACADEMIC_COUNT"
    else
        log_error "No academic years in database"
    fi
    
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
}

# Test settings pages
test_settings_pages() {
    log_info "Testing settings pages..."
    
    # Test admin settings page
    log_info "Testing /admin/settings..."
    ADMIN_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8080/admin/settings)
    ADMIN_HTTP_CODE="${ADMIN_RESPONSE: -3}"
    
    if [ "$ADMIN_HTTP_CODE" = "200" ]; then
        log_success "Admin Settings Page: OK"
    else
        log_error "Admin Settings Page: FAILED (HTTP $ADMIN_HTTP_CODE)"
    fi
    
    # Test staff settings page
    log_info "Testing /staff/settings..."
    STAFF_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8080/staff/settings)
    STAFF_HTTP_CODE="${STAFF_RESPONSE: -3}"
    
    if [ "$STAFF_HTTP_CODE" = "200" ]; then
        log_success "Staff Settings Page: OK"
    else
        log_error "Staff Settings Page: FAILED (HTTP $STAFF_HTTP_CODE)"
    fi
}

# Test data relationships
test_data_relationships() {
    log_info "Testing data relationships..."
    
    # Check faculty-department relationship
    FACULTY_DEPT_COUNT=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM departments d JOIN faculties f ON d.facultyId = f.id;" 2>/dev/null || echo "0")
    if [ "$FACULTY_DEPT_COUNT" -gt 0 ]; then
        log_success "Faculty-Department relationships: $FACULTY_DEPT_COUNT"
    else
        log_warning "No faculty-department relationships found"
    fi
    
    # Check course instructor relationships
    INSTRUCTOR_REL_COUNT=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM course_instructors ci JOIN users u ON ci.instructorId = u.id JOIN educator_roles er ON ci.roleId = er.id;" 2>/dev/null || echo "0")
    if [ "$INSTRUCTOR_REL_COUNT" -gt 0 ]; then
        log_success "Course Instructor relationships: $INSTRUCTOR_REL_COUNT"
    else
        log_warning "No course instructor relationships found"
    fi
    
    # Check semester-academic year relationships
    SEMESTER_YEAR_COUNT=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM semesters s JOIN academic_years ay ON s.academicYearId = ay.id;" 2>/dev/null || echo "0")
    if [ "$SEMESTER_YEAR_COUNT" -gt 0 ]; then
        log_success "Semester-Academic Year relationships: $SEMESTER_YEAR_COUNT"
    else
        log_warning "No semester-academic year relationships found"
    fi
}

# Main test function
main() {
    echo ""
    log_info "Starting Settings System Test..."
    echo ""
    
    # Test 1: Database Data
    test_database_data
    echo ""
    
    # Test 2: API Endpoints
    test_api_endpoints
    echo ""
    
    # Test 3: Settings Pages
    test_settings_pages
    echo ""
    
    # Test 4: Data Relationships
    test_data_relationships
    echo ""
    
    echo "📊 TEST SUMMARY:"
    echo "================"
    log_info "All tests completed. Check results above for any issues."
    echo ""
    log_info "💡 If any tests failed, check:"
    log_info "   - Database connection"
    log_info "   - API endpoint implementations"
    log_info "   - Data relationships in Prisma schema"
    log_info "   - Frontend component data loading"
}

# Run main function
main
