#!/bin/bash

# Safe Deploy Script
# ทดสอบ local ก่อน deploy ไป VPS

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

echo -e "${BLUE}🚀 Safe Deploy Script${NC}"
echo -e "${BLUE}Testing local before deploying to VPS${NC}"

# Step 1: Check if local server is running
echo -e "${YELLOW}🔍 Checking local server...${NC}"
if ! curl -s http://localhost:8080/api/health > /dev/null; then
    echo -e "${RED}❌ Local server is not running!${NC}"
    echo -e "${YELLOW}Please start your development server first:${NC}"
    echo -e "${BLUE}  npm run dev${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Local server is running${NC}"

# Step 2: Run local API tests
echo -e "${YELLOW}🧪 Running local API tests...${NC}"
node test-local-apis.js

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Local API tests failed!${NC}"
    echo -e "${YELLOW}Please fix the issues before deploying.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All local API tests passed${NC}"

# Step 3: Sync schema
echo -e "${YELLOW}🔄 Syncing schema...${NC}"
./sync-schema.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Schema sync failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Schema synced successfully${NC}"

# Step 4: Build and deploy
echo -e "${YELLOW}📦 Building and deploying...${NC}"
./code-only-deploy.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"

# Step 5: Verify VPS deployment
echo -e "${YELLOW}🔍 Verifying VPS deployment...${NC}"
sleep 10

# Test VPS APIs
VPS_HEALTH=$(curl -s https://internship.samartsolution.com/api/health | jq -r '.status' 2>/dev/null)
VPS_COMPANIES=$(curl -s https://internship.samartsolution.com/api/companies | jq -r '.success' 2>/dev/null)

if [ "$VPS_HEALTH" = "healthy" ] && [ "$VPS_COMPANIES" = "true" ]; then
    echo -e "${GREEN}✅ VPS deployment verified successfully!${NC}"
    echo -e "${BLUE}🌐 Application URL: https://internship.samartsolution.com/${NC}"
else
    echo -e "${RED}❌ VPS deployment verification failed!${NC}"
    echo -e "${YELLOW}Health: $VPS_HEALTH${NC}"
    echo -e "${YELLOW}Companies API: $VPS_COMPANIES${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Safe deployment completed successfully!${NC}"
