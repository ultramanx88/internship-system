#!/bin/bash

# Multi-Deploy Script for Internship System
# Supports both Direct and Docker deployment to VPS

DEPLOY_METHOD=${1:-"direct"}
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

echo -e "${BLUE}🚀 Multi-Deploy to Production Server: ${SERVER_IP}${NC}"
echo -e "${YELLOW}📦 Deploy Method: ${DEPLOY_METHOD}${NC}"

# Step 1: Build the application locally
echo -e "${YELLOW}📦 Building application locally...${NC}"
npm run build:prod

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Step 2: Create deployment package
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
tar -czf deployment.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=.next \
    --exclude=logs \
    --exclude=backups \
    --exclude=.vercel \
    .

echo -e "${GREEN}✅ Deployment package created${NC}"

# Step 3: Upload to server using scp
echo -e "${YELLOW}📤 Uploading to production server...${NC}"
sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no deployment.tar.gz ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Upload failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Upload completed${NC}"

# Step 4: Deploy on server based on method
echo -e "${YELLOW}🔧 Deploying on production server using ${DEPLOY_METHOD} method...${NC}"
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << EOF
cd ${SERVER_PATH}

# Extract new version
tar -xzf deployment.tar.gz

# Copy to appropriate directory based on deploy method
if [ "${DEPLOY_METHOD}" = "docker" ]; then
    # Copy to docker directory
    cp -r * docker/
    cd docker
    
    # Install dependencies
    npm ci --production
    
    # Generate Prisma client
    npx prisma generate
    
    echo "Docker deployment files prepared"
else
    # Copy to direct directory
    cp -r * direct/
    cd direct
    
    # Install dependencies
    npm ci --production
    
    # Generate Prisma client
    npx prisma generate
    
    echo "Direct deployment files prepared"
fi

# Use deployment manager to switch methods
cd ${SERVER_PATH}
./deploy-manager.sh ${DEPLOY_METHOD}
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Server deployment failed!${NC}"
    exit 1
fi

# Step 5: Cleanup
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
rm -f deployment.tar.gz

echo -e "${GREEN}🎉 Production deployment completed successfully!${NC}"
echo -e "${BLUE}🌐 Application URL: https://internship.samartsolution.com/${NC}"
echo -e "${YELLOW}📋 Deploy Method: ${DEPLOY_METHOD}${NC}"

