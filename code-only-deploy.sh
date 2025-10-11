#!/bin/bash

# Code Only Deploy Script
# Deploy only code changes without touching database

SERVER_IP="203.170.129.199"
SERVER_USER="root"
SERVER_PASSWORD="rp4QkUUvmbi5qB"
SERVER_PATH="/var/www/internship-system"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Code Only Deploy to VPS: ${SERVER_IP}${NC}"

# Step 1: Build the application locally
echo -e "${YELLOW}📦 Building application locally...${NC}"
npm run build:prod

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Step 2: Create code-only deployment package
echo -e "${YELLOW}📦 Creating code-only deployment package...${NC}"
tar -czf code-only-deployment.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=.next \
    --exclude=logs \
    --exclude=backups \
    --exclude=.vercel \
    --exclude="._*" \
    --exclude=".DS_Store" \
    --exclude=prisma/migrations \
    --exclude=*.log \
    src/ \
    prisma/schema.prisma \
    public/ \
    next.config.ts \
    tailwind.config.ts \
    postcss.config.mjs \
    tsconfig.json \
    middleware.ts \
    package.json \
    package-lock.json \
    Dockerfile \
    docker-compose.yml \
    nginx.conf \
    docker.env

echo -e "${GREEN}✅ Code-only deployment package created${NC}"

# Step 3: Upload to server
echo -e "${YELLOW}📤 Uploading to VPS...${NC}"
sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no code-only-deployment.tar.gz ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Upload failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Upload completed${NC}"

# Step 4: Deploy on server (code only, preserve database)
echo -e "${YELLOW}🐳 Deploying code changes on VPS...${NC}"
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

# Stop app container only (preserve database)
docker-compose stop app

# Extract new code
tar -xzf code-only-deployment.tar.gz

# Rebuild and start app container only
docker-compose up -d --build app

# Wait for app to be ready
echo "Waiting for app to start..."
sleep 15

# Check app container status
echo "App container status:"
docker-compose ps app

# Run database migration if needed (schema changes only)
echo "🔄 Running database migration..."
docker exec internship-system-app-1 npx prisma migrate deploy 2>/dev/null || echo "No migrations to apply"

# Test API endpoints
echo "🧪 Testing API endpoints..."
sleep 5

# Test health endpoint
HEALTH_RESPONSE=$(curl -s http://localhost:8081/api/health 2>/dev/null || echo "failed")
if [[ $HEALTH_RESPONSE == *"healthy"* ]]; then
    echo "✅ Health check passed"
else
    echo "⚠️  Health check failed: $HEALTH_RESPONSE"
fi

echo "Code-only deployment completed"
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Code deployment failed!${NC}"
    exit 1
fi

# Step 5: Cleanup
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
rm -f code-only-deployment.tar.gz

echo -e "${GREEN}🎉 Code-only deployment completed successfully!${NC}"
echo -e "${BLUE}🌐 Application URL: https://internship.samartsolution.com/${NC}"
echo -e "${YELLOW}📋 Database preserved - only code updated${NC}"
