# ระบบจัดการระบบ (System Management Guide)

## ภาพรวม

ระบบจัดการระบบนี้ประกอบด้วย 3 ฟีเจอร์หลัก:

1. **ระบบ Log 90 วัน** - เก็บและจัดการ Log ระบบอัตโนมัติ
2. **PDPA Compliance** - การปกป้องข้อมูลส่วนบุคคลตามกฎหมาย PDPA
3. **Backup & Restore** - ระบบสำรองข้อมูลและกู้คืนข้อมูล

## 1. ระบบ Log 90 วัน

### ฟีเจอร์หลัก
- เก็บ Log ระบบและ Audit Log อัตโนมัติ
- กำหนดนโยบายการเก็บ Log ได้ (ค่าเริ่มต้น 90 วัน)
- ลบ Log เก่าอัตโนมัติตามนโยบาย
- ดู Log แบบ Real-time พร้อมตัวกรอง
- Export Log เป็น JSON

### การใช้งาน
1. เข้าไปที่ `/admin/system-management`
2. เลือกแท็บ "ระบบ Log"
3. ใช้ตัวกรองเพื่อค้นหา Log ที่ต้องการ
4. คลิกที่ Log เพื่อดูรายละเอียด
5. ใช้ปุ่ม Export เพื่อดาวน์โหลด Log

### API Endpoints
- `GET /api/admin/logs` - ดึงรายการ Log
- `DELETE /api/admin/logs` - ลบ Log เก่า
- `GET /api/admin/logs/retention` - ดูนโยบายการเก็บ Log
- `PUT /api/admin/logs/retention` - แก้ไขนโยบายการเก็บ Log

### การตั้งค่า
```typescript
// เปลี่ยนนโยบายการเก็บ Log
await enhancedLogger.updateRetentionPolicy('system_logs', 30); // เก็บ 30 วัน
```

## 2. PDPA Compliance

### ฟีเจอร์หลัก
- จัดการความยินยอมของผู้ใช้
- ปกปิดข้อมูลส่วนบุคคลอัตโนมัติ
- สถิติการให้ความยินยอม
- กฎการปกปิดข้อมูลที่ปรับแต่งได้

### ประเภทความยินยอม
- **data_collection** - การเก็บรวบรวมข้อมูล
- **data_processing** - การประมวลผลข้อมูล
- **data_sharing** - การแชร์ข้อมูล
- **marketing** - การตลาด

### การปกปิดข้อมูล
- **MASK** - ปกปิดด้วยรูปแบบที่กำหนด
- **HASH** - แฮชข้อมูล
- **REMOVE** - ลบข้อมูล
- **PSEUDONYMIZE** - ใช้ชื่อปลอม

### การใช้งาน
1. เข้าไปที่ `/admin/system-management`
2. เลือกแท็บ "PDPA"
3. ดู/จัดการความยินยอมของผู้ใช้
4. ตั้งค่ากฎการปกปิดข้อมูล
5. ดูสถิติการให้ความยินยอม

### API Endpoints
- `GET /api/admin/pdpa/consent` - ดูความยินยอม
- `POST /api/admin/pdpa/consent` - บันทึกความยินยอม
- `DELETE /api/admin/pdpa/consent` - ถอนความยินยอม
- `GET /api/admin/pdpa/anonymization` - ดูกฎการปกปิด
- `POST /api/admin/pdpa/anonymization` - สร้างกฎการปกปิด

## 3. Backup & Restore

### ฟีเจอร์หลัก
- สร้าง Backup แบบต่างๆ (เต็ม, ข้อมูล, โครงสร้าง)
- Restore ข้อมูลจาก Backup
- สำรองข้อมูลอัตโนมัติทุกวัน
- จัดการไฟล์ Backup
- รวมไฟล์สื่อและ Log ใน Backup

### ประเภท Backup
- **FULL** - ข้อมูล + โครงสร้าง + ไฟล์สื่อ
- **DATA_ONLY** - ข้อมูลเท่านั้น
- **SCHEMA_ONLY** - โครงสร้างเท่านั้น
- **INCREMENTAL** - เพิ่มเติมจาก Backup ก่อนหน้า

### การใช้งาน
1. เข้าไปที่ `/admin/system-management`
2. เลือกแท็บ "Backup & Restore"
3. คลิก "สร้าง Backup" เพื่อสร้าง Backup ใหม่
4. เลือกประเภทและตัวเลือก Backup
5. ใช้ปุ่ม Restore เพื่อกู้คืนข้อมูล

### API Endpoints
- `GET /api/admin/backup` - ดูรายการ Backup
- `POST /api/admin/backup` - สร้าง Backup
- `GET /api/admin/backup/[id]` - ดูรายละเอียด Backup
- `DELETE /api/admin/backup/[id]` - ลบ Backup
- `POST /api/admin/backup/restore` - Restore ข้อมูล

## การติดตั้งและตั้งค่า

### 1. รัน Migration
```bash
npm run db:migrate
```

### 2. ตั้งค่า PDPA
```bash
npm run pdpa:init
```

### 3. สร้าง Backup แรก
```bash
npm run backup:create
```

### 4. ตั้งค่า Cron Job (สำหรับการลบ Log อัตโนมัติ)
```bash
# เพิ่มใน crontab
0 2 * * * cd /path/to/project && npm run logs:cleanup
```

## การใช้งานในโค้ด

### การ Log
```typescript
import { enhancedLogger } from '@/lib/enhanced-logger';

// Log ข้อความ
await enhancedLogger.info('User logged in', { userId: '123' });

// Log Error
await enhancedLogger.error('Database connection failed', { 
  error: error.message,
  stack: error.stack 
});

// Log API Request
await enhancedLogger.logApiRequest(request, response, duration, userId);

// Audit Log
await enhancedLogger.audit({
  action: 'CREATE',
  entityType: 'User',
  entityId: '123',
  newValues: { name: 'John Doe' },
  userId: 'admin123'
});
```

### การจัดการ PDPA
```typescript
import { pdpaService } from '@/lib/pdpa-service';

// บันทึกความยินยอม
await pdpaService.recordConsent({
  userId: '123',
  consentType: 'data_processing',
  isConsented: true,
  ipAddress: '192.168.1.1'
});

// ตรวจสอบความยินยอม
const hasConsent = await pdpaService.hasConsent('123', 'data_processing');

// ปกปิดข้อมูล
const anonymizedData = await pdpaService.anonymizeData(userData, 'users');
```

### การจัดการ Backup
```typescript
import { backupService } from '@/lib/backup-service';

// สร้าง Backup
const backupId = await backupService.createBackup({
  type: 'FULL',
  includeMedia: true,
  includeLogs: false,
  description: 'Daily backup'
});

// Restore ข้อมูล
await backupService.restoreBackup({
  backupId: 'backup123',
  includeMedia: true,
  includeLogs: false
});
```

## การตรวจสอบและแก้ไขปัญหา

### ตรวจสอบ Log
1. ดู Log ในหน้า Admin
2. ตรวจสอบไฟล์ Log ในโฟลเดอร์ `logs/`
3. ใช้ API เพื่อดึง Log programmatically

### ตรวจสอบ Backup
1. ดูรายการ Backup ในหน้า Admin
2. ตรวจสอบไฟล์ Backup ในโฟลเดอร์ `backups/`
3. ทดสอบ Restore ในสภาพแวดล้อม Development

### ตรวจสอบ PDPA
1. ดูสถิติการให้ความยินยอม
2. ตรวจสอบกฎการปกปิดข้อมูล
3. ทดสอบการปกปิดข้อมูลด้วยข้อมูลตัวอย่าง

## ความปลอดภัย

- ข้อมูล Log ถูกเข้ารหัสและเก็บในฐานข้อมูล
- Backup ไฟล์ถูกเก็บในโฟลเดอร์ที่ปลอดภัย
- การเข้าถึงระบบจัดการต้องมีสิทธิ์ Admin
- ข้อมูลส่วนบุคคลถูกปกปิดตามกฎหมาย PDPA

## การบำรุงรักษา

- ตรวจสอบพื้นที่เก็บข้อมูลเป็นประจำ
- ตั้งค่า Cron Job สำหรับการลบ Log เก่า
- สำรองข้อมูลเป็นประจำ
- อัปเดตกฎการปกปิดข้อมูลตามความต้องการ

## การสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:
1. ตรวจสอบ Log ระบบ
2. ดูเอกสาร API
3. ติดต่อทีมพัฒนา
