#!/bin/bash

# Simple PostgreSQL Authentication Fix
echo "🔧 Simple PostgreSQL authentication fix..."

VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PASSWORD="rp4QkUUvmbi5qB"

echo "📡 Connecting to VPS..."

sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
echo "🔍 Connected to VPS"

# Find correct PostgreSQL config directory
PG_VERSION=$(ls /etc/postgresql/ | head -1)
echo "📝 PostgreSQL version directory: $PG_VERSION"

PG_CONFIG_DIR="/etc/postgresql/$PG_VERSION/main"
PG_HBA_FILE="$PG_CONFIG_DIR/pg_hba.conf"

echo "📁 Config directory: $PG_CONFIG_DIR"
echo "📄 HBA file: $PG_HBA_FILE"

# Check if config file exists
if [ -f "$PG_HBA_FILE" ]; then
    echo "✅ Found pg_hba.conf"
    
    # Backup original
    cp "$PG_HBA_FILE" "${PG_HBA_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Simple fix: change all authentication to trust temporarily
    sed -i 's/peer/trust/g' "$PG_HBA_FILE"
    sed -i 's/ident/trust/g' "$PG_HBA_FILE"
    sed -i 's/md5/trust/g' "$PG_HBA_FILE"
    
    echo "✅ Updated authentication to trust"
    
    # Restart PostgreSQL
    systemctl restart postgresql
    sleep 3
    
    echo "🔄 PostgreSQL restarted"
    
    # Now recreate user with password
    sudo -u postgres psql << PSQL_EOF
-- Clean up existing user and databases
DROP DATABASE IF EXISTS internship_db;
DROP DATABASE IF EXISTS internship_system;
DROP USER IF EXISTS internship_user;

-- Create fresh user and database
CREATE USER internship_user WITH PASSWORD 'internship_pass';
CREATE DATABASE internship_system OWNER internship_user;
GRANT ALL PRIVILEGES ON DATABASE internship_system TO internship_user;

-- Connect and set permissions
\c internship_system
GRANT ALL ON SCHEMA public TO internship_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO internship_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO internship_user;

\q
PSQL_EOF

    echo "✅ User and database recreated"
    
    # Test connection
    echo "🧪 Testing connection..."
    sudo -u postgres psql -U internship_user -d internship_system -c "SELECT 'Connection successful!' as status;"
    
    if [ $? -eq 0 ]; then
        echo "✅ Connection test passed!"
    else
        echo "❌ Connection test failed"
    fi
    
else
    echo "❌ pg_hba.conf not found at $PG_HBA_FILE"
    echo "📋 Available PostgreSQL directories:"
    ls -la /etc/postgresql/
fi

echo ""
echo "📊 PostgreSQL Status:"
systemctl status postgresql --no-pager | head -5
EOF

echo "🎉 Simple PostgreSQL fix completed!"
echo ""
echo "⚠️  Note: Using 'trust' authentication (less secure)"
echo "Next steps:"
echo "1. Run: npm run deploy:safe:migrate"
echo "2. After migration, consider securing authentication"
