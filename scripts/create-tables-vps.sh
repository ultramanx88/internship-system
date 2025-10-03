#!/bin/bash

# Force Create Tables on VPS
echo "🗄️ Force creating tables on VPS..."

VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PASSWORD="rp4QkUUvmbi5qB"

echo "📡 Connecting to VPS to create tables..."

sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
echo "🔍 Connected to VPS"

# Find project directory
PROJECT_DIR=""
if [ -d "/var/www/internship-system" ]; then
    PROJECT_DIR="/var/www/internship-system"
elif [ -d "/home/internship-system" ]; then
    PROJECT_DIR="/home/internship-system"
elif [ -d "/root/internship-system" ]; then
    PROJECT_DIR="/root/internship-system"
else
    echo "❌ Project directory not found!"
    exit 1
fi

cd "$PROJECT_DIR"
echo "📍 Working in: $(pwd)"

# Set production environment
export NODE_ENV=production

# Make sure we're using PostgreSQL schema
echo "🔄 Ensuring PostgreSQL schema is active..."
cp prisma/schema.production.prisma prisma/schema.prisma
echo "✅ PostgreSQL schema activated"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Force create tables using db push (bypasses migrations)
echo "🗄️ Force creating tables with db push..."
npx prisma db push --force-reset --accept-data-loss

# Verify tables were created
echo "📋 Verifying tables creation..."
PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -c "\dt"

# Check specific tables
echo "📊 Checking key tables:"
PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -c "
SELECT 
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'faculties') 
         THEN '✅ faculties table created' 
         ELSE '❌ faculties table missing' END,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') 
         THEN '✅ users table created' 
         ELSE '❌ users table missing' END,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'companies') 
         THEN '✅ companies table created' 
         ELSE '❌ companies table missing' END;
"

echo "✅ Tables creation completed!"
EOF

echo ""
echo "🎉 Tables creation finished!"
echo ""
echo "📋 Next steps:"
echo "1. Import data: ./scripts/setup-database-complete.sh"
echo "2. Or just import: npm run deploy:safe:migrate"
echo "3. Check website: http://203.170.129.199:8080"
