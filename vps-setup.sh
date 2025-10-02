#!/bin/bash

# VPS Setup Script
echo "🚀 Setting up internship system on VPS..."

# ไปยังโฟลเดอร์โปรเจกต์
cd /var/www/internship-system

# Install dependencies
echo "📦 Installing dependencies..."
sudo npm install

# Copy environment file
echo "🔧 Setting up environment..."
sudo cp .env.production .env

# Generate Prisma client
echo "🗄️ Setting up database..."
sudo npx prisma generate

# Run database migrations
sudo npx prisma migrate deploy

# Build the application
echo "🏗️ Building application..."
sudo npm run build

# Set permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data .
sudo chmod -R 755 .

# Restart services
echo "🔄 Restarting services..."
sudo systemctl restart nginx
sudo pm2 restart all || sudo pm2 start npm --name "internship-system" -- start

echo "✅ Setup complete!"
echo ""
echo "🌐 Your application should be running on:"
echo "http://your-vps-ip:8080"
echo ""
echo "📊 Check status:"
echo "sudo pm2 status"
echo "sudo systemctl status nginx"