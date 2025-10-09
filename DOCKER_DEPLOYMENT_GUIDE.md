# 🐳 Docker Deployment Guide

## ภาพรวม

Docker solution นี้แก้ปัญหา deploy แล้วไม่ครบ sync ไม่ได้ โดยให้:

- **Containerization** - แยก environment แต่ละส่วน
- **Health Checks** - ตรวจสอบสถานะ service
- **Data Persistence** - เก็บข้อมูลถาวร
- **Easy Scaling** - ขยายระบบได้ง่าย
- **Backup & Recovery** - สำรองข้อมูลอัตโนมัติ

## 🚀 Quick Start

### 1. Development Environment

```bash
# เริ่ม development environment
docker-compose up -d

# ดู logs
docker-compose logs -f

# หยุด services
docker-compose down
```

### 2. Production Environment

```bash
# ใช้ production config
docker-compose -f docker-compose.prod.yml up -d

# เริ่มพร้อม admin tools
docker-compose -f docker-compose.prod.yml --profile admin up -d

# เริ่มพร้อม backup service
docker-compose -f docker-compose.prod.yml --profile backup up -d
```

## 📁 ไฟล์ที่สำคัญ

### Docker Files
- `Dockerfile` - Next.js application image
- `docker-compose.yml` - Development environment
- `docker-compose.prod.yml` - Production environment
- `.dockerignore` - Files to exclude from build

### Configuration Files
- `nginx.conf` - Nginx reverse proxy config
- `docker.env.example` - Environment variables template

### Scripts
- `docker-deploy.sh` - Deployment script
- `docker-deploy.sh --help` - ดู options

## 🔧 การใช้งาน

### Development

```bash
# เริ่ม development
./docker-deploy.sh --type code-only

# เริ่มพร้อม database backup
./docker-deploy.sh --type full --backup-db

# เริ่มพร้อม data sync
./docker-deploy.sh --type data-sync --sync-data
```

### Production

```bash
# เริ่ม production
docker-compose -f docker-compose.prod.yml up -d

# เริ่มพร้อม admin tools
docker-compose -f docker-compose.prod.yml --profile admin up -d

# เริ่มพร้อม backup
docker-compose -f docker-compose.prod.yml --profile backup up -d
```

## 🌐 URLs

### Development
- **Main App:** http://localhost:8080
- **pgAdmin:** http://localhost:8081

### Production
- **Main App:** http://localhost:80 (หรือ port ที่กำหนด)
- **pgAdmin:** http://localhost:8081 (ถ้าเปิด profile admin)

## 📊 Monitoring

### ดูสถานะ containers
```bash
docker-compose ps
```

### ดู logs
```bash
# ทั้งหมด
docker-compose logs

# เฉพาะ app
docker-compose logs app

# เฉพาะ database
docker-compose logs postgres

# Follow logs
docker-compose logs -f app
```

### เข้า container
```bash
# เข้า app container
docker-compose exec app sh

# เข้า database
docker-compose exec postgres psql -U postgres -d internship_system_dev
```

## 🔄 Data Management

### Backup Database
```bash
# Manual backup
docker-compose exec app npx tsx scripts/export-data.ts

# Auto backup (production)
docker-compose -f docker-compose.prod.yml --profile backup up -d
```

### Restore Database
```bash
# Import data
docker-compose exec app npx tsx scripts/import-data.ts

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

## 🛠️ Troubleshooting

### ปัญหาที่พบบ่อย

1. **Port already in use**
   ```bash
   # เปลี่ยน port ใน docker-compose.yml
   ports:
     - "8081:8080"  # เปลี่ยน 8080 เป็น 8081
   ```

2. **Database connection failed**
   ```bash
   # ตรวจสอบ database
   docker-compose logs postgres
   
   # รอให้ database ready
   docker-compose exec postgres pg_isready -U postgres
   ```

3. **App not starting**
   ```bash
   # ดู logs
   docker-compose logs app
   
   # Rebuild image
   docker-compose build --no-cache app
   ```

### Health Checks

```bash
# ตรวจสอบ app health
curl http://localhost:8080/api/health

# ตรวจสอบ database
docker-compose exec postgres pg_isready -U postgres
```

## 🔒 Security

### Environment Variables
```bash
# Copy template
cp docker.env.example .env

# แก้ไขค่าต่างๆ
nano .env
```

### SSL/HTTPS
```bash
# ใส่ SSL certificates ใน ssl/ folder
mkdir ssl
# ใส่ cert.pem และ key.pem

# เปิด HTTPS ใน nginx.conf
```

## 📈 Scaling

### Horizontal Scaling
```bash
# เพิ่ม app instances
docker-compose up -d --scale app=3
```

### Resource Limits
```yaml
# ใน docker-compose.prod.yml
deploy:
  resources:
    limits:
      memory: 2G
      cpus: '1.0'
```

## 🎯 Benefits

1. **Consistent Environment** - ทำงานเหมือนกันทุกที่
2. **Easy Deployment** - deploy ได้ง่าย
3. **Isolation** - แยก environment แต่ละส่วน
4. **Scalability** - ขยายได้ง่าย
5. **Backup & Recovery** - สำรองข้อมูลอัตโนมัติ
6. **Monitoring** - ตรวจสอบสถานะได้ง่าย

## 🚨 Important Notes

1. **Data Persistence** - ข้อมูลเก็บใน volumes
2. **Environment Variables** - ใช้ .env file
3. **Health Checks** - ตรวจสอบสถานะ service
4. **Backup Strategy** - สำรองข้อมูลเป็นประจำ
5. **Security** - ใช้ strong passwords

## 📞 Support

หากมีปัญหาการใช้งาน Docker:

1. ตรวจสอบ logs: `docker-compose logs`
2. ตรวจสอบ status: `docker-compose ps`
3. ดู health checks: `docker-compose exec app curl localhost:8080/api/health`
4. Rebuild: `docker-compose build --no-cache`
