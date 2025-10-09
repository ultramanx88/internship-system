# Educator Role Management System

## ภาพรวม

ระบบจัดการบทบาท Educator ช่วยให้ Staff และ Admin สามารถกำหนดบทบาทให้กับ Educator ตามเทอมและปีการศึกษาได้อย่างยืดหยุ่น

## คุณสมบัติหลัก

### 🎯 การกำหนดบทบาท
- **อาจารย์ประจำวิชา (Course Instructor)**: รับผิดชอบการสอนและประเมินผล
- **อาจารย์นิเทศก์ (Supervisor)**: ดูแลและให้คำแนะนำนักศึกษา
- **กรรมการ (Committee)**: พิจารณาและอนุมัติใบสมัคร
- **ผู้เยี่ยมชม (Visitor)**: เยี่ยมชมและประเมินสถานประกอบการ

### 📅 การจัดการเวลา
- กำหนดบทบาทตามปีการศึกษา
- กำหนดบทบาทตามภาคเรียน
- รองรับการเปลี่ยนบทบาทระหว่างเทอม

### 👥 การจัดการผู้ใช้
- กำหนดบทบาทหลายบทบาทให้กับ Educator คนเดียว
- เปิด/ปิดการใช้งานบทบาท
- เพิ่มหมายเหตุสำหรับการกำหนดบทบาท

## ฐานข้อมูล

### EducatorRoleAssignment Model
```prisma
model EducatorRoleAssignment {
  id            String   @id @default(cuid())
  educatorId    String
  academicYearId String
  semesterId    String
  roles         String   // JSON array of roles
  isActive      Boolean  @default(true)
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  educator      User         @relation("EducatorRoleAssignments", fields: [educatorId], references: [id], onDelete: Cascade)
  academicYear  AcademicYear @relation("EducatorRoleAssignments", fields: [academicYearId], references: [id], onDelete: Cascade)
  semester      Semester     @relation("EducatorRoleAssignments", fields: [semesterId], references: [id], onDelete: Cascade)

  @@unique([educatorId, academicYearId, semesterId])
  @@map("educator_role_assignments")
}
```

### AcademicYear Model
```prisma
model AcademicYear {
  id            String   @id @default(cuid())
  year          Int      @unique
  name          String
  isActive      Boolean  @default(false)
  startDate     DateTime?
  endDate       DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  semesters     Semester[]
  roleAssignments EducatorRoleAssignment[] @relation("EducatorRoleAssignments")

  @@map("academic_years")
}
```

### Semester Model
```prisma
model Semester {
  id            String   @id @default(cuid())
  name          String
  academicYearId String
  startDate     DateTime?
  endDate       DateTime?
  isActive      Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  academicYear  AcademicYear @relation(fields: [academicYearId], references: [id], onDelete: Cascade)
  roleAssignments EducatorRoleAssignment[] @relation("EducatorRoleAssignments")

  @@unique([name, academicYearId])
  @@map("semesters")
}
```

## API Endpoints

### Educator Role Assignments

#### GET /api/educator-role-assignments
ดึงรายการการกำหนดบทบาท

**Query Parameters:**
- `academicYearId`: ID ปีการศึกษา
- `semesterId`: ID ภาคเรียน
- `educatorId`: ID Educator
- `role`: บทบาทที่ต้องการกรอง
- `isActive`: สถานะการใช้งาน
- `page`: หน้าปัจจุบัน
- `limit`: จำนวนรายการต่อหน้า

**Response:**
```json
{
  "success": true,
  "assignments": [
    {
      "id": "assignment_id",
      "educatorId": "educator_id",
      "academicYearId": "year_id",
      "semesterId": "semester_id",
      "roles": ["courseInstructor", "supervisor"],
      "isActive": true,
      "notes": "หมายเหตุ",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "educator": {
        "id": "educator_id",
        "name": "ชื่อ Educator",
        "email": "email@example.com"
      },
      "academicYear": {
        "id": "year_id",
        "year": 2024,
        "name": "ปีการศึกษา 2567"
      },
      "semester": {
        "id": "semester_id",
        "name": "ภาคเรียนที่ 1"
      }
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

#### POST /api/educator-role-assignments
สร้างการกำหนดบทบาทใหม่

**Request Body:**
```json
{
  "educatorId": "educator_id",
  "academicYearId": "year_id",
  "semesterId": "semester_id",
  "roles": ["courseInstructor", "supervisor"],
  "isActive": true,
  "notes": "หมายเหตุ"
}
```

#### PUT /api/educator-role-assignments/[id]
อัปเดตการกำหนดบทบาท

#### DELETE /api/educator-role-assignments/[id]
ลบการกำหนดบทบาท

### Academic Years

#### GET /api/academic-years
ดึงรายการปีการศึกษา

#### POST /api/academic-years
สร้างปีการศึกษาใหม่

#### DELETE /api/academic-years
ลบปีการศึกษา

### Semesters

#### GET /api/semesters
ดึงรายการภาคเรียน

#### POST /api/semesters
สร้างภาคเรียนใหม่

#### DELETE /api/semesters
ลบภาคเรียน

## UI Components

### Admin/Staff Pages
- `/admin/educator-roles` - หน้าจัดการบทบาท Educator สำหรับ Admin
- `/staff/educator-roles` - หน้าจัดการบทบาท Educator สำหรับ Staff

### Form Component
- `EducatorRoleAssignmentForm` - ฟอร์มสำหรับสร้าง/แก้ไขการกำหนดบทบาท

## การใช้งาน

### 1. เข้าสู่ระบบเป็น Admin หรือ Staff
- ไปที่เมนู "บทบาท Educator"
- คลิก "เพิ่มการกำหนดบทบาท"

### 2. กำหนดบทบาท
- เลือก Educator
- เลือกปีการศึกษา
- เลือกภาคเรียน
- เลือกบทบาทที่ต้องการ
- ตั้งค่าสถานะการใช้งาน
- เพิ่มหมายเหตุ (ไม่บังคับ)

### 3. จัดการข้อมูล
- ดูรายการการกำหนดบทบาททั้งหมด
- กรองข้อมูลตามปีการศึกษา, ภาคเรียน, บทบาท
- แก้ไขหรือลบการกำหนดบทบาท

## การตั้งค่าเริ่มต้น

ระบบจะสร้างข้อมูลเริ่มต้นดังนี้:

### ปีการศึกษา
- ปีการศึกษา 2566 (ไม่ใช้งาน)
- ปีการศึกษา 2567 (ใช้งาน)
- ปีการศึกษา 2568 (ไม่ใช้งาน)

### ภาคเรียน
สำหรับแต่ละปีการศึกษาจะมี:
- ภาคเรียนที่ 1
- ภาคเรียนที่ 2
- ภาคเรียนฤดูร้อน

## การรักษาความปลอดภัย

- ต้องมีสิทธิ์ Admin หรือ Staff ในการเข้าถึง
- ตรวจสอบการมีอยู่ของ Educator, ปีการศึกษา, และภาคเรียน
- ป้องกันการกำหนดบทบาทซ้ำในเทอมเดียวกัน
- ตรวจสอบความถูกต้องของข้อมูลก่อนบันทึก

## การพัฒนาต่อ

### ฟีเจอร์ที่อาจเพิ่มในอนาคต
- การส่งออกรายงานการกำหนดบทบาท
- การแจ้งเตือนเมื่อมีการเปลี่ยนแปลงบทบาท
- การประวัติการเปลี่ยนแปลงบทบาท
- การกำหนดบทบาทแบบกลุ่ม
- การอนุมัติการเปลี่ยนแปลงบทบาท

### การปรับปรุง
- เพิ่มการค้นหาที่ซับซ้อนขึ้น
- เพิ่มการจัดเรียงข้อมูล
- เพิ่มการแสดงสถิติการใช้งาน
- เพิ่มการสำรองข้อมูลการกำหนดบทบาท
