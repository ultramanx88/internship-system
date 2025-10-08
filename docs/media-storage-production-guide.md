# Media Storage Production Guide

## ภาพรวมระบบการจัดการไฟล์มีเดีย

ระบบการจัดการไฟล์มีเดียในระดับ Production ถูกออกแบบมาเพื่อรองรับการเก็บไฟล์หลายประเภทสำหรับผู้ใช้แต่ละคน:

### ประเภทไฟล์ที่รองรับ
1. **รูปโปรไฟล์** - 1 รูปต่อผู้ใช้ (replace เมื่ออัปโหลดใหม่)
2. **รูปฝึกงาน** - 2 รูปต่อผู้ใช้ (internship_1 และ internship_2)
3. **เอกสาร** - เอกสารต่างๆ ตาม DocumentType

## โครงสร้างการเก็บไฟล์

```
public/uploads/
├── profiles/           # รูปโปรไฟล์
│   └── {year}/
│       └── {month}/
│           └── {userId}/
│               └── profile_{userId}_{timestamp}.{ext}
├── internships/        # รูปฝึกงาน
│   └── {year}/
│       └── {month}/
│           └── {userId}/
│               ├── internship_1_{userId}_{timestamp}.{ext}
│               └── internship_2_{userId}_{timestamp}.{ext}
└── documents/          # เอกสารอื่นๆ
    └── {year}/
        └── {month}/
            └── {userId}/
                └── {documentType}_{userId}_{timestamp}.{ext}
```

## Database Schema

### User Model Fields
```prisma
model User {
  // ... existing fields
  profileImage    String?  // รูปโปรไฟล์
  internshipPhoto1 String? // รูปฝึกงานรูปที่ 1
  internshipPhoto2 String? // รูปฝึกงานรูปที่ 2
  // ... other fields
}
```

## API Endpoints

### 1. อัปโหลดไฟล์
```
POST /api/upload
```

**Parameters:**
- `file`: ไฟล์ที่ต้องการอัปโหลด
- `userId`: ID ของผู้ใช้
- `type`: ประเภทไฟล์ (`profile`, `internship`, `document`)
- `photoNumber`: หมายเลขรูป (สำหรับ internship: 1 หรือ 2)

**Response:**
```json
{
  "success": true,
  "url": "/uploads/profiles/2024/10/user123/profile_user123_1696234567890.jpg",
  "message": "อัปโหลดไฟล์สำเร็จ"
}
```

### 2. ลบไฟล์มีเดียของผู้ใช้ทั้งหมด
```
DELETE /api/upload/user-media
```

**Body:**
```json
{
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "ลบไฟล์มีเดียของผู้ใช้สำเร็จ (5 ไฟล์, 3 โฟลเดอร์)",
  "deletedFiles": 5,
  "deletedFolders": 3
}
```

## การใช้งาน FileStorageService

### อัปโหลดรูปโปรไฟล์
```typescript
import { FileStorageService } from '@/lib/file-storage';

const result = await FileStorageService.uploadProfileImage(file, userId);
if (result.success) {
  console.log('Profile image uploaded:', result.url);
}
```

### อัปโหลดรูปฝึกงาน
```typescript
// รูปฝึกงานรูปที่ 1
const result1 = await FileStorageService.uploadInternshipPhoto(file, userId, 1);

// รูปฝึกงานรูปที่ 2
const result2 = await FileStorageService.uploadInternshipPhoto(file, userId, 2);
```

### ลบไฟล์มีเดียทั้งหมดของผู้ใช้
```typescript
const success = await FileStorageService.deleteUserMedia(userId);
if (success) {
  console.log('User media deleted successfully');
}
```

## การจัดการในระดับ Production

### 1. การสร้างโฟลเดอร์อัตโนมัติ
- ระบบจะสร้างโฟลเดอร์อัตโนมัติเมื่อผู้ใช้เริ่มอัปโหลดไฟล์ครั้งแรก
- โครงสร้าง: `/uploads/{type}/{year}/{month}/{userId}/`

### 2. การลบไฟล์เมื่อลบผู้ใช้
- เมื่อลบผู้ใช้ ระบบจะลบโฟลเดอร์และไฟล์ทั้งหมดของผู้ใช้
- รวมถึงรูปโปรไฟล์, รูปฝึกงาน, และเอกสารทั้งหมด
- ลบโฟลเดอร์ปี/เดือนถ้าไม่มีไฟล์อื่น

### 3. การจัดการ Duplicate Files
- ระบบตรวจสอบไฟล์ซ้ำโดยใช้ file hash
- ถ้าไฟล์เดียวกันจะใช้ไฟล์เดิมแทนการอัปโหลดใหม่

### 4. การ Cleanup ไฟล์เก่า
- สำหรับรูปโปรไฟล์: เก็บเฉพาะ 2 รูปล่าสุด
- สำหรับรูปฝึกงาน: เก็บเฉพาะ 2 รูปตามที่กำหนด

## การ Migration

### รัน Migration Script
```bash
# รัน migration เพื่อเพิ่มฟิลด์ใหม่
npx tsx scripts/migrate-user-media-fields.ts

# หรือใช้ Prisma migrate
npx prisma migrate dev --name add_internship_photos
```

## ข้อกำหนดไฟล์

### รูปภาพ
- **ขนาดสูงสุด**: 2MB
- **ประเภทที่รองรับ**: JPG, PNG, WebP
- **การตั้งชื่อ**: `{type}_{userId}_{timestamp}.{ext}`

### เอกสาร
- **ขนาดสูงสุด**: 10MB (สามารถปรับได้)
- **ประเภทที่รองรับ**: PDF, DOC, DOCX, XLS, XLSX

## การ Monitor และ Maintenance

### 1. การตรวจสอบพื้นที่เก็บข้อมูล
```bash
# ตรวจสอบขนาดโฟลเดอร์ uploads
du -sh public/uploads/

# ตรวจสอบจำนวนไฟล์
find public/uploads/ -type f | wc -l
```

### 2. การ Cleanup ไฟล์เก่า
- ตั้ง cron job สำหรับลบไฟล์ที่ไม่ได้ใช้
- ตรวจสอบไฟล์ที่ไม่มีในฐานข้อมูล

### 3. การ Backup
- Backup ไฟล์สำคัญก่อนการ cleanup
- ใช้ cloud storage สำหรับ backup

## Security Considerations

### 1. การตรวจสอบไฟล์
- ตรวจสอบ MIME type
- ตรวจสอบ file signature
- จำกัดขนาดไฟล์

### 2. การป้องกัน Path Traversal
- ใช้ path.join() แทนการต่อ string
- ตรวจสอบ path ที่ปลอดภัย

### 3. การตั้งค่า Permissions
- ตั้งค่าโฟลเดอร์ uploads ให้อ่านได้เท่านั้น
- ไม่อนุญาตให้ execute ไฟล์ในโฟลเดอร์ uploads

## Troubleshooting

### ปัญหาที่พบบ่อย

1. **ไฟล์อัปโหลดไม่ได้**
   - ตรวจสอบขนาดไฟล์
   - ตรวจสอบประเภทไฟล์
   - ตรวจสอบ permissions

2. **ไฟล์ไม่แสดง**
   - ตรวจสอบ path ในฐานข้อมูล
   - ตรวจสอบการตั้งค่า static files
   - ตรวจสอบ permissions

3. **การลบไฟล์ไม่สำเร็จ**
   - ตรวจสอบ permissions
   - ตรวจสอบว่าไฟล์ยังถูกใช้งานอยู่หรือไม่

### การ Debug
```typescript
// เปิด debug mode
console.log('File path:', fullPath);
console.log('Directory exists:', existsSync(dir));
console.log('File exists:', existsSync(fullPath));
```
