#!/bin/bash

# Fast Docker Deploy Script
# Only uploads necessary files to reduce transfer time

SERVER_IP="203.170.129.199"
SERVER_USER="root"
SERVER_PASSWORD="rp4QkUUvmbi5qB"
SERVER_PATH="/var/www/internship-system"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Fast Docker Deploy to VPS${NC}"

# Step 1: Build locally
echo -e "${YELLOW}📦 Building application...${NC}"
npm run build:prod

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed${NC}"

# Step 2: Create minimal package (only source files)
echo -e "${YELLOW}📦 Creating minimal package...${NC}"
mkdir -p temp-docker-deploy
cp -r src temp-docker-deploy/
cp -r prisma temp-docker-deploy/
cp -r public temp-docker-deploy/
cp package*.json temp-docker-deploy/
cp next.config.ts temp-docker-deploy/
cp tailwind.config.ts temp-docker-deploy/
cp postcss.config.mjs temp-docker-deploy/
cp tsconfig.json temp-docker-deploy/
cp middleware.ts temp-docker-deploy/
cp Dockerfile temp-docker-deploy/
cp docker-compose.yml temp-docker-deploy/
cp .dockerignore temp-docker-deploy/
cp .env temp-docker-deploy/

# Create tar with minimal files
cd temp-docker-deploy
tar -czf ../docker-minimal.tar.gz .
cd ..
rm -rf temp-docker-deploy

echo -e "${GREEN}✅ Minimal package created${NC}"

# Step 3: Upload minimal package
echo -e "${YELLOW}📤 Uploading minimal package...${NC}"
sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no docker-minimal.tar.gz ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Upload failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Upload completed${NC}"

# Step 4: Deploy on server
echo -e "${YELLOW}🐳 Deploying with Docker...${NC}"
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

# Stop existing containers
docker-compose -f docker/docker-compose.yml down 2>/dev/null || true

# Extract to docker directory
tar -xzf docker-minimal.tar.gz -C docker/

# Build and start containers
cd docker
docker-compose up -d --build

# Wait for startup
sleep 15

# Check status
docker-compose ps

echo "Docker deployment completed"
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker deployment failed!${NC}"
    exit 1
fi

# Step 5: Update Nginx
echo -e "${YELLOW}🔧 Updating Nginx...${NC}"
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cat > /etc/nginx/sites-available/internship-system << 'NGINX'
server {
    listen 80;
    listen 443 ssl;
    server_name internship.samartsolution.com;
    
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

systemctl reload nginx
EOF

# Step 6: Cleanup
rm -f docker-minimal.tar.gz

echo -e "${GREEN}🎉 Fast Docker deployment completed!${NC}"
echo -e "${BLUE}🌐 https://internship.samartsolution.com/${NC}"
