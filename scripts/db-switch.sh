#!/bin/bash

# Database Switch Script
# Usage: ./scripts/db-switch.sh [local|production]

if [ "$1" = "local" ]; then
    echo "🔄 Switching to SQLite (Local Development)..."
    cp prisma/schema.local.prisma prisma/schema.prisma
    cp .env.example .env
    sed -i '' 's|DATABASE_URL=.*|DATABASE_URL="file:./prisma/dev.db"|' .env
    echo "✅ Switched to SQLite"
    echo "🔧 Generating Prisma client..."
    npx prisma generate
    
elif [ "$1" = "production" ]; then
    echo "🔄 Switching to PostgreSQL (Production)..."
    cp prisma/schema.production.prisma prisma/schema.prisma
    cp .env.production .env
    echo "✅ Switched to PostgreSQL"
    echo "🔧 Generating Prisma client..."
    npx prisma generate
    
else
    echo "Usage: ./scripts/db-switch.sh [local|production]"
    echo ""
    echo "Options:"
    echo "  local      - Switch to SQLite for local development"
    echo "  production - Switch to PostgreSQL for production"
fi