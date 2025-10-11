#!/bin/bash

# Sync Specific Tables Script
# Sync only specific tables between VPS and Local

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

echo -e "${BLUE}🔄 Sync Specific Tables between VPS and Local${NC}"

# Function to sync table from VPS to Local
sync_table_from_vps() {
    local table_name=$1
    echo -e "${YELLOW}📥 Syncing table: ${table_name}${NC}"
    
    # Export table from VPS
    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << EOF
cd /var/www/internship-system
docker exec internship_postgres pg_dump -U postgres -d internship_system --table=${table_name} --data-only --inserts > ${table_name}_data.sql
EOF
    
    # Download table data
    sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/${table_name}_data.sql ./
    
    # Import to local database
    docker exec -i internship-system-postgres-1 psql -U postgres -d internship_system < ${table_name}_data.sql
    
    # Clean up
    rm -f ${table_name}_data.sql
    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "rm -f /var/www/internship-system/${table_name}_data.sql"
    
    echo -e "${GREEN}✅ Table ${table_name} synced successfully${NC}"
}

# Function to sync table from Local to VPS
sync_table_to_vps() {
    local table_name=$1
    echo -e "${YELLOW}📤 Syncing table: ${table_name} to VPS${NC}"
    
    # Export table from Local
    docker exec internship-system-postgres-1 pg_dump -U postgres -d internship_system --table=${table_name} --data-only --inserts > ${table_name}_data.sql
    
    # Upload to VPS
    sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no ${table_name}_data.sql ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/
    
    # Import to VPS database
    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << EOF
cd /var/www/internship-system
docker exec -i internship_postgres psql -U postgres -d internship_system < ${table_name}_data.sql
rm -f ${table_name}_data.sql
EOF
    
    # Clean up local
    rm -f ${table_name}_data.sql
    
    echo -e "${GREEN}✅ Table ${table_name} synced to VPS successfully${NC}"
}

# Main menu
echo -e "${YELLOW}Choose sync direction:${NC}"
echo "1) Sync FROM VPS to Local"
echo "2) Sync FROM Local to VPS"
echo "3) Sync specific tables FROM VPS to Local"
echo "4) Sync specific tables FROM Local to VPS"
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo -e "${YELLOW}📥 Syncing all data FROM VPS to Local...${NC}"
        # List of important tables to sync
        tables=("users" "applications" "system_settings" "notifications" "audit_logs")
        for table in "${tables[@]}"; do
            sync_table_from_vps "$table"
        done
        ;;
    2)
        echo -e "${YELLOW}📤 Syncing all data FROM Local to VPS...${NC}"
        # List of important tables to sync
        tables=("users" "applications" "system_settings" "notifications" "audit_logs")
        for table in "${tables[@]}"; do
            sync_table_to_vps "$table"
        done
        ;;
    3)
        read -p "Enter table names (comma-separated): " table_input
        IFS=',' read -ra tables <<< "$table_input"
        for table in "${tables[@]}"; do
            table=$(echo "$table" | xargs) # trim whitespace
            sync_table_from_vps "$table"
        done
        ;;
    4)
        read -p "Enter table names (comma-separated): " table_input
        IFS=',' read -ra tables <<< "$table_input"
        for table in "${tables[@]}"; do
            table=$(echo "$table" | xargs) # trim whitespace
            sync_table_to_vps "$table"
        done
        ;;
    *)
        echo -e "${RED}❌ Invalid choice!${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Table sync completed successfully!${NC}"
