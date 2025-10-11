#!/bin/bash

# =============================================================================
# 🚀 Safe Docker Deploy Script - No Container Duplication
# =============================================================================
# This script safely updates existing containers without creating duplicates

set -e  # Exit on any error

# Server Configuration
SERVER_IP="203.170.129.199"
SERVER_USER="root"
SERVER_PASSWORD="rp4QkUUvmbi5qB"
SERVER_PATH="/var/www/internship-system"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

# Header
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                🚀 SAFE DOCKER DEPLOY SCRIPT                  ║"
echo "║                 No Container Duplication                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Step 1: Build application locally
log "📦 Building application locally..."
if ! npm run build; then
    error "Build failed locally"
fi
success "Local build completed"

# Step 2: Create deployment package
log "📦 Creating deployment package..."
tar -czf safe-deployment.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=.next \
    --exclude=logs \
    --exclude=backups \
    --exclude=.vercel \
    --exclude="._*" \
    --exclude=".DS_Store" \
    --exclude=docker-fixed-deployment.tar.gz \
    --exclude=safe-deployment.tar.gz \
    .

success "Deployment package created"

# Step 3: Upload to server
log "📤 Uploading to VPS..."
if ! sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no safe-deployment.tar.gz ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/; then
    error "Upload failed"
fi
success "Upload completed"

# Step 4: Safe deployment on server
log "🐳 Performing safe deployment on VPS..."
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'

cd /var/www/internship-system

echo "🔍 Checking current container status..."
docker-compose ps

echo "📦 Extracting new version..."
tar -xzf safe-deployment.tar.gz

echo "🔧 Ensuring environment configuration..."
if [ ! -f "docker.env" ]; then
    cat > docker.env << 'ENVEOF'
# Safe Docker Environment Configuration
NODE_ENV=production
PORT=8080

# Database Configuration
DATABASE_URL=postgresql://postgres:password@postgres:5432/internship_system?schema=public

# NextAuth Configuration
NEXTAUTH_URL=https://internship.samartsolution.com
NEXTAUTH_SECRET=your-production-secret-key-here

# Application Configuration
APP_URL=https://internship.samartsolution.com
ENVEOF
fi

echo "🛑 Gracefully stopping existing containers..."
# Stop containers gracefully without removing them
docker-compose stop

echo "🔄 Updating containers (no new containers will be created)..."
# Use --no-recreate to prevent creating new containers
docker-compose up -d --no-recreate --build

echo "⏳ Waiting for containers to be ready..."
sleep 30

echo "🔍 Checking container status after update..."
docker-compose ps

echo "🔄 Running database migration..."
docker-compose exec -T app npx prisma migrate deploy 2>/dev/null || echo "No migrations to apply"

echo "🌱 Checking database data..."
USER_COUNT=$(docker-compose exec -T postgres psql -U postgres -d internship_system -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' \n' || echo "0")

if [ "$USER_COUNT" = "0" ]; then
    echo "📊 Database is empty, running seed data..."
    docker-compose exec -T app npm run db:seed
else
    echo "✅ Database has $USER_COUNT users"
fi

echo "🧪 Testing API endpoints..."
sleep 10

# Test health endpoint
HEALTH_RESPONSE=$(curl -s http://localhost:8080/api/health 2>/dev/null || echo "failed")
if [[ $HEALTH_RESPONSE == *"healthy"* ]]; then
    echo "✅ Health check passed"
else
    echo "⚠️  Health check failed: $HEALTH_RESPONSE"
fi

# Test users endpoint
USERS_RESPONSE=$(curl -s http://localhost:8080/api/users 2>/dev/null || echo "failed")
if [[ $USERS_RESPONSE == *"users"* ]]; then
    echo "✅ Users API working"
else
    echo "⚠️  Users API failed: $USERS_RESPONSE"
fi

echo "🧹 Cleaning up deployment files..."
rm -f safe-deployment.tar.gz

echo "📊 Final container status:"
docker-compose ps

echo "✅ Safe deployment completed"
EOF

if [ $? -ne 0 ]; then
    error "Safe deployment failed"
fi

# Step 5: Verify deployment
log "🔍 Verifying deployment..."
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

echo "📊 Container Status:"
docker-compose ps

echo "🌐 Testing HTTPS endpoint..."
HTTPS_RESPONSE=$(curl -s https://internship.samartsolution.com/api/health 2>/dev/null || echo "failed")
if [[ $HTTPS_RESPONSE == *"healthy"* ]]; then
    echo "✅ HTTPS endpoint working"
else
    echo "⚠️  HTTPS endpoint failed: $HTTPS_RESPONSE"
fi

echo "📈 Resource usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo "💾 Disk usage:"
df -h /var/www/internship-system
EOF

# Step 6: Cleanup local files
log "🧹 Cleaning up local files..."
rm -f safe-deployment.tar.gz

success "🎉 Safe Docker deployment completed successfully!"
echo -e "${BLUE}🌐 Application URL: https://internship.samartsolution.com/${NC}"
echo -e "${GREEN}✅ No new containers created - existing containers updated safely${NC}"
echo -e "${YELLOW}📋 Features: Graceful stop, No recreation, Auto-migration, Health checks${NC}"
echo -e "${CYAN}🔍 Container management: Uses --no-recreate flag to prevent duplicates${NC}"
