#!/bin/bash

echo "🚀 เริ่มต้นการ seed ระบบบุคลากรทางการศึกษา..."

# Generate Prisma client
echo "📦 สร้าง Prisma client..."
npx prisma generate

# Push schema to database
echo "🗄️ อัปเดตฐานข้อมูล..."
npx prisma db push --accept-data-loss

# Run seed script
echo "🌱 เริ่ม seed ข้อมูล..."
npx tsx scripts/seed-educator-system.ts

echo "✅ เสร็จสิ้น!"
