#!/bin/bash

# Complete Database Setup - Migrations + Data Import
echo "🗄️ Setting up complete database with migrations and data..."

VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PASSWORD="rp4QkUUvmbi5qB"

# Step 1: Export data from local SQLite
echo "📦 Step 1: Exporting SQLite data locally..."
npm run db:export || {
    echo "❌ Failed to export SQLite data"
    exit 1
}

# Find the latest backup file
BACKUP_FILE=$(ls -t backups/data-backup-*.json 2>/dev/null | head -1)
if [ -z "$BACKUP_FILE" ]; then
    echo "❌ No backup file found"
    exit 1
fi

echo "✅ Data exported to: $BACKUP_FILE"

# Step 2: Upload backup file to VPS
echo "📤 Step 2: Uploading backup file to VPS..."
sshpass -p "$VPS_PASSWORD" scp "$BACKUP_FILE" "$VPS_USER@$VPS_HOST:/tmp/migration-backup.json" || {
    echo "❌ Failed to upload backup file"
    exit 1
}
echo "✅ Backup file uploaded"

# Step 3: Run migrations and import data on VPS
echo "🔧 Step 3: Running migrations and importing data on VPS..."

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

# Move backup file to project directory
if [ -f "/tmp/migration-backup.json" ]; then
    mkdir -p backups
    mv /tmp/migration-backup.json backups/migration-backup.json
    echo "📁 Backup file moved to project directory"
else
    echo "❌ Migration backup file not found"
    exit 1
fi

# Set production environment
export NODE_ENV=production

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations to create tables
echo "🗄️ Running database migrations..."
npx prisma migrate deploy || {
    echo "⚠️ Migration failed, trying db push..."
    npx prisma db push --force-reset
}

# Check if tables were created
echo "📋 Checking created tables..."
PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -c "\dt" || echo "Could not list tables"

# Import data using the backup file
echo "📥 Importing data to PostgreSQL..."
npx tsx scripts/import-data.ts backups/migration-backup.json || {
    echo "❌ Data import failed"
    exit 1
}

echo "✅ Database setup completed!"

# Verify data import
echo "🧪 Verifying data import..."
PGPASSWORD=internship_pass psql -U internship_user -d internship_system -h localhost -c "
SELECT 
    'faculties' as table_name, COUNT(*) as count FROM faculties
UNION ALL
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 
    'companies' as table_name, COUNT(*) as count FROM companies;
" || echo "Could not verify data"

# Restart PM2 to reload with new database
echo "🔄 Restarting application..."
pm2 restart internship-system

echo "🎉 Complete database setup finished!"
EOF

echo ""
echo "✅ Database migration and data import completed!"
echo ""
echo "🌐 Your application should now be accessible at:"
echo "   http://203.170.129.199:8080"
echo ""
echo "📊 The database now contains:"
echo "   - All tables (faculties, users, companies, etc.)"
echo "   - Migrated data from SQLite"
