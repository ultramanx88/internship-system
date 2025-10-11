#!/bin/bash

# Docker-Only Deploy Script for Internship System VPS
# This script deploys only using Docker containers

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

echo -e "${BLUE}🐳 Docker-Only Deploy to VPS: ${SERVER_IP}${NC}"

# Step 1: Build the application locally
echo -e "${YELLOW}📦 Building application locally...${NC}"
npm run build:prod

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Step 2: Create deployment package (exclude problematic files)
echo -e "${YELLOW}📦 Creating Docker deployment package...${NC}"
tar -czf docker-deployment.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=.next \
    --exclude=logs \
    --exclude=backups \
    --exclude=.vercel \
    --exclude="._*" \
    --exclude=".DS_Store" \
    .

echo -e "${GREEN}✅ Docker deployment package created${NC}"

# Step 3: Upload to server using scp
echo -e "${YELLOW}📤 Uploading to VPS...${NC}"
sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no docker-deployment.tar.gz ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Upload failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Upload completed${NC}"

# Step 4: Deploy on server using Docker
echo -e "${YELLOW}🐳 Deploying with Docker on VPS...${NC}"
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

# Stop any existing containers
docker-compose -f docker/docker-compose.yml down 2>/dev/null || true

# Extract new version to docker directory
tar -xzf docker-deployment.tar.gz
cp -r * docker/

# Copy environment file
cp .env docker/

# Build and start Docker containers
cd docker
docker-compose up -d --build

# Wait for containers to be ready
sleep 10

# Check container status
docker-compose ps

echo "Docker deployment completed"
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker deployment failed!${NC}"
    exit 1
fi

# Step 5: Update Nginx for Docker
echo -e "${YELLOW}🔧 Updating Nginx for Docker...${NC}"
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
# Update nginx to proxy to Docker container (port 3000)
cat > /etc/nginx/sites-available/internship-system << 'NGINX'
server {
    listen 80;
    listen 443 ssl;
    server_name internship.samartsolution.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/internship.samartsolution.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/internship.samartsolution.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

# Reload nginx
systemctl reload nginx

echo "Nginx updated for Docker"
EOF

# Step 6: Cleanup
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
rm -f docker-deployment.tar.gz

echo -e "${GREEN}🎉 Docker-Only deployment completed successfully!${NC}"
echo -e "${BLUE}🌐 Application URL: https://internship.samartsolution.com/${NC}"
echo -e "${YELLOW}🐳 Running on Docker containers${NC}"
