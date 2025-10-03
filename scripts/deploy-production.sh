#!/bin/bash

# Production Deployment Script
echo "🚀 Starting production deployment..."

# 1. Copy production schema
echo "📋 Copying production schema..."
cp prisma/schema.production.prisma prisma/schema.prisma

# 2. Generate Prisma Client for PostgreSQL
echo "🔧 Generating Prisma Client for PostgreSQL..."
NODE_ENV=production npx prisma generate

# 3. Run migrations
echo "🗄️ Running database migrations..."
NODE_ENV=production npx prisma migrate deploy

# 4. Seed database (optional)
echo "🌱 Seeding database..."
NODE_ENV=production npm run db:seed:prod

# 5. Build application
echo "🏗️ Building application..."
NODE_ENV=production npm run build:prod

echo "✅ Production deployment completed!"