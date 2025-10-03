#!/bin/bash

# Fix PostgreSQL Authentication for Internship System
echo "🔧 Fixing PostgreSQL authentication..."

VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PASSWORD="rp4QkUUvmbi5qB"

echo "📡 Connecting to VPS to fix PostgreSQL auth..."

sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
echo "🔍 Connected to VPS"

# Fix PostgreSQL authentication
echo "🔧 Configuring PostgreSQL authentication..."

# Update pg_hba.conf to allow password authentication
PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" | grep -oP '\d+\.\d+' | head -1)
PG_HBA_FILE="/etc/postgresql/${PG_VERSION}/main/pg_hba.conf"

echo "📝 PostgreSQL version: $PG_VERSION"
echo "📁 Config file: $PG_HBA_FILE"

# Backup original config
cp "$PG_HBA_FILE" "${PG_HBA_FILE}.backup"

# Update authentication method for local connections
sed -i 's/local   all             all                                     peer/local   all             all                                     md5/' "$PG_HBA_FILE"
sed -i 's/host    all             all             127.0.0.1\/32            ident/host    all             all             127.0.0.1\/32            md5/' "$PG_HBA_FILE"

echo "✅ Updated pg_hba.conf"

# Restart PostgreSQL to apply changes
systemctl restart postgresql

echo "🔄 PostgreSQL restarted"

# Wait for PostgreSQL to start
sleep 3

# Recreate user with proper password
echo "👤 Recreating user with proper authentication..."

sudo -u postgres psql << PSQL_EOF
-- Drop and recreate user to ensure password is set correctly
DROP USER IF EXISTS internship_user;
CREATE USER internship_user WITH PASSWORD 'internship_pass';

-- Recreate database if needed
DROP DATABASE IF EXISTS internship_system;
CREATE DATABASE internship_system OWNER internship_user;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE internship_system TO internship_user;

-- Connect to database and grant schema privileges
\c internship_system
GRANT ALL ON SCHEMA public TO internship_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO internship_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO internship_user;

-- Show result
\l internship_system
\du internship_user
PSQL_EOF

echo ""
echo "✅ User recreated with proper authentication"

# Test connection again
echo "🧪 Testing connection..."
PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -c "SELECT 'Connection successful!' as status;"

if [ $? -eq 0 ]; then
    echo "✅ Database connection test passed!"
else
    echo "❌ Database connection test still failed!"
    echo "📋 Checking PostgreSQL logs..."
    tail -10 /var/log/postgresql/postgresql-${PG_VERSION}-main.log
fi

echo ""
echo "📊 PostgreSQL Status:"
systemctl status postgresql --no-pager | head -5
EOF

echo "🎉 PostgreSQL authentication fix completed!"
echo ""
echo "Next steps:"
echo "1. Run: npm run deploy:safe:migrate"
echo "2. Or run: ./safe-update.sh --migrate"
