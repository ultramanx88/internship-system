#!/bin/bash

echo "🚀 Starting Internship System Development Server..."

# Kill any existing processes on ports
echo "🔄 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:9002 | xargs kill -9 2>/dev/null || true

# Check if database exists
if [ ! -f "prisma/dev.db" ]; then
    echo "📦 Setting up database..."
    npx prisma db push
    npx tsx prisma/seed.ts
fi

# Start development server
echo "🌟 Starting Next.js development server on http://localhost:3001"
node test-server.js