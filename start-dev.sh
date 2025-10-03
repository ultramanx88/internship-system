#!/bin/bash

# 🚀 One-Click Development Environment Starter
# สคริปต์เริ่มต้น development environment แบบครบครัน

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${WHITE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${WHITE}║${CYAN}                🚀 Development Environment Starter            ${WHITE}║${NC}"
    echo -e "${WHITE}║${CYAN}                     One-Click Setup                          ${WHITE}║${NC}"
    echo -e "${WHITE}╚══════════════════════════════════════════════════════════════╝${NC}"
}

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

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        print_warning "Killing existing process on port $port (PID: $pid)"
        kill -9 $pid
        sleep 2
    fi
}

# Function to open URL in browser
open_browser() {
    local url=$1
    sleep 3
    if command -v open >/dev/null 2>&1; then
        open "$url"
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$url"
    fi
}

# Main function
main() {
    print_header
    
    # Step 1: Check prerequisites
    print_step "1/7 Checking prerequisites..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root directory."
        exit 1
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules not found. Installing dependencies..."
        npm install
    fi
    
    print_success "Prerequisites checked"
    
    # Step 2: Setup database
    print_step "2/7 Setting up database..."
    
    # Check if database exists
    if [ ! -f "prisma/dev.db" ]; then
        print_status "Creating SQLite database..."
        npx prisma db push
        print_status "Seeding database with initial data..."
        npm run db:seed
    else
        print_success "Database already exists"
    fi
    
    # Step 3: Generate Prisma client
    print_step "3/7 Generating Prisma client..."
    npx prisma generate
    print_success "Prisma client generated"
    
    # Step 4: Test database connection
    print_step "4/7 Testing database connection..."
    npm run test:crud > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_success "Database connection test passed"
    else
        print_warning "Database connection test failed, but continuing..."
    fi
    
    # Step 5: Clean up existing processes
    print_step "5/7 Cleaning up existing processes..."
    
    # Kill existing processes on common ports
    if check_port 3000; then
        kill_port 3000
    fi
    
    if check_port 5555; then
        kill_port 5555
    fi
    
    print_success "Cleanup completed"
    
    # Step 6: Start services
    print_step "6/7 Starting development services..."
    
    # Create logs directory
    mkdir -p logs
    
    # Start Next.js development server
    print_status "Starting Next.js development server on port 3000..."
    npm run dev > logs/nextjs.log 2>&1 &
    NEXTJS_PID=$!
    echo $NEXTJS_PID > logs/nextjs.pid
    
    # Wait for Next.js to start
    print_status "Waiting for Next.js server to start..."
    for i in {1..30}; do
        if check_port 3000; then
            print_success "Next.js server started successfully"
            break
        fi
        sleep 1
        if [ $i -eq 30 ]; then
            print_error "Next.js server failed to start"
            exit 1
        fi
    done
    
    # Start Prisma Studio
    print_status "Starting Prisma Studio on port 5555..."
    npx prisma studio > logs/prisma-studio.log 2>&1 &
    PRISMA_PID=$!
    echo $PRISMA_PID > logs/prisma.pid
    
    # Wait for Prisma Studio to start
    print_status "Waiting for Prisma Studio to start..."
    for i in {1..20}; do
        if check_port 5555; then
            print_success "Prisma Studio started successfully"
            break
        fi
        sleep 1
    done
    
    # Step 7: Final setup and information
    print_step "7/7 Final setup..."
    
    # Test API endpoints
    print_status "Testing API endpoints..."
    sleep 5
    
    # Test API endpoints
    if curl -s -f "http://localhost:3000/api/test" > /dev/null; then
        print_success "API endpoints are responding"
        
        # Test additional endpoints
        if curl -s -f "http://localhost:3000/api/health" > /dev/null; then
            print_success "Health check API working"
        fi
        
        if curl -s -f "http://localhost:3000/api/user/settings" -H "x-user-id: test001" > /dev/null; then
            print_success "Settings API working"
        fi
        
        if curl -s -f "http://localhost:3000/api/internships?type=internship" > /dev/null; then
            print_success "Internships API working"
        fi
    else
        print_warning "API endpoints may not be ready yet"
    fi
    
    # Display success information
    echo ""
    print_success "🎉 Development environment started successfully!"
    echo ""
    echo -e "${WHITE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${WHITE}║${GREEN}                    🌐 Services Running                        ${WHITE}║${NC}"
    echo -e "${WHITE}╠══════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${WHITE}║${CYAN} 🚀 Next.js App:     ${YELLOW}http://localhost:3000                ${WHITE}║${NC}"
    echo -e "${WHITE}║${CYAN} 🗄️  Prisma Studio:   ${YELLOW}http://localhost:5555                ${WHITE}║${NC}"
    echo -e "${WHITE}║${CYAN} 📊 Database:        ${YELLOW}SQLite (prisma/dev.db)              ${WHITE}║${NC}"
    echo -e "${WHITE}║${CYAN} 📝 Logs:            ${YELLOW}logs/ directory                     ${WHITE}║${NC}"
    echo -e "${WHITE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${WHITE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${WHITE}║${GREEN}                    🧪 Test Credentials                       ${WHITE}║${NC}"
    echo -e "${WHITE}╠══════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${WHITE}║${CYAN} Student:            ${YELLOW}test@student.ac.th / password       ${WHITE}║${NC}"
    echo -e "${WHITE}║${CYAN} Admin:              ${YELLOW}admin@university.ac.th / password   ${WHITE}║${NC}"
    echo -e "${WHITE}║${CYAN} User ID (API):      ${YELLOW}test001                             ${WHITE}║${NC}"
    echo -e "${WHITE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${WHITE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${WHITE}║${GREEN}                    ⚡ Quick Commands                         ${WHITE}║${NC}"
    echo -e "${WHITE}╠══════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${WHITE}║${CYAN} Stop all services:  ${YELLOW}./stop-dev.sh                       ${WHITE}║${NC}"
    echo -e "${WHITE}║${CYAN} View logs:          ${YELLOW}tail -f logs/nextjs.log             ${WHITE}║${NC}"
    echo -e "${WHITE}║${CYAN} Test system:        ${YELLOW}node test-live-system.js            ${WHITE}║${NC}"
    echo -e "${WHITE}║${CYAN} Test application:   ${YELLOW}node test-application-flow.js       ${WHITE}║${NC}"
    echo -e "${WHITE}║${CYAN} Debug system:       ${YELLOW}node debug-system.js                ${WHITE}║${NC}"
    echo -e "${WHITE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Open browser automatically
    print_status "Opening browser in 3 seconds..."
    open_browser "http://localhost:3000" &
    open_browser "http://localhost:5555" &
    
    # Save process information
    echo "NEXTJS_PID=$NEXTJS_PID" > logs/processes.env
    echo "PRISMA_PID=$PRISMA_PID" >> logs/processes.env
    echo "STARTED_AT=$(date)" >> logs/processes.env
    
    # Run system test
    print_status "Running system test..."
    if [ -f "test-live-system.js" ]; then
        node test-live-system.js > logs/system-test.log 2>&1
        if [ $? -eq 0 ]; then
            print_success "System test passed"
        else
            print_warning "System test had issues, check logs/system-test.log"
        fi
    fi
    
    print_success "🎯 Ready for development! Happy coding! 🚀"
    
    # Keep script running and show live status
    echo ""
    print_status "Press Ctrl+C to stop all services, or run ./stop-dev.sh"
    echo ""
    
    # Monitor services
    while true; do
        sleep 10
        
        # Check if services are still running
        if ! check_port 3000; then
            print_error "Next.js server stopped unexpectedly"
            break
        fi
        
        if ! check_port 5555; then
            print_warning "Prisma Studio stopped"
        fi
        
        # Show a heartbeat every minute
        echo -e "${GREEN}💚${NC} Services running... $(date '+%H:%M:%S')"
        sleep 50
    done
}

# Trap Ctrl+C and cleanup
cleanup() {
    echo ""
    print_warning "Shutting down services..."
    
    if [ -f "logs/nextjs.pid" ]; then
        NEXTJS_PID=$(cat logs/nextjs.pid)
        kill $NEXTJS_PID 2>/dev/null
        rm logs/nextjs.pid
    fi
    
    if [ -f "logs/prisma.pid" ]; then
        PRISMA_PID=$(cat logs/prisma.pid)
        kill $PRISMA_PID 2>/dev/null
        rm logs/prisma.pid
    fi
    
    # Kill any remaining processes on our ports
    kill_port 3000
    kill_port 5555
    
    print_success "All services stopped"
    exit 0
}

trap cleanup INT TERM

# Run main function
main