#!/bin/bash

# Production Server Configuration
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

echo -e "${BLUE}🚀 Deploying to Production Server: ${SERVER_IP}${NC}"

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

# Step 4: Deploy on server
echo -e "${YELLOW}🔧 Deploying on production server...${NC}"
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

# Backup current version
if [ -d "current" ]; then
    mv current backup-$(date +%Y%m%d-%H%M%S)
fi

# Extract new version
tar -xzf deployment.tar.gz
mv . current

# Install dependencies
cd current
npm ci --production

# Generate Prisma client
npx prisma generate

# Restart services
systemctl restart internship-system
systemctl restart nginx

echo "✅ Deployment completed on server"
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
