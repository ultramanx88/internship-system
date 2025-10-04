#!/bin/bash

# Script to seed complete address data for Thailand
echo "🌱 Starting complete address data seeding..."

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
npx prisma db push --accept-data-loss

# Run complete seed script
echo "🌱 Running complete address seed script..."
npx tsx scripts/seed-complete-address-data.ts

echo "✅ Complete address data seeding completed!"
echo ""
echo "📋 What was created:"
echo "  - Provinces: 77 provinces (all of Thailand)"
echo "  - Districts: 75 districts (Bangkok + Chiang Mai)"
echo "  - Subdistricts: 67 subdistricts (with postal codes)"
echo ""
echo "🌐 API Endpoints available:"
echo "  - GET /api/address/provinces"
echo "  - GET /api/address/districts?provinceId=X"
echo "  - GET /api/address/subdistricts?districtId=X"
echo ""
echo "🚀 You can now use the complete address system!"
