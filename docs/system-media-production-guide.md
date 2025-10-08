# ระบบจัดการไฟล์ระบบสำหรับ Production

## ภาพรวม

ระบบจัดการไฟล์ระบบถูกออกแบบมาเพื่อจัดการไฟล์ที่มีความสำคัญต่อการแสดงผลของระบบ เช่น โลโก้, ภาพพื้นหลัง, และ favicon ในระดับ Production

## คุณสมบัติหลัก

### 1. การจัดการไฟล์ระบบ
- **โลโก้ (Logo)**: ใช้ในหน้า Login, Menu, และ Favicon
- **ภาพพื้นหลัง (Background)**: ใช้ในหน้า Login และหน้าต่างๆ
- **Favicon**: ไอคอนของเว็บไซต์

### 2. การทำงานแบบ Replace
- เมื่ออัปโหลดไฟล์ใหม่ ไฟล์เก่าจะถูกปิดการใช้งานอัตโนมัติ
- ระบบจะเก็บไฟล์เก่าไว้ 5 ไฟล์ล่าสุดสำหรับการกู้คืน
- ไฟล์เก่าที่เกิน 5 ไฟล์จะถูกลบอัตโนมัติ

### 3. การจัดการฐานข้อมูล
- เก็บข้อมูลไฟล์ในตาราง `SystemMedia`
- ติดตามข้อมูลไฟล์ครบถ้วน (ขนาด, ประเภท, ผู้อัปโหลด)
- รองรับการเปิด/ปิดการใช้งานไฟล์

## โครงสร้างฐานข้อมูล

### ตาราง SystemMedia

```sql
CREATE TABLE system_media (
  id VARCHAR(191) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,           -- 'logo', 'background', 'favicon'
  name VARCHAR(255) NOT NULL,          -- ชื่อไฟล์ที่สร้างขึ้น
  originalName VARCHAR(255) NOT NULL,  -- ชื่อไฟล์เดิม
  filePath VARCHAR(500) NOT NULL,      -- path ของไฟล์
  fileSize INTEGER NOT NULL,           -- ขนาดไฟล์ (bytes)
  mimeType VARCHAR(100) NOT NULL,      -- MIME type
  width INTEGER,                       -- ความกว้าง (สำหรับรูปภาพ)
  height INTEGER,                      -- ความสูง (สำหรับรูปภาพ)
  isActive BOOLEAN DEFAULT true,       -- ไฟล์ที่ใช้งานอยู่
  uploadedBy VARCHAR(191) NOT NULL,    -- ID ของผู้ที่อัปโหลด
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API Endpoints

### 1. ดึงข้อมูลไฟล์ระบบ
```
GET /api/system-media
```

**Parameters:**
- `type` (optional): ประเภทไฟล์ ('logo', 'background', 'favicon')
- `activeOnly` (optional): แสดงเฉพาะไฟล์ที่ใช้งานอยู่ (true/false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cm123...",
      "type": "logo",
      "name": "logo_company_1696234567890_abc123.png",
      "originalName": "company-logo.png",
      "filePath": "/assets/images/system/logo_company_1696234567890_abc123.png",
      "fileSize": 245760,
      "mimeType": "image/png",
      "width": 200,
      "height": 100,
      "isActive": true,
      "uploadedBy": "admin123",
      "createdAt": "2024-10-08T10:30:00Z",
      "updatedAt": "2024-10-08T10:30:00Z"
    }
  ]
}
```

### 2. อัปโหลดไฟล์ระบบ
```
POST /api/system-media
```

**Body (FormData):**
- `file`: ไฟล์ที่ต้องการอัปโหลด
- `type`: ประเภทไฟล์ ('logo', 'background', 'favicon')
- `uploadedBy`: ID ของผู้ที่อัปโหลด

**Response:**
```json
{
  "success": true,
  "url": "/assets/images/system/logo_company_1696234567890_abc123.png",
  "message": "อัปโหลดโลโก้สำเร็จ",
  "data": { /* ข้อมูลไฟล์ที่บันทึกในฐานข้อมูล */ },
  "fileHash": "a1b2c3d4"
}
```

### 3. ลบไฟล์ระบบ
```
DELETE /api/system-media
```

**Body:**
```json
{
  "id": "cm123..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "ลบไฟล์ระบบสำเร็จ"
}
```

### 4. เปิดใช้งานไฟล์ระบบ
```
PUT /api/system-media/active
```

**Body:**
```json
{
  "id": "cm123..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "เปิดใช้งานโลโก้สำเร็จ",
  "data": { /* ข้อมูลไฟล์ที่เปิดใช้งาน */ }
}
```

### 5. ดึงข้อมูลไฟล์ที่ใช้งานอยู่
```
GET /api/system-media/active
```

**Parameters:**
- `type` (optional): ประเภทไฟล์ ('logo', 'background', 'favicon')

## การใช้งานใน Frontend

### 1. Hook useSystemMedia

```typescript
import { useSystemMedia } from '@/hooks/use-system-media';

function MyComponent() {
  const {
    systemMedia,
    isLoading,
    error,
    uploadSystemMedia,
    deleteSystemMedia,
    activateSystemMedia,
    getActiveMediaByType,
    getMediaByType
  } = useSystemMedia();

  // ดึงโลโก้ที่ใช้งานอยู่
  const activeLogo = getActiveMediaByType('logo');
  
  // ดึงโลโก้ทั้งหมด
  const allLogos = getMediaByType('logo');

  // อัปโหลดโลโก้ใหม่
  const handleUpload = async (file: File) => {
    const result = await uploadSystemMedia(file, 'logo', 'admin123');
    if (result.success) {
      console.log('อัปโหลดสำเร็จ:', result.data);
    }
  };

  return (
    <div>
      {activeLogo && (
        <img src={activeLogo.filePath} alt="Logo" />
      )}
    </div>
  );
}
```

### 2. Hook useSystemTheme

```typescript
import { useSystemTheme } from '@/hooks/use-system-theme';

function App() {
  const { logo, background, favicon, isLoading } = useSystemTheme();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ backgroundImage: `url(${background})` }}>
      <img src={logo} alt="Logo" />
    </div>
  );
}
```

## หน้าจัดการสำหรับ Admin

### หน้า System Media Management
- **Path**: `/admin/system-media`
- **Features**:
  - อัปโหลดไฟล์ระบบใหม่
  - ดูไฟล์ทั้งหมดที่อัปโหลด
  - เปิด/ปิดการใช้งานไฟล์
  - ลบไฟล์ที่ไม่ต้องการ
  - ดูข้อมูลไฟล์ (ขนาด, ประเภท, วันที่อัปโหลด)

### การใช้งาน
1. เข้าไปที่หน้า Admin Settings
2. เลือกแท็บ "System Media"
3. เลือกประเภทไฟล์ที่ต้องการจัดการ (Logo, Background, Favicon)
4. อัปโหลดไฟล์ใหม่หรือจัดการไฟล์ที่มีอยู่

## ข้อกำหนดไฟล์

### โลโก้ (Logo)
- **ขนาดสูงสุด**: 2MB
- **ประเภทที่รองรับ**: JPG, PNG, WebP, SVG
- **การตั้งชื่อ**: `logo_{originalName}_{timestamp}_{random}.{ext}`
- **การใช้งาน**: หน้า Login, Menu, Favicon

### ภาพพื้นหลัง (Background)
- **ขนาดสูงสุด**: 5MB
- **ประเภทที่รองรับ**: JPG, PNG, WebP, SVG
- **การตั้งชื่อ**: `background_{originalName}_{timestamp}_{random}.{ext}`
- **การใช้งาน**: หน้า Login, หน้าต่างๆ

### Favicon
- **ขนาดสูงสุด**: 2MB
- **ประเภทที่รองรับ**: ICO, PNG
- **การตั้งชื่อ**: `favicon_{originalName}_{timestamp}_{random}.{ext}`
- **การใช้งาน**: ไอคอนของเว็บไซต์

## โครงสร้างไฟล์

```
public/assets/images/system/
├── logo_company_1696234567890_abc123.png
├── logo_university_1696234567891_def456.png
├── background_office_1696234567892_ghi789.jpg
├── background_campus_1696234567893_jkl012.jpg
├── favicon_icon_1696234567894_mno345.ico
└── favicon_logo_1696234567895_pqr678.png
```

## การ Migration

### 1. รัน Migration
```bash
# สร้างตาราง SystemMedia
npx prisma migrate dev --name add_system_media

# หรือใช้ Prisma migrate
npx prisma db push
```

### 2. Migration ข้อมูลเก่า
```typescript
// scripts/migrate-system-media.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateSystemMedia() {
  // ย้ายไฟล์จาก localStorage หรือไฟล์เก่า
  // ไปยังระบบใหม่
}

migrateSystemMedia();
```

## การจัดการในระดับ Production

### 1. การ Backup
- Backup ไฟล์ระบบเป็นประจำ
- เก็บไฟล์สำรองในที่ปลอดภัย
- ทดสอบการกู้คืนไฟล์

### 2. การ Monitor
- ติดตามขนาดพื้นที่เก็บข้อมูล
- ตรวจสอบไฟล์ที่ไม่ได้ใช้
- Monitor การใช้งาน API

### 3. การ Cleanup
- ลบไฟล์เก่าที่ไม่ได้ใช้
- จำกัดจำนวนไฟล์ต่อประเภท
- จัดการพื้นที่เก็บข้อมูล

## Security Considerations

### 1. การตรวจสอบไฟล์
- ตรวจสอบ MIME type
- ตรวจสอบ file signature
- จำกัดขนาดไฟล์ตามประเภท

### 2. การป้องกัน Path Traversal
- ใช้ path.join() แทนการต่อ string
- ตรวจสอบ path ที่ปลอดภัย
- จำกัดการเข้าถึงไฟล์

### 3. การตั้งค่า Permissions
- ตั้งค่าโฟลเดอร์ system ให้อ่านได้เท่านั้น
- ไม่อนุญาตให้ execute ไฟล์
- จำกัดการเข้าถึง API

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

4. **การเปิดใช้งานไฟล์ไม่สำเร็จ**
   - ตรวจสอบว่าไฟล์มีอยู่จริง
   - ตรวจสอบการเชื่อมต่อฐานข้อมูล

### การ Debug

```typescript
// เปิด debug mode
console.log('System media data:', systemMedia);
console.log('Active logo:', getActiveMediaByType('logo'));
console.log('All logos:', getMediaByType('logo'));
```

## Best Practices

### 1. การตั้งชื่อไฟล์
- ใช้ชื่อที่สื่อความหมาย
- หลีกเลี่ยงอักขระพิเศษ
- ใช้ timestamp เพื่อความไม่ซ้ำกัน

### 2. การจัดการไฟล์
- อัปโหลดไฟล์ที่มีขนาดเหมาะสม
- ใช้รูปแบบไฟล์ที่เหมาะสม
- ทดสอบการแสดงผลก่อนใช้งาน

### 3. การ Backup
- Backup ไฟล์สำคัญเป็นประจำ
- เก็บไฟล์สำรองในที่ปลอดภัย
- ทดสอบการกู้คืนไฟล์

### 4. การ Monitor
- ติดตามการใช้งานไฟล์
- ตรวจสอบพื้นที่เก็บข้อมูล
- Monitor การทำงานของ API

## การอัปเกรด

### 1. การเพิ่มฟีเจอร์ใหม่
- เพิ่มประเภทไฟล์ใหม่ใน enum
- อัปเดต validation rules
- เพิ่ม UI สำหรับจัดการไฟล์ใหม่

### 2. การปรับปรุงประสิทธิภาพ
- ใช้ CDN สำหรับไฟล์ระบบ
- ปรับปรุงการ cache
- เพิ่มการ compress ไฟล์

### 3. การเพิ่ม Security
- เพิ่มการตรวจสอบไฟล์
- ปรับปรุงการจัดการ permissions
- เพิ่มการ audit log
