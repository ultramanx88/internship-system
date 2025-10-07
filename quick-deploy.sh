#!/bin/bash

# =============================================================================
# ⚡ Quick Deploy Script - For rapid deployments
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}⚡ Quick Deploy - Internship System${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Run from project root.${NC}"
    exit 1
fi

# Quick checks
echo -e "${BLUE}Checking git status...${NC}"
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}Uncommitted changes detected. Please commit first.${NC}"
    exit 1
fi

# Generate Prisma client
echo -e "${BLUE}Generating Prisma client...${NC}"
npx prisma generate

# Build
echo -e "${BLUE}Building application...${NC}"
npm run build:prod

# Deploy to VPS
echo -e "${BLUE}Deploying to VPS...${NC}"
VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PATH="/var/www/internship-system"

if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "cd $VPS_PATH && git pull origin main && npm run build && pm2 restart internship-system || pm2 start npm --name 'internship-system' -- start"; then
    echo -e "${GREEN}✅ Deployed to VPS successfully!${NC}"
    echo -e "${BLUE}Application URL: http://$VPS_HOST:3000${NC}"
else
    echo -e "${RED}VPS deployment failed${NC}"
    exit 1
fi
