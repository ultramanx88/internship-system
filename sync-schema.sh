#!/bin/bash

# Schema Sync Script
# ซิงค์ schema ระหว่าง local และ VPS

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

echo -e "${BLUE}🔄 Syncing Schema between Local and VPS${NC}"

# Step 1: Check local schema
echo -e "${YELLOW}📋 Checking local schema...${NC}"
if [ ! -f "prisma/schema.prisma" ]; then
    echo -e "${RED}❌ Local schema.prisma not found!${NC}"
    exit 1
fi

# Step 2: Generate Prisma client locally
echo -e "${YELLOW}🔧 Generating Prisma client locally...${NC}"
npx prisma generate

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to generate Prisma client locally!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Local Prisma client generated${NC}"

# Step 3: Upload schema to VPS
echo -e "${YELLOW}📤 Uploading schema to VPS...${NC}"
sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no prisma/schema.prisma ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/prisma/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to upload schema!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Schema uploaded to VPS${NC}"

# Step 4: Generate Prisma client on VPS
echo -e "${YELLOW}🔧 Generating Prisma client on VPS...${NC}"
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

# Generate Prisma client
docker exec internship-system-app-1 npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma client generated on VPS"
else
    echo "❌ Failed to generate Prisma client on VPS"
    exit 1
fi

# Restart container to apply changes
echo "🔄 Restarting container..."
docker-compose restart app

echo "✅ Container restarted"
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to generate Prisma client on VPS!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Schema sync completed successfully!${NC}"
echo -e "${BLUE}🌐 VPS is now using the updated schema${NC}"
