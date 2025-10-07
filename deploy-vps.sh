#!/bin/bash

# =============================================================================
# 🚀 VPS Deployment Script for Internship System
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# VPS Configuration
VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PATH="/var/www/internship-system"
SSH_KEY_PATH="$HOME/.ssh/id_rsa"
VPS_PASSWORD="rp4QkUUvmbi5qB"

echo -e "${BLUE}🚀 VPS Deployment Script${NC}"
echo -e "${BLUE}Host: $VPS_HOST${NC}"
echo -e "${BLUE}Path: $VPS_PATH${NC}"

# Check SSH key
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo -e "${YELLOW}SSH key not found at $SSH_KEY_PATH${NC}"
    echo -e "${YELLOW}Please ensure you have SSH access to the VPS server${NC}"
    echo -e "${YELLOW}You can generate a key with: ssh-keygen -t rsa -b 4096 -C 'your_email@example.com'${NC}"
    echo -e "${YELLOW}Then copy it to the server: ssh-copy-id $VPS_USER@$VPS_HOST${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Test SSH connection
echo -e "${BLUE}Testing SSH connection...${NC}"
if sshpass -p "$VPS_PASSWORD" ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "echo 'SSH connection successful'"; then
    echo -e "${GREEN}✅ SSH connection successful${NC}"
else
    echo -e "${RED}❌ SSH connection failed${NC}"
    echo -e "${YELLOW}Please check:${NC}"
    echo -e "${YELLOW}1. VPS server is running${NC}"
    echo -e "${YELLOW}2. SSH service is running on port 22${NC}"
    echo -e "${YELLOW}3. Password is correct${NC}"
    echo -e "${YELLOW}4. Firewall allows SSH connections${NC}"
    exit 1
fi

# Check if repository exists on VPS
echo -e "${BLUE}Checking repository on VPS...${NC}"
if sshpass -p "$VPS_PASSWORD" ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && git status"; then
    echo -e "${GREEN}✅ Repository found on VPS${NC}"
else
    echo -e "${YELLOW}Repository not found. Cloning...${NC}"
    sshpass -p "$VPS_PASSWORD" ssh $VPS_USER@$VPS_HOST "cd /var/www && git clone https://github.com/ultramanx88/internship-system.git"
fi

# Deploy
echo -e "${BLUE}Deploying to VPS...${NC}"
echo -e "${BLUE}1. Stashing local changes and pulling latest changes...${NC}"
sshpass -p "$VPS_PASSWORD" ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && git stash && git pull origin main"

echo -e "${BLUE}2. Installing dependencies...${NC}"
sshpass -p "$VPS_PASSWORD" ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && npm ci --production=false"

echo -e "${BLUE}3. Generating Prisma client...${NC}"
sshpass -p "$VPS_PASSWORD" ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && npx prisma generate"

echo -e "${BLUE}4. Building application...${NC}"
sshpass -p "$VPS_PASSWORD" ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && npm run build"

echo -e "${BLUE}5. Restarting application with PM2...${NC}"
sshpass -p "$VPS_PASSWORD" ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && pm2 restart internship-system || pm2 start npm --name 'internship-system' -- start"

# Verify deployment
echo -e "${BLUE}Verifying deployment...${NC}"
sleep 5

if curl -f -s "http://$VPS_HOST:3000/api/health" > /dev/null; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}Application URL: http://$VPS_HOST:3000${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed, but deployment may still be starting${NC}"
    echo -e "${BLUE}Application URL: http://$VPS_HOST:3000${NC}"
    echo -e "${YELLOW}Please check the application manually${NC}"
fi

# Show PM2 status
echo -e "${BLUE}PM2 Status:${NC}"
sshpass -p "$VPS_PASSWORD" ssh $VPS_USER@$VPS_HOST "pm2 status"

echo -e "${GREEN}🎉 VPS Deployment Complete!${NC}"
