# Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Internship Management System to production.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+
- PM2 (for process management)
- Nginx (for reverse proxy)
- SSL certificate (for HTTPS)

## Environment Setup

### 1. Server Requirements

**Minimum Requirements:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD
- OS: Ubuntu 20.04+ or CentOS 8+

**Recommended Requirements:**
- CPU: 4 cores
- RAM: 8GB
- Storage: 50GB SSD
- OS: Ubuntu 22.04 LTS

### 2. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### 3. Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE internship_system;
CREATE USER internship_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE internship_system TO internship_user;
\q
```

## Application Deployment

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/internship-system.git
cd internship-system

# Install dependencies
npm install
```

### 2. Environment Configuration

Create `.env.production` file:

```env
# Database
DATABASE_URL="postgresql://internship_user:your_secure_password@localhost:5432/internship_system"

# Next.js
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="https://your-domain.com"

# Application
NODE_ENV="production"
PORT=8080

# Security
CSRF_SECRET="your_csrf_secret_here"
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# Logging
LOG_LEVEL="info"
LOG_FILE="/var/log/internship-system/app.log"
```

### 3. Build Application

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build application
npm run build:prod
```

### 4. Seed Database

```bash
# Seed initial data
npm run db:seed:prod
```

### 5. PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'internship-system',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/internship-system',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    error_file: '/var/log/internship-system/error.log',
    out_file: '/var/log/internship-system/out.log',
    log_file: '/var/log/internship-system/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### 6. Start Application

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

## Nginx Configuration

### 1. Create Nginx Configuration

Create `/etc/nginx/sites-available/internship-system`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    # API Routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Login Rate Limiting
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static Files
    location /_next/static/ {
        proxy_pass http://localhost:8080;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Main Application
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Enable Site

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/internship-system /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## SSL Certificate

### 1. Using Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Using Custom Certificate

```bash
# Copy certificate files
sudo cp your-certificate.crt /etc/ssl/certs/
sudo cp your-private.key /etc/ssl/private/
sudo chmod 600 /etc/ssl/private/your-private.key
```

## Monitoring and Logging

### 1. PM2 Monitoring

```bash
# View logs
pm2 logs internship-system

# Monitor resources
pm2 monit

# Restart application
pm2 restart internship-system

# View status
pm2 status
```

### 2. Log Rotation

Create `/etc/logrotate.d/internship-system`:

```
/var/log/internship-system/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 3. Health Checks

Create health check script `/var/www/internship-system/health-check.sh`:

```bash
#!/bin/bash

# Check if application is running
if ! pm2 list | grep -q "internship-system.*online"; then
    echo "Application is not running"
    exit 1
fi

# Check if application responds
if ! curl -f http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "Application is not responding"
    exit 1
fi

echo "Application is healthy"
exit 0
```

Make executable:
```bash
chmod +x /var/www/internship-system/health-check.sh
```

## Backup Strategy

### 1. Database Backup

Create backup script `/var/www/internship-system/backup-db.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/internship-system"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -h localhost -U internship_user -d internship_system > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Database backup completed: $BACKUP_FILE.gz"
```

### 2. Application Backup

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/internship-system"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/internship-system"

# Create application backup
tar -czf "$BACKUP_DIR/app_backup_$DATE.tar.gz" -C $APP_DIR .

# Remove backups older than 30 days
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +30 -delete

echo "Application backup completed: $BACKUP_DIR/app_backup_$DATE.tar.gz"
```

## Security Hardening

### 1. Firewall Configuration

```bash
# Install UFW
sudo apt install ufw -y

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Database Security

```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/13/main/postgresql.conf

# Set security parameters
listen_addresses = 'localhost'
ssl = on
ssl_cert_file = '/etc/ssl/certs/server.crt'
ssl_key_file = '/etc/ssl/private/server.key'

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 3. Application Security

```bash
# Set proper permissions
sudo chown -R www-data:www-data /var/www/internship-system
sudo chmod -R 755 /var/www/internship-system

# Protect sensitive files
sudo chmod 600 /var/www/internship-system/.env.production
```

## Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check logs
   pm2 logs internship-system
   
   # Check environment variables
   pm2 env 0
   ```

2. **Database connection issues**
   ```bash
   # Test database connection
   psql -h localhost -U internship_user -d internship_system
   
   # Check PostgreSQL status
   sudo systemctl status postgresql
   ```

3. **Nginx configuration issues**
   ```bash
   # Test configuration
   sudo nginx -t
   
   # Check error logs
   sudo tail -f /var/log/nginx/error.log
   ```

### Performance Optimization

1. **Enable Gzip Compression**
   ```nginx
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   ```

2. **Database Optimization**
   ```sql
   -- Create indexes for frequently queried columns
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_applications_status ON applications(status);
   CREATE INDEX idx_applications_date_applied ON applications(date_applied);
   ```

3. **PM2 Cluster Mode**
   ```javascript
   // In ecosystem.config.js
   {
     instances: 'max', // Use all CPU cores
     exec_mode: 'cluster'
   }
   ```

## Maintenance

### Regular Tasks

1. **Daily**
   - Check application logs
   - Monitor system resources
   - Verify backups

2. **Weekly**
   - Update system packages
   - Review security logs
   - Test backup restoration

3. **Monthly**
   - Update application dependencies
   - Review and rotate logs
   - Security audit

### Updates

```bash
# Update application
cd /var/www/internship-system
git pull origin main
npm install
npm run build:prod
pm2 restart internship-system

# Update system
sudo apt update && sudo apt upgrade -y
```

This deployment guide provides a comprehensive approach to deploying and maintaining the Internship Management System in production.
