#!/bin/bash

# Pull Database from VPS Script
# Download database from VPS to local machine

SERVER_IP="203.170.129.199"
SERVER_USER="root"
SERVER_PASSWORD="rp4QkUUvmbi5qB"
SERVER_PATH="/var/www/internship-system"
LOCAL_BACKUP_DIR="./backups/vps-database-$(date +%Y%m%d_%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📥 Pulling Database from VPS: ${SERVER_IP}${NC}"

# Create local backup directory
mkdir -p "$LOCAL_BACKUP_DIR"

# Step 1: Create database dump on VPS
echo -e "${YELLOW}🗄️  Creating database dump on VPS...${NC}"
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system

# Create database dump
docker exec internship_postgres pg_dump -U postgres -d internship_system --clean --if-exists --create > vps_database_dump.sql

# Create data-only dump (for specific tables)
docker exec internship_postgres pg_dump -U postgres -d internship_system --data-only --inserts > vps_data_only.sql

# Create schema-only dump
docker exec internship_postgres pg_dump -U postgres -d internship_system --schema-only > vps_schema_only.sql

echo "Database dumps created successfully"
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to create database dump on VPS!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database dump created on VPS${NC}"

# Step 2: Download database dumps
echo -e "${YELLOW}📥 Downloading database dumps...${NC}"
sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/vps_database_dump.sql "$LOCAL_BACKUP_DIR/"
sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/vps_data_only.sql "$LOCAL_BACKUP_DIR/"
sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/vps_schema_only.sql "$LOCAL_BACKUP_DIR/"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to download database dumps!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database dumps downloaded${NC}"

# Step 3: Clean up VPS
echo -e "${YELLOW}🧹 Cleaning up VPS...${NC}"
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/internship-system
rm -f vps_database_dump.sql vps_data_only.sql vps_schema_only.sql
echo "VPS cleanup completed"
EOF

# Step 4: Show local files
echo -e "${GREEN}📁 Database dumps saved to: ${LOCAL_BACKUP_DIR}${NC}"
ls -la "$LOCAL_BACKUP_DIR"

# Step 5: Option to restore to local database
echo -e "${YELLOW}🔄 Do you want to restore to local database? (y/n)${NC}"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🔄 Restoring to local database...${NC}"
    
    # Stop local database if running
    docker-compose down postgres 2>/dev/null || true
    
    # Start local database
    docker-compose up -d postgres
    
    # Wait for database to be ready
    sleep 10
    
    # Restore database
    docker exec -i internship-system-postgres-1 psql -U postgres < "$LOCAL_BACKUP_DIR/vps_database_dump.sql"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database restored to local successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to restore database to local!${NC}"
    fi
fi

echo -e "${GREEN}🎉 Database pull completed successfully!${NC}"
echo -e "${BLUE}📁 Files saved to: ${LOCAL_BACKUP_DIR}${NC}"
echo -e "${YELLOW}📋 Available files:${NC}"
echo -e "  - vps_database_dump.sql (Full database with schema and data)"
echo -e "  - vps_data_only.sql (Data only, INSERT statements)"
echo -e "  - vps_schema_only.sql (Schema only)"
