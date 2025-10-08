#!/bin/bash

# =============================================================================
# ⚡ Quick Deployment Script
# =============================================================================
# For rapid deployments with minimal steps

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}⚡ Quick Deploy - Fastest deployment option${NC}"

# Kill any process on port 8080
echo -e "${YELLOW}🔄 Killing processes on port 8080...${NC}"
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Quick build
echo -e "${YELLOW}🏗️  Building application...${NC}"
npm run build

# Quick commit and push
echo -e "${YELLOW}📤 Committing and pushing changes...${NC}"
git add .
git commit -m "Quick deploy: $(date '+%Y-%m-%d %H:%M:%S')" || true
git push origin main

# Quick deploy to VPS
echo -e "${YELLOW}🚀 Deploying to VPS...${NC}"
ssh -o StrictHostKeyChecking=no root@203.170.129.199 "cd /var/www/internship-system && \
  git pull origin main && \
  npx prisma generate && \
  npm ci --production && \
  npm run build && \
  pm2 restart internship-system"

echo -e "${GREEN}✅ Quick deploy completed!${NC}"
echo -e "${BLUE}🌐 Application URL: http://203.170.129.199:8080${NC}"
