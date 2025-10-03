#!/bin/bash

# VPS Database Setup Script
# Sets up PostgreSQL on VPS
# Usage: ./setup-vps-database.sh

echo "🗄️ Setting up PostgreSQL on VPS..."

VPS_HOST="203.170.129.199"
VPS_USER="root"
VPS_PASSWORD="rp4QkUUvmbi5qB"

sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -T "$VPS_USER@$VPS_HOST" << 'EOF'
echo "🔍 Connected to VPS"

# Install PostgreSQL if not installed
if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL..."
    apt update
    apt install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
else
    echo "✅ PostgreSQL already installed"
fi

# Setup database and user
echo "🔧 Setting up database..."
sudo -u postgres psql << 'PSQL'
-- Create database
DROP DATABASE IF EXISTS internship_system;
CREATE DATABASE internship_system;

-- Create user
DROP USER IF EXISTS internship_user;
CREATE USER internship_user WITH PASSWORD 'internship_pass';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE internship_system TO internship_user;
ALTER USER internship_user CREATEDB;

-- Show databases
\l

-- Quit
\q
PSQL

echo "✅ Database setup completed!"
echo "📋 Database: internship_system"
echo "📋 User: internship_user"
echo "📋 Password: internship_pass"

EOF

echo "🎉 VPS database setup finished!"