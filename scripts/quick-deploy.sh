#!/bin/bash

# Quick deploy script - minimal steps for hotfixes
# Usage: ./scripts/quick-deploy.sh

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Quick Deploy${NC}"

# Pull latest
git pull origin main

# Install deps
npm ci

# Generate Prisma
npx prisma generate

# Build
npm run build

# Restart
pkill -f "next" 2>/dev/null || true
NODE_ENV=production npm run start &

echo -e "${GREEN}✓ Quick deploy completed${NC}"
