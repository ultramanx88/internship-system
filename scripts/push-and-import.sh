#!/bin/bash

# Push Code and Import Data to VPS
echo "🚀 Pushing code and importing data to VPS..."

# Step 1: Push latest code to GitHub
echo "📤 Step 1: Pushing code to GitHub..."
git add .
git commit -m "Add migration scripts and import-data.ts" || echo "No changes to commit"
git push origin main

# Step 2: Pull code on VPS and import data
echo "🔧 Step 2: Pulling code and importing data on VPS..."

VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PASSWORD="rp4QkUUvmbi5qB"

# Export data locally first
echo "📦 Exporting local data..."
npm run db:export

# Find the latest backup file
BACKUP_FILE=$(ls -t backups/data-backup-*.json 2>/dev/null | head -1)
if [ -z "$BACKUP_FILE" ]; then
    echo "❌ No backup file found"
    exit 1
fi

echo "✅ Data exported to: $BACKUP_FILE"

# Upload backup file
echo "📤 Uploading backup file..."
sshpass -p "$VPS_PASSWORD" scp "$BACKUP_FILE" "$VPS_USER@$VPS_HOST:/tmp/migration-backup.json"

# Connect to VPS and import
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
echo "🔍 Connected to VPS"

# Find project directory
PROJECT_DIR="/var/www/internship-system"
cd "$PROJECT_DIR"
echo "📍 Working in: $(pwd)"

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Move backup file to project
if [ -f "/tmp/migration-backup.json" ]; then
    mkdir -p backups
    mv /tmp/migration-backup.json backups/migration-backup.json
    echo "📁 Backup file moved to project directory"
fi

# Set production environment
export NODE_ENV=production

# Import data using the script
echo "📥 Importing data..."
if [ -f "scripts/import-data.ts" ]; then
    npx tsx scripts/import-data.ts backups/migration-backup.json
    echo "✅ Data import completed"
else
    echo "❌ import-data.ts not found"
    ls -la scripts/
fi

# Verify data was imported
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
"

# Restart PM2
echo "🔄 Restarting application..."
pm2 restart internship-system

echo "🎉 Import completed!"
EOF

echo ""
echo "✅ Code push and data import completed!"
echo ""
echo "🌐 Check your application at: http://203.170.129.199:8080"
echo "🔑 Try logging in with your user credentials"
