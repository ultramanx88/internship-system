#!/bin/bash

# Clean up all unnecessary scripts
echo "🧹 Cleaning up scripts folder..."

# Files to KEEP (essential ones)
KEEP_FILES=(
    "perfect-deploy.sh"
    "export-data.ts"
    "import-data.ts"
)

# Files to DELETE (all the rest)
DELETE_FILES=(
    "check-auth-api.sh"
    "check-users-vps.sh"
    "check-vps-database.sh"
    "check-vps-status.sh"
    "create-better-templates.js"
    "create-tables-vps.sh"
    "db-switch.sh"
    "deploy-production.sh"
    "extract-real-templates.js"
    "fix-admin-password-sqlite.ts"
    "fix-admin-password.ts"
    "fix-dependencies-vps.sh"
    "fix-postgres-auth.sh"
    "fix-postgres-simple.sh"
    "fix-template-headers.js"
    "force-import-data.sh"
    "import-existing-backup.sh"
    "migrate-companies.ts"
    "migrate-to-postgresql.ts"
    "push-and-import.sh"
    "read-document-templates.js"
    "read-faculty-data.ts"
    "setup-database-complete.sh"
    "setup-local-db.ps1"
    "setup-local-db.sh"
    "setup-local-postgres.sh"
    "setup-postgres-vps.sh"
    "test-verify-api.sh"
)

echo ""
echo "📋 Files to KEEP:"
for file in "${KEEP_FILES[@]}"; do
    if [ -f "scripts/$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file (not found)"
    fi
done

echo ""
echo "🗑️  Files to DELETE:"
for file in "${DELETE_FILES[@]}"; do
    if [ -f "scripts/$file" ]; then
        echo "   🗑️  $file"
    fi
done

echo ""
read -p "❓ Delete all unnecessary scripts? (y/n): " confirm

if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    echo ""
    echo "🗑️  Deleting files..."
    
    for file in "${DELETE_FILES[@]}"; do
        if [ -f "scripts/$file" ]; then
            rm "scripts/$file"
            echo "   ✅ Deleted $file"
        fi
    done
    
    echo ""
    echo "🎉 Cleanup completed!"
    echo ""
    echo "📁 Remaining files in scripts/:"
    ls -la scripts/
    
else
    echo "❌ Cleanup cancelled"
fi
