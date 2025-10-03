# การตั้งค่า Local Development Environment

## 🎯 Overview
คู่มือนี้จะช่วยคุณตั้งค่าฐานข้อมูลในเครื่องสำหรับ development แทนการใช้ Vercel Postgres

## 🚀 Quick Start

### วิธีที่ 1: ใช้ Setup Script (แนะนำ)

#### สำหรับ macOS/Linux:
```bash
npm run setup:local
```

#### สำหรับ Windows:
```bash
npm run setup:local:win
```

### วิธีที่ 2: Manual Setup

#### 1. ติดตั้ง PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows:**
- ดาวน์โหลดจาก: https://www.postgresql.org/download/windows/
- หรือใช้ Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15`

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### 2. สร้าง Database
```bash
createdb internship_system_dev
```

#### 3. ตั้งค่า Environment
```bash
cp .env .env.local
# แก้ไข DATABASE_URL ใน .env.local
```

#### 4. รัน Prisma Commands
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

## 📁 File Structure

```
├── .env                 # Template (committed)
├── .env.local          # Local config (not committed)
├── .env.example        # Example config
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.ts         # Seed data
└── scripts/
    ├── setup-local-db.sh    # Setup script (macOS/Linux)
    └── setup-local-db.ps1   # Setup script (Windows)
```

## 🔧 Environment Variables

### .env.local (Local Development)
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/internship_system_dev"
NEXTAUTH_SECRET="your-local-secret"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### Production/Vercel
```bash
DATABASE_URL="your-vercel-postgres-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
NODE_ENV="production"
```

## 📋 Available Commands

### Development
```bash
npm run dev:local        # Start dev server with local env
npm run db:local         # Open Prisma Studio for local DB
```

### Database Management
```bash
npm run db:push          # Push schema changes
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database
```

### PostgreSQL Management
```bash
npm run postgres:start   # Start PostgreSQL (Docker)
npm run postgres:stop    # Stop PostgreSQL (Docker)
npm run postgres:logs    # View PostgreSQL logs
```

### Migration
```bash
npm run migrate:backup   # Backup current data
npm run migrate:run      # Run migration
npm run migrate:full     # Backup + migrate
```

## 🔍 Troubleshooting

### ปัญหาที่พบบ่อย

#### 1. PostgreSQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**แก้ไข:**
- ตรวจสอบว่า PostgreSQL service รันอยู่
- macOS: `brew services start postgresql@15`
- Windows: เปิด Services และ start PostgreSQL

#### 2. Database Does Not Exist
```
Error: database "internship_system_dev" does not exist
```
**แก้ไข:**
```bash
createdb internship_system_dev
```

#### 3. Authentication Failed
```
Error: password authentication failed for user "postgres"
```
**แก้ไข:**
- ตั้งรหัสผ่านสำหรับ user postgres
- หรือแก้ไข DATABASE_URL ใน .env.local

#### 4. Permission Denied
```
Error: permission denied for database
```
**แก้ไข:**
```sql
GRANT ALL PRIVILEGES ON DATABASE internship_system_dev TO postgres;
```

### การตรวจสอบสถานะ

#### ตรวจสอบ PostgreSQL Service
```bash
# macOS
brew services list | grep postgresql

# Windows
Get-Service postgresql*

# Linux
sudo systemctl status postgresql
```

#### ตรวจสอบ Database Connection
```bash
psql -d internship_system_dev -c "SELECT version();"
```

#### ตรวจสอบ Tables
```bash
psql -d internship_system_dev -c "\dt"
```

## 🔄 Switching Between Environments

### ใช้ Local Database
```bash
# ใช้ .env.local
npm run dev:local
```

### ใช้ Vercel Database
```bash
# ใช้ .env หรือ environment variables
npm run dev
```

## 📊 Database Management Tools

### 1. Prisma Studio (แนะนำ)
```bash
npm run db:studio
# เปิดที่ http://localhost:5555
```

### 2. pgAdmin (สำหรับ PostgreSQL)
```bash
npm run pgadmin:start
# เปิดที่ http://localhost:8080
# Email: admin@example.com
# Password: admin
```

### 3. Command Line
```bash
# เข้าสู่ PostgreSQL
psql -d internship_system_dev

# คำสั่งที่มีประโยชน์
\l          # ดู databases
\dt         # ดู tables
\d users    # ดู schema ของ table users
\q          # ออก
```

## 🚀 Performance Tips

### 1. Database Indexing
- Prisma จะสร้าง indexes อัตโนมัติสำหรับ relations
- เพิ่ม custom indexes ใน schema.prisma ถ้าจำเป็น

### 2. Connection Pooling
```javascript
// prisma/client.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 3. Query Optimization
- ใช้ `select` เพื่อเลือกเฉพาะ fields ที่ต้องการ
- ใช้ `include` อย่างระมัดระวัง
- ใช้ pagination สำหรับข้อมูลจำนวนมาก

## 📈 Monitoring

### Database Size
```sql
SELECT pg_size_pretty(pg_database_size('internship_system_dev'));
```

### Table Sizes
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Active Connections
```sql
SELECT count(*) FROM pg_stat_activity;
```

## 🔐 Security Best Practices

1. **ไม่ commit .env.local** - มี sensitive data
2. **ใช้ strong passwords** - สำหรับ production
3. **จำกัด database access** - เฉพาะ IP ที่จำเป็น
4. **Regular backups** - สำหรับ production data
5. **Monitor logs** - ตรวจสอบ suspicious activities

## 📞 Support

หากมีปัญหา:
1. ตรวจสอบ logs: `npm run postgres:logs`
2. ดู Prisma docs: https://www.prisma.io/docs
3. ตรวจสอบ PostgreSQL docs: https://www.postgresql.org/docs/