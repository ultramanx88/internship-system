#!/bin/bash

# Fix Missing Dependencies on VPS
echo "🔧 Fixing missing dependencies on VPS..."

VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PASSWORD="rp4QkUUvmbi5qB"

echo "📡 Connecting to VPS to fix dependencies..."

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

# Clean npm cache and node_modules
echo "🧹 Cleaning npm cache and node_modules..."
rm -rf node_modules package-lock.json
npm cache clean --force

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Specifically install missing packages
echo "🔧 Installing specific missing packages..."
npm install autoprefixer postcss tailwindcss --save-dev

# Verify installation
echo "✅ Verifying installations..."
npm list autoprefixer postcss tailwindcss || echo "Some packages may not be listed but should be available"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
NODE_ENV=production npx prisma generate

echo "✅ Dependencies fixed!"
EOF

echo "🎉 Dependencies fix completed!"
echo ""
echo "Next steps:"
echo "1. Fix PostgreSQL: chmod +x scripts/fix-postgres-simple.sh && ./scripts/fix-postgres-simple.sh"
echo "2. Run migration: npm run deploy:safe:migrate"
