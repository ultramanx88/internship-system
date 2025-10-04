#!/bin/bash

# Script to seed address data for Thailand
echo "🌱 Starting address data seeding..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "🗄️ Pushing database schema..."
npx prisma db push

# Run seed script
echo "🌱 Running address seed script..."
npx tsx scripts/seed-address-data.ts

echo "✅ Address data seeding completed!"
echo ""
echo "📋 What was created:"
echo "  - Provinces (77 provinces)"
echo "  - Districts (sample districts for Bangkok and Chiang Mai)"
echo "  - Subdistricts (sample subdistricts)"
echo ""
echo "🚀 You can now use the address selection in the internship form!"

