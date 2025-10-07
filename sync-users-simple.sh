#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# VPS Configuration
VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PATH="/var/www/internship-system"
VPS_PASSWORD="rp4QkUUvmbi5qB"

echo -e "${BLUE}🔄 Syncing users to VPS...${NC}"

# 1. Export users from local database
echo -e "${BLUE}1. Exporting users from local database...${NC}"
node export-users.js

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to export users${NC}"
  exit 1
fi

# 2. Upload users to VPS
echo -e "${BLUE}2. Uploading users to VPS...${NC}"
sshpass -p "$VPS_PASSWORD" scp users-export.json $VPS_USER@$VPS_HOST:$VPS_PATH/
sshpass -p "$VPS_PASSWORD" scp import-users.js $VPS_USER@$VPS_HOST:$VPS_PATH/

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to upload files to VPS${NC}"
  exit 1
fi

# 3. Import users to VPS database
echo -e "${BLUE}3. Importing users to VPS database...${NC}"
sshpass -p "$VPS_PASSWORD" ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && node import-users.js"

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to import users to VPS${NC}"
  exit 1
fi

# 4. Clean up
echo -e "${BLUE}4. Cleaning up...${NC}"
rm -f users-export.json
sshpass -p "$VPS_PASSWORD" ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && rm -f users-export.json import-users.js"

echo -e "${GREEN}✅ User sync completed successfully!${NC}"
echo -e "${BLUE}📊 VPS should now have the same users as local${NC}"
