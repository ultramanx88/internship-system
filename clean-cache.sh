#!/bin/bash

echo "🧹 Cleaning Next.js cache and dependencies..."

# Remove Next.js cache
rm -rf .next

# Remove node_modules cache
rm -rf node_modules/.cache

# Clear npm cache
npm cache clean --force

echo "✅ Cache cleaned successfully!"
echo "💡 Now run: npm run dev"