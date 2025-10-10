# การติดตั้งและตั้งค่า PostgreSQL

## วิธีที่ 1: ใช้ Homebrew (แนะนำสำหรับ macOS)

### 1. ติดตั้ง PostgreSQL

```bash
# ติดตั้ง PostgreSQL
brew install postgresql@15

# เริ่มต้น PostgreSQL service
brew services start postgresql@15

# ตรวจสอบการติดตั้ง
psql --version
```

### 2. สร้าง Database

```bash
# เข้าสู่ PostgreSQL
psql postgres

# สร้าง database
CREATE DATABASE internship_system_dev;

# สร้าง user (optional)
CREATE USER internship_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE internship_system_dev TO internship_user;

# ออกจาก psql
\q
```

### 3. ทดสอบการเชื่อมต่อ

```bash
psql -d internship_system_dev -U postgres
```

## วิธีที่ 2: ใช้ Docker (แนะนำสำหรับ Development)

### 1. ติดตั้ง Docker Desktop

- ดาวน์โหลดจาก: https://www.docker.com/products/docker-desktop/
- ติดตั้งและเปิด Docker Desktop

### 2. รัน PostgreSQL ด้วย Docker

```bash
# รัน PostgreSQL container
npm run postgres:start

# หรือรันด้วย docker-compose โดยตรง
docker-compose up -d postgres

# ตรวจสอบสถานะ
docker-compose ps

# ดู logs
npm run postgres:logs
```

### 3. เข้าถึง PostgreSQL

```bash
# เข้าสู่ PostgreSQL container
docker exec -it internship_postgres psql -U postgres -d internship_system_dev
```

## วิธีที่ 3: ใช้ PostgreSQL.app (GUI สำหรับ macOS)

### 1. ดาวน์โหลดและติดตั้ง

- ดาวน์โหลดจาก: https://postgresapp.com/
- ลากไปที่ Applications folder
- เปิดแอป และคลิก "Initialize"

### 2. ตั้งค่า PATH

```bash
echo 'export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## การตั้งค่าโปรเจค

### 1. อัปเดต Environment Variables

**สำหรับ Local Development:**
```bash
# แก้ไขไฟล์ .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/internship_system_dev?schema=public"
```

**สำหรับ Docker Compose:**
```bash
# ใช้กับ docker-compose.yml
DATABASE_URL="postgresql://postgres:password@postgres:5432/internship_system_dev?schema=public"
```

**สำหรับ VPS/Production:**
```bash
# แก้ไขไฟล์ .env บน VPS
DATABASE_URL="postgresql://username:password@your-vps-ip:5432/internship_system_prod?schema=public"
```

**หมายเหตุ:** ระบบนี้ใช้ PostgreSQL เท่านั้น ไม่รองรับ SQLite อีกต่อไป

### 2. รัน Prisma Migration

```bash
# Generate Prisma client
npx prisma generate

# รัน migration
npx prisma db push

# หรือสร้าง migration ใหม่
npx prisma migrate dev --name init

# Seed ข้อมูล
npm run db:seed
```

### 3. ทดสอบการเชื่อมต่อ

```bash
# เปิด Prisma Studio
npm run db:studio

# รันการทดสอบ
npx tsx test-crud-unit.js
```

## การจัดการ PostgreSQL

### คำสั่งที่มีประโยชน์

```bash
# เริ่ม/หยุด PostgreSQL (Homebrew)
brew services start postgresql@15
brew services stop postgresql@15
brew services restart postgresql@15

# เริ่ม/หยุด PostgreSQL (Docker)
npm run postgres:start
npm run postgres:stop

# ดู logs
npm run postgres:logs

# เข้าสู่ database
psql -d internship_system_dev -U postgres

# Backup database
pg_dump -U postgres internship_system_dev > backup.sql

# Restore database
psql -U postgres internship_system_dev < backup.sql
```

### PostgreSQL Commands

```sql
-- ดู databases ทั้งหมด
\l

-- เชื่อมต่อ database
\c database_name

-- ดู tables ทั้งหมด
\dt

-- ดู schema ของ table
\d table_name

-- ออกจาก psql
\q
```

## Troubleshooting

### ปัญหาที่พบบ่อย

1. **Connection refused**

   - ตรวจสอบว่า PostgreSQL service รันอยู่
   - ตรวจสอบ port 5432

2. **Authentication failed**

   - ตรวจสอบ username/password ใน DATABASE_URL
   - ตรวจสอบ pg_hba.conf

3. **Database does not exist**

   - สร้าง database ด้วย `CREATE DATABASE database_name;`

4. **Permission denied**
   - ตรวจสอบ user permissions
   - ใช้ `GRANT ALL PRIVILEGES ON DATABASE database_name TO username;`

## การตั้งค่า PostgreSQL

### 1. การติดตั้ง PostgreSQL

```bash
# ใช้ Prisma Studio หรือ SQL commands
npx prisma studio
```

### 2. เปลี่ยน provider ใน schema.prisma

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3. รัน migration ใหม่

```bash
npx prisma db push
npm run db:seed
```

## Production Setup

### สำหรับ VPS/Server

```bash
# ติดตั้ง PostgreSQL บน Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# สร้าง database และ user
sudo -u postgres createdb internship_system_prod
sudo -u postgres createuser --interactive

# ตั้งค่า firewall
sudo ufw allow 5432/tcp
```

### Environment Variables สำหรับ Production

**สำหรับ VPS/Server:**
```bash
# ไฟล์ .env บน VPS
DATABASE_URL="postgresql://username:password@localhost:5432/internship_system_prod?schema=public"
NODE_ENV="production"
```

**สำหรับ Docker Production:**
```bash
# ใช้กับ docker-compose.prod.yml
DATABASE_URL="postgresql://postgres:your_secure_password@postgres:5432/internship_system_prod?schema=public"
NODE_ENV="production"
```

**หมายเหตุ:** ระบบใช้ PostgreSQL เท่านั้น ไม่รองรับ SQLite
