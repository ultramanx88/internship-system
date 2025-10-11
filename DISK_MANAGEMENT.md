# 🧹 Disk Space Management Guide

## 📊 สาเหตุที่ Disk ใช้เยอะ

### ก่อนทำความสะอาด:
- **Total:** 2.3GB
- **`node_modules`:** 1.4GB (dependencies)
- **`.next`:** 676MB (build files)
- **`.git`:** 270MB (git history)
- **อื่นๆ:** ~100MB

### หลังทำความสะอาด:
- **Total:** 1.6GB
- **ประหยัดได้:** 700MB (30%)

## 🛠️ Script สำหรับจัดการ Disk Space

### `disk-cleanup.sh` - จัดการ disk space

```bash
# ดูการใช้ disk ปัจจุบัน
./disk-cleanup.sh show

# ลบไฟล์ build (.next, tsconfig.tsbuildinfo)
./disk-cleanup.sh build

# ลบไฟล์ log เก่า
./disk-cleanup.sh logs

# ลบไฟล์ backup เก่า
./disk-cleanup.sh backups

# ลบไฟล์ชั่วคราว
./disk-cleanup.sh temp

# ลบ node_modules (จะต้อง npm install ใหม่)
./disk-cleanup.sh node

# ทำความสะอาด git history
./disk-cleanup.sh git

# ทำความสะอาดทั้งหมด
./disk-cleanup.sh all
```

## 💡 คำแนะนำการประหยัด Disk Space

### 1. **ไฟล์ที่ลบได้เสมอ:**
- ✅ `.next` - Build files (สร้างใหม่ได้ด้วย `npm run build`)
- ✅ `tsconfig.tsbuildinfo` - TypeScript build cache
- ✅ ไฟล์ `.tmp`, `.temp`
- ✅ `.DS_Store`, `Thumbs.db`

### 2. **ไฟล์ที่ลบได้แต่ต้องระวัง:**
- ⚠️ `node_modules` - ต้อง `npm install` ใหม่
- ⚠️ `.git` - จะสูญเสีย git history
- ⚠️ `logs` - ไฟล์ log เก่า
- ⚠️ `backups` - ไฟล์ backup เก่า

### 3. **ไฟล์ที่ไม่ควรลบ:**
- ❌ `src` - Source code
- ❌ `public` - Static files
- ❌ `prisma` - Database schema
- ❌ `package.json` - Dependencies

## 🔄 การใช้งานประจำ

### ก่อน Deploy:
```bash
# ทำความสะอาดไฟล์ build
./disk-cleanup.sh build
```

### หลัง Deploy:
```bash
# ทำความสะอาดไฟล์ชั่วคราว
./disk-cleanup.sh temp
```

### สัปดาห์ละครั้ง:
```bash
# ทำความสะอาดไฟล์ log และ backup เก่า
./disk-cleanup.sh logs
./disk-cleanup.sh backups
```

## 📈 ผลลัพธ์

### ก่อนทำความสะอาด:
```
2.3G    .
├── 1.4G    node_modules
├── 676M    .next
├── 270M    .git
└── ~100M   อื่นๆ
```

### หลังทำความสะอาด:
```
1.6G    .
├── 1.4G    node_modules
├── 270M    .git
└── ~100M   อื่นๆ
```

**ประหยัดได้ 700MB (30%)**

## 🎯 สรุป

**Disk ใช้เยอะเพราะ:**
1. **`node_modules`** - 1.4GB (จำเป็น)
2. **`.next`** - 676MB (ลบได้)
3. **`.git`** - 270MB (ลบได้ถ้าต้องการ)

**วิธีประหยัด:**
- ใช้ `./disk-cleanup.sh build` ก่อน deploy
- ใช้ `./disk-cleanup.sh temp` เป็นประจำ
- ลบ `node_modules` ถ้าไม่ต้องการ (ต้อง `npm install` ใหม่)

**ตอนนี้ประหยัดได้ 700MB แล้ว!** 🎉
