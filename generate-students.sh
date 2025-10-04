#!/bin/bash

# 🎓 GENERATE SAMPLE STUDENTS
echo "🎓 Generating Sample Students"
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

# Check if database exists
if [ ! -f "prisma/dev.db" ]; then
    log_error "Database not found! Please run 'npx prisma db push' first."
    exit 1
fi

# Check if required tables exist
log_info "Checking required tables..."
TABLES_EXIST=$(sqlite3 prisma/dev.db "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users', 'faculties', 'departments', 'curriculums', 'majors');" | wc -l)

if [ "$TABLES_EXIST" -lt 5 ]; then
    log_error "Required tables not found! Please run the setup scripts first."
    exit 1
fi

log_success "Required tables found"

# Check current student count
CURRENT_STUDENTS=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM users WHERE roles = 'student';")
log_info "Current students in database: $CURRENT_STUDENTS"

# Generate Prisma client
log_info "Generating Prisma client..."
npx prisma generate

if [ $? -eq 0 ]; then
    log_success "Prisma client generated successfully"
else
    log_error "Failed to generate Prisma client"
    exit 1
fi

# Run the student generation script
log_info "Running student generation script..."
npx tsx scripts/generate-sample-students.ts

if [ $? -eq 0 ]; then
    log_success "Student generation completed successfully"
else
    log_error "Student generation failed"
    exit 1
fi

# Show final statistics
log_info "Final statistics:"
NEW_STUDENTS=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM users WHERE roles = 'student';")
log_success "Total students in database: $NEW_STUDENTS"

# Show sample of generated students
log_info "Sample of generated students:"
sqlite3 prisma/dev.db "SELECT name, email, t_name, t_surname, studentYear, gpa FROM users WHERE roles = 'student' ORDER BY createdAt DESC LIMIT 5;" | while IFS='|' read -r name email t_name t_surname studentYear gpa; do
    echo "  📚 $name ($email) - Year $studentYear, GPA: $gpa"
done

echo ""
log_success "🎉 Sample students generation completed!"
log_info "💡 You can now test the system with these sample students"
