#!/bin/bash

# Setup PostgreSQL Locally on macOS
echo "🔧 Setting up PostgreSQL locally on macOS..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found. Please install Homebrew first:"
    echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi

echo "✅ Homebrew found"

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
brew install postgresql@16 || {
    echo "⚠️ PostgreSQL might already be installed, continuing..."
}

# Start PostgreSQL service
echo "🚀 Starting PostgreSQL service..."
brew services start postgresql@16

# Wait for PostgreSQL to start
sleep 3

# Create database and user
echo "👤 Creating database and user..."

# Create user and database
psql postgres << PSQL_EOF
-- Create user (if not exists)
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'internship_user') THEN
        CREATE USER internship_user WITH PASSWORD 'internship_pass';
    END IF;
END
\$\$;

-- Create database (if not exists)
SELECT 'CREATE DATABASE internship_system_local OWNER internship_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'internship_system_local')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE internship_system_local TO internship_user;

-- Connect to database and grant schema privileges
\c internship_system_local
GRANT ALL ON SCHEMA public TO internship_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO internship_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO internship_user;

-- Show result
\l internship_system_local
\du internship_user
PSQL_EOF

echo ""
echo "✅ PostgreSQL setup completed!"
echo ""
echo "📝 Database credentials:"
echo "   User: internship_user"
echo "   Password: internship_pass"
echo "   Database: internship_system_local"
echo "   Host: localhost"
echo "   Port: 5432"
echo ""
echo "🔗 Connection string:"
echo "   postgresql://internship_user:internship_pass@localhost:5432/internship_system_local"

# Test connection
echo ""
echo "🧪 Testing connection..."
PGPASSWORD=internship_pass psql -U internship_user -d internship_system_local -h localhost -c "SELECT 'Local PostgreSQL connection successful!' as status;"

if [ $? -eq 0 ]; then
    echo "✅ Connection test passed!"
else
    echo "❌ Connection test failed!"
fi

echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with PostgreSQL connection"
echo "2. Run migrations: npm run db:migrate"
echo "3. Seed data: npm run db:seed"
echo "4. Start development: npm run dev"
