# Single-Role Educator Assignment System

## ภาพรวมระบบ

ระบบได้ถูกปรับปรุงให้เป็น **Single-Role System** สำหรับการกำหนดบทบาท educator แทนที่จะเป็น multi-role system เดิม

## การทำงานของระบบ

### 1. User Roles vs Educator Role Assignments

ระบบมี 2 ระดับของ roles:

#### User Roles (ในตาราง users.roles)
- เป็น JSON array ที่เก็บ roles หลักของ user
- ตัวอย่าง: `["admin", "staff", "student"]`
- ใช้สำหรับการ authentication และ authorization

#### Educator Role Assignments (ในตาราง educator_role_assignments.roles)
- เป็น JSON array ที่เก็บ specific roles สำหรับ educator ในแต่ละเทอม/ปีการศึกษา
- ตัวอย่าง: `["educator"]`, `["courseInstructor"]`, `["supervisor"]`
- ใช้สำหรับการกำหนดหน้าที่เฉพาะในแต่ละเทอม

### 2. การสร้าง Educator Role Assignment

#### ขั้นตอนการทำงาน:
1. **เลือก Educator**: ต้องเป็น user ที่มี role ใดๆ ใน `['admin', 'staff', 'courseInstructor', 'committee', 'visitor']`
2. **เลือกปีการศึกษา**: ต้องเป็นปีการศึกษาที่มีอยู่ในระบบ
3. **เลือกภาคเรียน**: ต้องเป็นภาคเรียนที่อยู่ในปีการศึกษาที่เลือก
4. **เลือกบทบาท**: เลือกได้เพียง 1 บทบาทจากตัวเลือกต่อไปนี้:
   - `educator` - อาจารย์ (บทบาทหลัก)
   - `courseInstructor` - อาจารย์ประจำวิชา
   - `supervisor` - อาจารย์นิเทศ
   - `committee` - กรรมการ
   - `visitor` - ผู้เยี่ยมชม

#### Validation Rules:
- ต้องเลือก educator, ปีการศึกษา, ภาคเรียน และบทบาท
- ไม่สามารถกำหนดบทบาทซ้ำสำหรับ educator เดียวกันในเทอม/ปีการศึกษาเดียวกัน
- User ต้องมีสิทธิ์ในการกำหนดบทบาท educator

### 3. การแก้ไข Educator Role Assignment

- สามารถแก้ไขบทบาท, สถานะ และหมายเหตุได้
- ไม่สามารถแก้ไข educator, ปีการศึกษา หรือภาคเรียนได้
- ต้องลบและสร้างใหม่หากต้องการเปลี่ยน educator หรือเทอม

### 4. การแสดงผล

- แสดงบทบาทเดียวในตารางแทนการแสดงหลายบทบาท
- มีการกรองตามบทบาทได้
- แสดงสถานะการใช้งาน (ใช้งาน/ไม่ใช้งาน)

## API Endpoints

### POST /api/educator-role-assignments
สร้างการกำหนดบทบาทใหม่

**Request Body:**
```json
{
  "educatorId": "string",
  "academicYearId": "string", 
  "semesterId": "string",
  "roles": ["educator"], // Array with single role
  "isActive": true,
  "notes": "string"
}
```

### PUT /api/educator-role-assignments/[id]
แก้ไขการกำหนดบทบาท

**Request Body:**
```json
{
  "roles": ["courseInstructor"], // Array with single role
  "isActive": true,
  "notes": "string"
}
```

### DELETE /api/educator-role-assignments/[id]
ลบการกำหนดบทบาท

## ข้อดีของ Single-Role System

1. **ความชัดเจน**: แต่ละ educator มีบทบาทเดียวในแต่ละเทอม
2. **ง่ายต่อการจัดการ**: ไม่ซับซ้อนในการกำหนดและติดตาม
3. **ลดความสับสน**: ไม่มีปัญหาเรื่องการเลือกหลายบทบาท
4. **เหมาะสำหรับการใช้งานจริง**: ตรงกับความต้องการของระบบการศึกษา

## การใช้งาน

1. เข้าสู่ระบบด้วย role `admin` หรือ `staff`
2. ไปที่หน้า "จัดการบทบาท บุคลากรทางการศึกษา"
3. คลิก "เพิ่มการกำหนดบทบาท"
4. เลือก educator, ปีการศึกษา, ภาคเรียน และบทบาท
5. บันทึกข้อมูล

## หมายเหตุ

- ระบบยังคงรองรับการเก็บ roles เป็น array ในฐานข้อมูลเพื่อความยืดหยุ่น
- การแสดงผลจะแสดงเฉพาะ role แรกใน array
- การแก้ไขจะแทนที่ roles ทั้งหมดด้วย role เดียวที่เลือก
