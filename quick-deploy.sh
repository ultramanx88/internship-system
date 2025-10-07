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

# Deploy to Vercel
echo -e "${BLUE}Deploying to Vercel...${NC}"
if command -v vercel &> /dev/null; then
    vercel --prod --yes
    echo -e "${GREEN}✅ Deployed successfully!${NC}"
else
    echo -e "${RED}Vercel CLI not found. Please install: npm i -g vercel${NC}"
    exit 1
fi
