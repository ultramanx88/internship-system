#!/bin/bash

# Incremental Deploy Script
# Deploy only changed files since last deployment

SERVER_IP="203.170.129.199"
SERVER_USER="root"
SERVER_PASSWORD="rp4QkUUvmbi5qB"
SERVER_PATH="/var/www/internship-system"
LAST_DEPLOY_FILE=".last-deploy-hash"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Incremental Deploy to VPS: ${SERVER_IP}${NC}"

# Step 1: Get current git hash
CURRENT_HASH=$(git rev-parse HEAD)
echo -e "${YELLOW}📝 Current commit: ${CURRENT_HASH}${NC}"

# Step 2: Check if this is a new deployment
if [ -f "$LAST_DEPLOY_FILE" ]; then
    LAST_HASH=$(cat "$LAST_DEPLOY_FILE")
    if [ "$CURRENT_HASH" = "$LAST_HASH" ]; then
        echo -e "${YELLOW}⚠️  No new changes since last deployment${NC}"
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}Deployment cancelled${NC}"
            exit 0
        fi
    else
        echo -e "${GREEN}📋 New changes detected since last deployment${NC}"
        echo -e "  Last: ${LAST_HASH:0:8}"
        echo -e "  Current: ${CURRENT_HASH:0:8}"
    fi
else
    echo -e "${YELLOW}📋 First deployment detected${NC}"
fi

# Step 3: Build application
echo -e "${YELLOW}📦 Building application...${NC}"
npm run build:prod

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed${NC}"

# Step 4: Create incremental package
echo -e "${YELLOW}📦 Creating incremental package...${NC}"

# Get list of changed files since last deployment
if [ -f "$LAST_DEPLOY_FILE" ]; then
    CHANGED_FILES=$(git diff --name-only "$LAST_HASH" HEAD)
else
    CHANGED_FILES=$(git ls-files)
fi

# Filter for deployable files
DEPLOYABLE_FILES=()
while IFS= read -r file; do
    if [[ "$file" =~ ^(src/|public/|prisma/schema.prisma|next.config.ts|tailwind.config.ts|postcss.config.mjs|tsconfig.json|middleware.ts|package.json|package-lock.json|Dockerfile|docker-compose.yml|nginx.conf|docker.env)$ ]] || [[ "$file" =~ ^src/.*$ ]]; then
        DEPLOYABLE_FILES+=("$file")
    fi
done <<< "$CHANGED_FILES"

if [ ${#DEPLOYABLE_FILES[@]} -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No deployable files changed${NC}"
    echo -e "${GREEN}✅ Deployment not needed${NC}"
    exit 0
fi

echo -e "${GREEN}📋 Files to deploy (${#DEPLOYABLE_FILES[@]} files):${NC}"
for file in "${DEPLOYABLE_FILES[@]}"; do
    echo -e "  - $file"
done

# Create incremental package
tar -czf incremental-deployment.tar.gz "${DEPLOYABLE_FILES[@]}"

echo -e "${GREEN}✅ Incremental package created${NC}"

# Step 5: Upload and deploy
echo -e "${YELLOW}📤 Uploading to VPS...${NC}"
sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no incremental-deployment.tar.gz ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Upload failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Upload completed${NC}"

# Step 6: Deploy on server
echo -e "${YELLOW}🐳 Deploying incremental changes...${NC}"
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

# Extract incremental changes
tar -xzf incremental-deployment.tar.gz

# Rebuild and restart app container
docker-compose up -d --build app

# Wait for app to be ready
sleep 15

# Check status
echo "Container status:"
docker-compose ps app

# Test API
HEALTH_RESPONSE=$(curl -s http://localhost:8081/api/health 2>/dev/null || echo "failed")
if [[ $HEALTH_RESPONSE == *"healthy"* ]]; then
    echo "✅ Health check passed"
else
    echo "⚠️  Health check failed: $HEALTH_RESPONSE"
fi

# Clean up
rm -f incremental-deployment.tar.gz

echo "Incremental deployment completed"
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Incremental deployment failed!${NC}"
    exit 1
fi

# Step 7: Update last deploy hash
echo "$CURRENT_HASH" > "$LAST_DEPLOY_FILE"

# Step 8: Cleanup
rm -f incremental-deployment.tar.gz

echo -e "${GREEN}🎉 Incremental deployment completed successfully!${NC}"
echo -e "${BLUE}🌐 Application URL: https://internship.samartsolution.com/${NC}"
echo -e "${YELLOW}📋 Deployed ${#DEPLOYABLE_FILES[@]} changed files${NC}"
