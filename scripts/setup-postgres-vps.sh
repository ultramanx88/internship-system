#!/bin/bash

# Setup PostgreSQL for Internship System on VPS
echo "🔧 Setting up PostgreSQL for Internship System..."

VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PASSWORD="rp4QkUUvmbi5qB"

echo "📡 Connecting to VPS to setup PostgreSQL..."

sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
echo "🔍 Connected to VPS"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL..."
    apt update
    apt install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
    echo "✅ PostgreSQL installed"
else
    echo "✅ PostgreSQL already installed"
fi

# Check PostgreSQL status
echo "📊 PostgreSQL Status:"
systemctl status postgresql --no-pager | head -5

# Create database user and database
echo "👤 Creating database user and database..."

sudo -u postgres psql << PSQL_EOF
-- Drop existing if needed (uncomment if you want fresh setup)
-- DROP DATABASE IF EXISTS internship_system;
-- DROP USER IF EXISTS internship_user;

-- Create user
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'internship_user') THEN
        CREATE USER internship_user WITH PASSWORD 'internship_pass';
    END IF;
END
\$\$;

-- Create database
SELECT 'CREATE DATABASE internship_system OWNER internship_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'internship_system')\gexec

-- Grant privileges
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
echo "✅ PostgreSQL setup completed!"
echo ""
echo "📝 Database credentials:"
echo "   User: internship_user"
echo "   Password: internship_pass"  
echo "   Database: internship_system"
echo "   Host: localhost"
echo "   Port: 5432"
echo ""
echo "🔗 Connection string:"
echo "   postgresql://internship_user:internship_pass@localhost:5432/internship_system"
echo ""
echo "🧪 Testing connection..."
PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -c "SELECT 'Connection successful!' as status;"

if [ $? -eq 0 ]; then
    echo "✅ Database connection test passed!"
else
    echo "❌ Database connection test failed!"
fi
EOF

echo "🎉 PostgreSQL setup finished!"
echo ""
echo "Next steps:"
echo "1. Run: npm run deploy:safe:migrate"
echo "2. Or run: ./safe-update.sh --migrate"
