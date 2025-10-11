# 🚀 Multi-Deploy System Documentation

## 📋 Overview

ระบบนี้รองรับการ deploy ทั้งสองวิธีใน VPS เดียวกัน:

1. **Direct Deployment** - ใช้ systemd service (Port 8080)
2. **Docker Deployment** - ใช้ Docker containers (Port 3000)

## 🏗️ Architecture

```
/var/www/internship-system/
├── direct/           # Direct deployment files
├── docker/           # Docker deployment files
├── deploy-manager.sh # Deployment management script
└── ...
```

## 🔧 การใช้งาน

### 1. **Direct Deployment (ปัจจุบัน)**

```bash
# จากเครื่อง local
./multi-deploy.sh direct

# หรือบน server
/var/www/internship-system/deploy-manager.sh direct
```

**Architecture:**
```
Internet → Nginx (443/80) → Next.js App (8080) → PostgreSQL
```

### 2. **Docker Deployment**

```bash
# จากเครื่อง local
./multi-deploy.sh docker

# หรือบน server
/var/www/internship-system/deploy-manager.sh docker
```

**Architecture:**
```
Internet → Nginx (443/80) → Docker Container (3000) → PostgreSQL Container
```

## 📊 ตรวจสอบสถานะ

```bash
# ตรวจสอบสถานะปัจจุบัน
/var/www/internship-system/deploy-manager.sh status
```

## 🔄 การเปลี่ยนวิธี Deploy

### จาก Direct → Docker:
```bash
/var/www/internship-system/deploy-manager.sh docker
```

### จาก Docker → Direct:
```bash
/var/www/internship-system/deploy-manager.sh direct
```

## 📁 File Structure

### Direct Deployment:
- **Location**: `/var/www/internship-system/direct/`
- **Service**: `internship-system.service`
- **Port**: 8080
- **Process**: `npm start`

### Docker Deployment:
- **Location**: `/var/www/internship-system/docker/`
- **Compose**: `docker-compose.yml`
- **Port**: 3000
- **Process**: Docker containers

## 🛠️ Scripts

### Local Scripts:
- `multi-deploy.sh` - Deploy จาก local ไปยัง VPS
- `deploy-to-production.sh` - Direct deploy (legacy)
- `docker-deploy.sh` - Local Docker testing

### Server Scripts:
- `deploy-manager.sh` - จัดการ deployment methods

## 🔍 Troubleshooting

### ตรวจสอบ Service Status:
```bash
systemctl status internship-system
```

### ตรวจสอบ Docker Containers:
```bash
docker ps
docker-compose -f /var/www/internship-system/docker/docker-compose.yml ps
```

### ตรวจสอบ Ports:
```bash
netstat -tlnp | grep -E ':(3000|8080)'
```

### ตรวจสอบ Nginx:
```bash
nginx -t
systemctl status nginx
```

## 📝 Notes

- **Direct Deployment** ใช้ทรัพยากรน้อยกว่าและเร็วกว่า
- **Docker Deployment** แยก environment และง่ายต่อการจัดการ
- สามารถเปลี่ยนวิธี deploy ได้ตลอดเวลาโดยไม่ต้อง restart server
- ทั้งสองวิธีใช้ database เดียวกัน (PostgreSQL)

## 🌐 Production URL

**https://internship.samartsolution.com/**

ทั้งสองวิธีจะเข้าถึงได้ผ่าน URL เดียวกัน

