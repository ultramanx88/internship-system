# 🚀 คู่มือการ Deploy แบบต่างๆ

## 📋 **ตัวเลือกการ Deploy**

### 1. 🔄 **Code Only Deploy** (`code-only-deploy.sh`)
**ใช้เมื่อ:** ต้องการอัปเดตโค้ดเท่านั้น ไม่แตะฐานข้อมูล

```bash
./code-only-deploy.sh
```

**ฟีเจอร์:**
- ✅ อัปเดตโค้ดเท่านั้น
- ✅ เก็บฐานข้อมูลไว้
- ✅ รัน migration เฉพาะ schema
- ✅ เร็วและปลอดภัย

---

### 2. 📥 **Pull Database from VPS** (`pull-database-from-vps.sh`)
**ใช้เมื่อ:** ต้องการดึงข้อมูลจาก VPS มาที่ Local

```bash
./pull-database-from-vps.sh
```

**ฟีเจอร์:**
- ✅ ดึงข้อมูลทั้งหมดจาก VPS
- ✅ สร้าง backup อัตโนมัติ
- ✅ ตัวเลือก restore ไปยัง Local
- ✅ เก็บไฟล์ backup ไว้

---

### 3. 🔄 **Sync Specific Tables** (`sync-specific-tables.sh`)
**ใช้เมื่อ:** ต้องการ sync เฉพาะตารางที่ต้องการ

```bash
./sync-specific-tables.sh
```

**ฟีเจอร์:**
- ✅ เลือกตารางที่ต้องการ sync
- ✅ Sync ได้ทั้ง 2 ทิศทาง
- ✅ ปลอดภัยกว่า sync ทั้งหมด
- ✅ เร็วและมีประสิทธิภาพ

---

### 4. 🔄 **Incremental Deploy** (`incremental-deploy.sh`)
**ใช้เมื่อ:** ต้องการ deploy เฉพาะไฟล์ที่เปลี่ยน

```bash
./incremental-deploy.sh
```

**ฟีเจอร์:**
- ✅ Deploy เฉพาะไฟล์ที่เปลี่ยน
- ✅ ตรวจสอบ git hash
- ✅ เร็วที่สุด
- ✅ ประหยัด bandwidth

---

## 🎯 **คำแนะนำการใช้งาน**

### **สำหรับการพัฒนาปกติ:**
```bash
# 1. เปลี่ยนโค้ด
# 2. Deploy เฉพาะโค้ด
./code-only-deploy.sh
```

### **สำหรับการ sync ข้อมูล:**
```bash
# 1. ดึงข้อมูลจาก VPS
./pull-database-from-vps.sh

# 2. หรือ sync เฉพาะตารางที่ต้องการ
./sync-specific-tables.sh
```

### **สำหรับการ deploy เร็ว:**
```bash
# Deploy เฉพาะไฟล์ที่เปลี่ยน
./incremental-deploy.sh
```

---

## ⚠️ **ข้อควรระวัง**

### **Code Only Deploy:**
- ✅ ปลอดภัยสำหรับฐานข้อมูล
- ⚠️ ต้องรัน migration แยกหากมี schema changes

### **Database Sync:**
- ⚠️ อาจทับข้อมูล Local
- ✅ ควร backup ก่อน sync
- ⚠️ ตรวจสอบข้อมูลก่อน sync

### **Incremental Deploy:**
- ✅ เร็วที่สุด
- ⚠️ อาจ miss ไฟล์ที่สำคัญ
- ✅ ใช้ได้เมื่อแน่ใจว่าไฟล์ที่เปลี่ยนครบ

---

## 🔧 **การตั้งค่า**

### **Server Configuration:**
```bash
SERVER_IP="203.170.129.199"
SERVER_USER="root"
SERVER_PASSWORD="rp4QkUUvmbi5qB"
SERVER_PATH="/var/www/internship-system"
```

### **Local Configuration:**
- ต้องมี `sshpass` ติดตั้งไว้
- ต้องมี Docker ทำงานอยู่
- ต้องมี Git repository

---

## 📊 **เปรียบเทียบตัวเลือก**

| ตัวเลือก | ความเร็ว | ความปลอดภัย | ความสะดวก | ใช้เมื่อ |
|---------|---------|------------|----------|---------|
| Code Only | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | อัปเดตโค้ด |
| Pull DB | ⭐⭐ | ⭐⭐ | ⭐⭐ | ดึงข้อมูลจาก VPS |
| Sync Tables | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | Sync เฉพาะตาราง |
| Incremental | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | Deploy เร็ว |

---

## 🚨 **Emergency Procedures**

### **Rollback Code:**
```bash
# 1. ดู git log
git log --oneline

# 2. Reset ไปยัง commit ก่อนหน้า
git reset --hard HEAD~1

# 3. Deploy ใหม่
./code-only-deploy.sh
```

### **Restore Database:**
```bash
# 1. ดู backup files
ls -la backups/

# 2. Restore จาก backup
docker exec -i internship-system-postgres-1 psql -U postgres < backups/backup-file.sql
```

---

## 📞 **การแก้ไขปัญหา**

### **Build Failed:**
```bash
# 1. ตรวจสอบ dependencies
npm install

# 2. ลบ .next และ build ใหม่
rm -rf .next
npm run build:prod
```

### **Upload Failed:**
```bash
# 1. ตรวจสอบการเชื่อมต่อ
ping 203.170.129.199

# 2. ตรวจสอบ sshpass
which sshpass
```

### **Database Connection Failed:**
```bash
# 1. ตรวจสอบ Docker containers
docker ps

# 2. Restart database
docker-compose restart postgres
```

---

## 🎉 **สรุป**

เลือกใช้สคริปต์ตามความต้องการ:

- **Code Only**: สำหรับการพัฒนาปกติ
- **Pull DB**: สำหรับดึงข้อมูลจาก VPS
- **Sync Tables**: สำหรับ sync เฉพาะตาราง
- **Incremental**: สำหรับ deploy เร็ว

**ทุกสคริปต์มี safety checks และ error handling ครบถ้วน!** 🚀
