# Schema Backup และ Restore Instructions

## วันที่ Backup: 2025-10-10 09:28:32

## ไฟล์ที่ Backup:
1. `migrations/` - โฟลเดอร์ migrations ทั้งหมด
2. `schema.prisma.backup` - Schema file เก่า
3. `current-db-schema.sql` - Schema ปัจจุบันจาก database
4. `database-backup.sql` - ข้อมูลทั้งหมดใน database
5. `seed-data.sql` - Seed data (ถ้ามี)

## วิธี Restore:

### 1. Restore Database:
```bash
# ลบ database เก่า (ถ้าต้องการ)
dropdb internship_system_prod

# สร้าง database ใหม่
createdb internship_system_prod

# Restore ข้อมูล
psql -h localhost -U macbookpro -d internship_system_prod < database-backup.sql
```

### 2. Restore Schema:
```bash
# คัดลอก migrations กลับ
cp -r ./backups/schema-backup-20251010-092832/migrations ./prisma/

# คัดลอก schema กลับ (ถ้าต้องการ)
cp ./backups/schema-backup-20251010-092832/schema.prisma.backup ./prisma/schema.prisma

# Generate Prisma Client
npx prisma generate
```

### 3. ตรวจสอบ:
```bash
npx prisma migrate status
npx prisma db push
```

## หมายเหตุ:
- ไฟล์นี้เป็น backup ก่อนทำการ clean schema
- หากต้องการกลับไปใช้ schema เก่า ให้ทำตามขั้นตอนข้างต้น
- ข้อมูลทั้งหมดจะถูก restore กลับมา
