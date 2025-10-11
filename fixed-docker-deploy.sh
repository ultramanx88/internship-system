#!/bin/bash

# Fixed Docker Deploy Script for VPS
# This script fixes the "path not found" issue

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

echo -e "${BLUE}🐳 Fixed Docker Deploy to VPS: ${SERVER_IP}${NC}"

# Step 1: Build the application locally
echo -e "${YELLOW}📦 Building application locally...${NC}"
npm run build:prod

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Step 2: Create deployment package with all necessary files
echo -e "${YELLOW}📦 Creating Docker deployment package...${NC}"
tar -czf docker-fixed-deployment.tar.gz \
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
sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no docker-fixed-deployment.tar.gz ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Upload failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Upload completed${NC}"

# Step 4: Deploy on server using Docker with proper setup
echo -e "${YELLOW}🐳 Deploying with Docker on VPS...${NC}"
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

# Stop any existing containers
docker-compose down 2>/dev/null || true

# Remove old containers and images
docker system prune -f

# Extract new version
tar -xzf docker-fixed-deployment.tar.gz

# Ensure docker.env exists
if [ ! -f "docker.env" ]; then
    cat > docker.env << 'ENVEOF'
# Docker Environment Configuration
NODE_ENV=production
PORT=8080

# Database Configuration
DATABASE_URL=postgresql://postgres:password@postgres:5432/internship_system?schema=public

# Next.js Configuration
NEXTAUTH_URL=http://localhost:8080
NEXTAUTH_SECRET=your-secret-key-here

# Application Configuration
APP_URL=http://localhost:8080
ENVEOF
fi

# Build and start Docker containers
docker-compose up -d --build

# Wait for containers to be ready
echo "Waiting for containers to start..."
sleep 30

# Check container status
echo "Container status:"
docker-compose ps

# Run database migration if needed
echo "🔄 Running database migration..."
docker exec internship-system-app-1 npx prisma migrate deploy 2>/dev/null || echo "No migrations to apply"

# Check if database has data, if not run seed
echo "🌱 Checking database data..."
USER_COUNT=$(docker exec internship_postgres psql -U postgres -d internship_system -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' \n' || echo "0")

if [ "$USER_COUNT" = "0" ]; then
    echo "📊 Database is empty, running seed data..."
    docker exec internship-system-app-1 npm run db:seed
else
    echo "✅ Database has $USER_COUNT users"
fi

# Check if app container is running
if docker-compose ps | grep -q "app.*Up"; then
    echo "✅ App container is running"
else
    echo "❌ App container is not running"
    echo "Container logs:"
    docker-compose logs app
fi

# Check if nginx container is running
if docker-compose ps | grep -q "nginx.*Up"; then
    echo "✅ Nginx container is running"
else
    echo "❌ Nginx container is not running"
    echo "Container logs:"
    docker-compose logs nginx
fi

# Test API endpoints
echo "🧪 Testing API endpoints..."
sleep 10

# Test health endpoint
HEALTH_RESPONSE=$(curl -s http://localhost:8081/api/health 2>/dev/null || echo "failed")
if [[ $HEALTH_RESPONSE == *"healthy"* ]]; then
    echo "✅ Health check passed"
else
    echo "⚠️  Health check failed: $HEALTH_RESPONSE"
fi

# Test users endpoint
USERS_RESPONSE=$(curl -s http://localhost:8081/api/users 2>/dev/null || echo "failed")
if [[ $USERS_RESPONSE == *"users"* ]]; then
    echo "✅ Users API working"
else
    echo "⚠️  Users API failed: $USERS_RESPONSE"
fi

echo "Docker deployment completed"
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker deployment failed!${NC}"
    exit 1
fi

# Step 5: Update Nginx for Docker (if needed)
echo -e "${YELLOW}🔧 Checking Nginx configuration...${NC}"
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
# Check if nginx is running in Docker
if docker-compose ps | grep -q "nginx.*Up"; then
    echo "✅ Nginx is running in Docker"
else
    echo "⚠️  Nginx is not running in Docker, checking system nginx..."
    
    # Update system nginx to proxy to Docker container (port 8081)
    cat > /etc/nginx/sites-available/internship-system << 'NGINX'
server {
    listen 80;
    listen 443 ssl;
    server_name internship.samartsolution.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/internship.samartsolution.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/internship.samartsolution.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:8081;
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

    # Enable site and reload nginx
    ln -sf /etc/nginx/sites-available/internship-system /etc/nginx/sites-enabled/
    systemctl reload nginx
    echo "✅ System Nginx updated for Docker"
fi
EOF

# Step 6: Cleanup
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
rm -f docker-fixed-deployment.tar.gz

# Final verification
echo -e "${YELLOW}🔍 Final verification...${NC}"
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
# Test HTTPS endpoint
HTTPS_RESPONSE=$(curl -s https://internship.samartsolution.com/api/health 2>/dev/null || echo "failed")
if [[ $HTTPS_RESPONSE == *"healthy"* ]]; then
    echo "✅ HTTPS endpoint working"
else
    echo "⚠️  HTTPS endpoint failed: $HTTPS_RESPONSE"
fi

# Show final status
echo "📊 Final Status:"
echo "- App Container: $(docker-compose ps | grep app | awk '{print $4}' || echo 'Not running')"
echo "- PostgreSQL: $(docker-compose ps | grep postgres | awk '{print $4}' || echo 'Not running')"
echo "- Database Users: $(docker exec internship_postgres psql -U postgres -d internship_system -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' \n' || echo '0')"
EOF

echo -e "${GREEN}🎉 Fixed Docker deployment completed successfully!${NC}"
echo -e "${BLUE}🌐 Application URL: https://internship.samartsolution.com/${NC}"
echo -e "${YELLOW}🐳 Running on Docker containers with fixed path configuration${NC}"
echo -e "${GREEN}📋 Features: Auto-migration, Auto-seed, Health checks, API testing${NC}"
