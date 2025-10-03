#!/bin/bash

# 🛑 Development Environment Stopper
# สคริปต์หยุด development environment

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
    echo -e "${WHITE}║${RED}                🛑 Development Environment Stopper            ${WHITE}║${NC}"
    echo -e "${WHITE}║${RED}                     Graceful Shutdown                        ${WHITE}║${NC}"
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
    local service_name=$2
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        print_status "Stopping $service_name on port $port (PID: $pid)"
        kill -TERM $pid
        sleep 3
        
        # Check if process is still running
        if kill -0 $pid 2>/dev/null; then
            print_warning "Force killing $service_name (PID: $pid)"
            kill -9 $pid
            sleep 1
        fi
        
        if ! check_port $port; then
            print_success "$service_name stopped successfully"
        else
            print_error "Failed to stop $service_name"
        fi
    else
        print_status "$service_name is not running on port $port"
    fi
}

# Main function
main() {
    print_header
    
    # Step 1: Stop services using PID files
    print_step "1/4 Stopping services using PID files..."
    
    if [ -f "logs/nextjs.pid" ]; then
        NEXTJS_PID=$(cat logs/nextjs.pid)
        if kill -0 $NEXTJS_PID 2>/dev/null; then
            print_status "Stopping Next.js server (PID: $NEXTJS_PID)"
            kill -TERM $NEXTJS_PID
            sleep 3
            if kill -0 $NEXTJS_PID 2>/dev/null; then
                kill -9 $NEXTJS_PID
            fi
            print_success "Next.js server stopped"
        else
            print_status "Next.js server was not running"
        fi
        rm logs/nextjs.pid
    fi
    
    if [ -f "logs/prisma.pid" ]; then
        PRISMA_PID=$(cat logs/prisma.pid)
        if kill -0 $PRISMA_PID 2>/dev/null; then
            print_status "Stopping Prisma Studio (PID: $PRISMA_PID)"
            kill -TERM $PRISMA_PID
            sleep 2
            if kill -0 $PRISMA_PID 2>/dev/null; then
                kill -9 $PRISMA_PID
            fi
            print_success "Prisma Studio stopped"
        else
            print_status "Prisma Studio was not running"
        fi
        rm logs/prisma.pid
    fi
    
    # Step 2: Kill processes on specific ports
    print_step "2/4 Checking and stopping processes on ports..."
    
    kill_port 3000 "Next.js Server"
    kill_port 5555 "Prisma Studio"
    
    # Step 3: Clean up additional processes
    print_step "3/4 Cleaning up additional processes..."
    
    # Kill any node processes that might be related to our project
    pkill -f "next-server" 2>/dev/null || true
    pkill -f "prisma studio" 2>/dev/null || true
    
    print_success "Process cleanup completed"
    
    # Step 4: Clean up files and show summary
    print_step "4/4 Final cleanup..."
    
    # Remove process files
    rm -f logs/processes.env
    
    # Show final status
    echo ""
    print_success "🎉 All development services stopped successfully!"
    echo ""
    echo -e "${WHITE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${WHITE}║${GREEN}                    📊 Final Status                           ${WHITE}║${NC}"
    echo -e "${WHITE}╠══════════════════════════════════════════════════════════════╣${NC}"
    
    if check_port 3000; then
        echo -e "${WHITE}║${RED} ❌ Port 3000:        Still in use                          ${WHITE}║${NC}"
    else
        echo -e "${WHITE}║${GREEN} ✅ Port 3000:        Free                                  ${WHITE}║${NC}"
    fi
    
    if check_port 5555; then
        echo -e "${WHITE}║${RED} ❌ Port 5555:        Still in use                          ${WHITE}║${NC}"
    else
        echo -e "${WHITE}║${GREEN} ✅ Port 5555:        Free                                  ${WHITE}║${NC}"
    fi
    
    echo -e "${WHITE}║${CYAN} 📝 Logs:            Preserved in logs/ directory          ${WHITE}║${NC}"
    echo -e "${WHITE}║${CYAN} 🗄️  Database:        Preserved (prisma/dev.db)             ${WHITE}║${NC}"
    echo -e "${WHITE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${WHITE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${WHITE}║${GREEN}                    🚀 Quick Restart                         ${WHITE}║${NC}"
    echo -e "${WHITE}╠══════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${WHITE}║${CYAN} Start again:        ${YELLOW}./start-dev.sh                      ${WHITE}║${NC}"
    echo -e "${WHITE}║${CYAN} View logs:          ${YELLOW}ls -la logs/                        ${WHITE}║${NC}"
    echo -e "${WHITE}║${CYAN} Clean logs:         ${YELLOW}rm -rf logs/*                       ${WHITE}║${NC}"
    echo -e "${WHITE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    print_success "👋 Development environment stopped. See you next time!"
}

# Run main function
main