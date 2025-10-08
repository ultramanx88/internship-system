# GitHub Actions Setup Guide

## 1. สร้าง SSH Key สำหรับ VPS

```bash
# สร้าง SSH key ใหม่
ssh-keygen -t rsa -b 4096 -C "github-actions@internship-system" -f ~/.ssh/github_actions_vps

# Copy public key ไป VPS
ssh-copy-id -i ~/.ssh/github_actions_vps.pub root@203.170.129.199

# หรือ copy manual
cat ~/.ssh/github_actions_vps.pub
# แล้วไป paste ใน VPS: ~/.ssh/authorized_keys
```

## 2. ตั้งค่า GitHub Secrets

ไปที่ GitHub Repository → Settings → Secrets and variables → Actions

เพิ่ม secrets ต่อไปนี้:

### VPS_HOST
```
203.170.129.199
```

### VPS_USERNAME
```
root
```

### VPS_SSH_KEY
```bash
# Copy private key
cat ~/.ssh/github_actions_vps
```

## 3. ตั้งค่า VPS

```bash
# สร้าง directory สำหรับ deployment
mkdir -p /var/www/internship-system

# ตั้งค่า permissions
chown -R root:root /var/www/internship-system
chmod -R 755 /var/www/internship-system

# ตั้งค่า PM2
npm install -g pm2
pm2 startup
pm2 save
```

## 4. สร้าง .env.production

```bash
# ใน VPS
cd /var/www/internship-system
cat > .env.production << 'EOF'
DATABASE_URL="postgresql://internship_user:internship_pass@localhost:5432/internship_system"
NODE_ENV=production
PORT=8080
EOF
```

## 5. ทดสอบ Deploy

1. Push code ไป main branch
2. ดู GitHub Actions tab
3. ตรวจสอบ logs

## 6. Rollback Script (ถ้าจำเป็น)

```bash
#!/bin/bash
# rollback.sh
cd /var/www/internship-system

# หา backup ล่าสุด
LATEST_BACKUP=$(ls -t .next.backup.* | head -1)

if [ -n "$LATEST_BACKUP" ]; then
    echo "Rolling back to: $LATEST_BACKUP"
    
    # Stop current app
    pm2 stop internship-system
    
    # Restore backup
    rm -rf .next
    mv "$LATEST_BACKUP" .next
    
    # Start app
    pm2 start internship-system
    
    echo "Rollback completed!"
else
    echo "No backup found!"
fi
```
