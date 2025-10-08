#!/bin/bash

# =============================================================================
# 🧪 Test Deployment Script (Local Only)
# =============================================================================
# For testing deployment workflow without VPS access

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🧪 Test Deploy - Local testing only${NC}"

# Kill any process on port 8080
echo -e "${YELLOW}🔄 Killing processes on port 8080...${NC}"
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Quick build
echo -e "${YELLOW}🏗️  Building application...${NC}"
npm run build

# Quick commit and push
echo -e "${YELLOW}📤 Committing and pushing changes...${NC}"
git add .
git commit -m "Test deploy: $(date '+%Y-%m-%d %H:%M:%S')" || true
git push origin main

# Test local start
echo -e "${YELLOW}🚀 Testing local start...${NC}"
NODE_ENV=production npm run start &
SERVER_PID=$!

# Wait for server to start
sleep 10

# Test health endpoint
echo -e "${YELLOW}🔍 Testing health endpoint...${NC}"
if curl -f -s "http://localhost:8080/api/health" > /dev/null; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
fi

# Stop server
echo -e "${YELLOW}🛑 Stopping test server...${NC}"
kill $SERVER_PID 2>/dev/null || true

echo -e "${GREEN}✅ Test deploy completed!${NC}"
echo -e "${BLUE}🌐 Local test URL: http://localhost:8080${NC}"
echo -e "${YELLOW}📝 Note: This is a local test only. Use ./deploy.sh for VPS deployment.${NC}"
