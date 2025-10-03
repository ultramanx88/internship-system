#!/bin/bash

# Setup Local Database Script
echo "🚀 Setting up local database..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PostgreSQL is installed
print_status "Checking PostgreSQL installation..."
if command -v psql &> /dev/null; then
    print_success "PostgreSQL is installed"
    psql --version
else
    print_error "PostgreSQL is not installed"
    print_status "Installing PostgreSQL via Homebrew..."
    brew install postgresql@15
    brew services start postgresql@15
fi

# Check if PostgreSQL service is running
print_status "Checking PostgreSQL service..."
if brew services list | grep postgresql | grep started &> /dev/null; then
    print_success "PostgreSQL service is running"
else
    print_warning "PostgreSQL service is not running. Starting..."
    brew services start postgresql@15
    sleep 3
fi

# Create database
print_status "Creating database..."
DB_NAME="internship_system_dev"

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    print_warning "Database '$DB_NAME' already exists"
else
    createdb $DB_NAME
    if [ $? -eq 0 ]; then
        print_success "Database '$DB_NAME' created successfully"
    else
        print_error "Failed to create database '$DB_NAME'"
        exit 1
    fi
fi

# Test database connection
print_status "Testing database connection..."
if psql -d $DB_NAME -c "SELECT version();" &> /dev/null; then
    print_success "Database connection successful"
else
    print_error "Database connection failed"
    exit 1
fi

# Run Prisma commands
print_status "Setting up Prisma..."

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate
if [ $? -eq 0 ]; then
    print_success "Prisma client generated"
else
    print_error "Failed to generate Prisma client"
    exit 1
fi

# Push database schema
print_status "Pushing database schema..."
npx prisma db push
if [ $? -eq 0 ]; then
    print_success "Database schema pushed"
else
    print_error "Failed to push database schema"
    exit 1
fi

# Seed database
print_status "Seeding database..."
npm run db:seed
if [ $? -eq 0 ]; then
    print_success "Database seeded successfully"
else
    print_warning "Database seeding failed or no seed script found"
fi

# Final status
print_success "Local database setup completed!"
print_status "Database URL: postgresql://postgres@localhost:5432/$DB_NAME"
print_status "You can now run: npm run dev"
print_status "To manage database: npm run db:studio"

echo ""
echo "🎉 Setup completed successfully!"
echo "📊 Next steps:"
echo "   1. Run 'npm run dev' to start the development server"
echo "   2. Run 'npm run db:studio' to open Prisma Studio"
echo "   3. Check your application at http://localhost:3000"