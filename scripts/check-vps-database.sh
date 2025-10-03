#!/bin/bash

# Check VPS Database Status
echo "🔍 Checking VPS database status..."

VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PASSWORD="rp4QkUUvmbi5qB"

echo "📡 Connecting to VPS to check database..."

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

echo ""
echo "🗄️ Database Connection Test:"
PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -c "SELECT version();" 2>/dev/null && echo "✅ Database connection OK" || echo "❌ Database connection failed"

echo ""
echo "📋 Checking existing tables:"
PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -c "\dt" 2>/dev/null || echo "❌ Could not list tables"

echo ""
echo "📊 Checking if tables exist:"
PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -c "
SELECT 
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'faculties') 
         THEN '✅ faculties table exists' 
         ELSE '❌ faculties table missing' END,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') 
         THEN '✅ users table exists' 
         ELSE '❌ users table missing' END,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'companies') 
         THEN '✅ companies table exists' 
         ELSE '❌ companies table missing' END;
" 2>/dev/null || echo "❌ Could not check tables"

echo ""
echo "🔧 Checking Prisma migrations:"
ls -la prisma/migrations/ 2>/dev/null || echo "❌ No migrations directory found"

echo ""
echo "📄 Checking schema files:"
ls -la prisma/schema*.prisma 2>/dev/null || echo "❌ No schema files found"

echo ""
echo "🌐 Environment check:"
echo "Current schema file:"
head -10 prisma/schema.prisma 2>/dev/null || echo "❌ No schema.prisma found"

echo ""
echo "📝 Environment variables:"
grep DATABASE_URL .env 2>/dev/null || echo "❌ No DATABASE_URL in .env"

echo ""
echo "💡 Diagnosis:"
if [ ! -d "prisma/migrations" ]; then
    echo "❌ No migrations directory - need to create migrations"
elif [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ No schema.prisma - need to copy production schema"
else
    echo "✅ Files exist - may need to run migrations"
fi
EOF

echo ""
echo "💡 Recommended actions:"
echo "1. Push latest code: git push"
echo "2. Run database setup: ./scripts/setup-database-complete.sh"
echo "3. Or manually create tables: npm run deploy:safe:migrate"
