# Application Workflow System

## ภาพรวม

ระบบ Workflow สำหรับการจัดการคำขอฝึกงานของนักศึกษา โดยมีขั้นตอนการพิจารณาตามลำดับที่กำหนดไว้

## 🔄 Workflow Steps

### 1. นักศึกษาขอฝึกงาน (Student Application)
- นักศึกษากรอกข้อมูลและส่งคำขอฝึกงาน
- ระบบสร้าง Application record พร้อม status = 'pending'
- ระบบกำหนดอาจารย์ประจำวิชาที่เหมาะสมให้อัตโนมัติ

### 2. อาจารย์ประจำวิชาพิจารณา (Course Instructor Review)
- อาจารย์ประจำวิชาตรวจสอบและพิจารณาคำขอ
- **อนุมัติ**: ระบบจะดำเนินการขั้นตอนต่อไป
- **ปฏิเสธ**: คำขอจะถูกยกเลิก (status = 'rejected')

### 3. กำหนดอาจารย์นิเทศก์ (Supervisor Assignment)
- ระบบกำหนดอาจารย์นิเทศก์ที่เหมาะสมให้อัตโนมัติ
- อัปเดต supervisor status = 'assigned'

### 4. กรรมการพิจารณา (Committee Review)
- คำขอจะถูกส่งไปยังกรรมการทุกคนที่ใช้งานอยู่ในเทอมปัจจุบัน
- กรรมการแต่ละคนสามารถอนุมัติหรือปฏิเสธได้
- ระบบจะรอการพิจารณาจากกรรมการทุกคน

### 5. สถานะสุดท้าย (Final Status)
- **อนุมัติ**: หากกรรมการทุกคนอนุมัติ (status = 'approved')
- **ปฏิเสธ**: หากกรรมการคนใดคนหนึ่งปฏิเสธ (status = 'rejected')

## 📊 Database Schema

### Application Model (Updated)
```prisma
model Application {
  id            String            @id @default(cuid())
  studentId     String
  internshipId  String
  status        ApplicationStatus
  
  // Workflow fields
  courseInstructorId    String?
  supervisorId          String?
  courseInstructorStatus String? // pending, approved, rejected
  supervisorStatus      String? // pending, assigned, completed
  committeeStatus       String? // pending, approved, rejected
  courseInstructorFeedback String?
  supervisorFeedback    String?
  committeeFeedback     String?
  courseInstructorApprovedAt DateTime?
  supervisorAssignedAt  DateTime?
  committeeApprovedAt   DateTime?
  
  // Relations
  courseInstructor User?          @relation("CourseInstructorApplications")
  supervisor    User?             @relation("SupervisorApplications")
  committeeApprovals CommitteeApproval[]
}
```

### CommitteeApproval Model
```prisma
model CommitteeApproval {
  id            String   @id @default(cuid())
  applicationId String
  committeeId   String
  status        String   // approved, rejected, pending
  feedback      String?
  approvedAt    DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  application   Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  committee     User        @relation("CommitteeApprovals", fields: [committeeId], references: [id], onDelete: Cascade)

  @@unique([applicationId, committeeId])
}
```

## 🔌 API Endpoints

### POST /api/applications/create
สร้างคำขอฝึกงานใหม่

**Request:**
```json
{
  "studentId": "s6800001",
  "internshipId": "internship_1",
  "projectTopic": "การพัฒนาระบบจัดการฝึกงาน",
  "feedback": "โครงการน่าสนใจ"
}
```

**Response:**
```json
{
  "success": true,
  "application": {
    "id": "app_123",
    "status": "pending",
    "courseInstructorStatus": "pending",
    "supervisorStatus": "pending",
    "committeeStatus": "pending"
  },
  "message": "สร้างคำขอฝึกงานสำเร็จ"
}
```

### GET /api/applications/[id]/workflow
ดูสถานะ workflow ของ application

**Response:**
```json
{
  "success": true,
  "workflowStatus": {
    "currentStep": "course_instructor_review",
    "courseInstructorStatus": "pending",
    "supervisorStatus": "pending",
    "committeeStatus": "pending",
    "isCompleted": false,
    "isRejected": false
  }
}
```

### POST /api/applications/[id]/workflow
อาจารย์ประจำวิชาพิจารณา

**Request:**
```json
{
  "status": "approved",
  "feedback": "โครงการเหมาะสม สามารถดำเนินการได้"
}
```

### PUT /api/applications/[id]/workflow
กรรมการพิจารณา

**Request:**
```json
{
  "status": "approved",
  "feedback": "โครงการมีประโยชน์ เหมาะสมสำหรับการฝึกงาน"
}
```

## 🎨 UI Components

### WorkflowStatus Component
แสดงสถานะการดำเนินงานของ application

```tsx
<WorkflowStatus 
  applicationId="app_123" 
  onStatusChange={(status) => console.log(status)} 
/>
```

### WorkflowActions Component
แสดงปุ่มสำหรับการดำเนินการตาม role

```tsx
<WorkflowActions 
  applicationId="app_123"
  userRole="courseInstructor"
  workflowStatus={workflowStatus}
  onActionComplete={() => refreshData()}
/>
```

## 🔐 Role-based Access Control

### Student
- สร้างคำขอฝึกงาน
- ดูสถานะของคำขอตนเอง

### Course Instructor
- ดูคำขอที่ได้รับมอบหมาย
- อนุมัติ/ปฏิเสธคำขอ

### Committee
- ดูคำขอที่ส่งมาพิจารณา
- อนุมัติ/ปฏิเสธคำขอ

### Staff/Admin
- ดูคำขอทั้งหมด
- จัดการ workflow
- กำหนดอาจารย์ประจำวิชาและกรรมการ

## 📈 Workflow Status Values

### currentStep
- `submitted`: ส่งคำขอแล้ว
- `course_instructor_review`: รออาจารย์ประจำวิชาพิจารณา
- `supervisor_assignment`: กำหนดอาจารย์นิเทศก์
- `committee_review`: รอกรรมการพิจารณา
- `completed`: เสร็จสิ้น
- `rejected`: ถูกปฏิเสธ

### courseInstructorStatus
- `pending`: รอพิจารณา
- `approved`: อนุมัติ
- `rejected`: ปฏิเสธ

### supervisorStatus
- `pending`: รอกำหนด
- `assigned`: กำหนดแล้ว
- `completed`: เสร็จสิ้น

### committeeStatus
- `pending`: รอพิจารณา
- `approved`: อนุมัติ
- `rejected`: ปฏิเสธ

## 🧪 Testing

ใช้ `test-workflow.js` เพื่อทดสอบ workflow ทั้งหมด:

```bash
node test-workflow.js
```

การทดสอบจะครอบคลุม:
1. สร้าง Application ใหม่
2. ตรวจสอบ Workflow Status
3. อาจารย์ประจำวิชาพิจารณา
4. กรรมการพิจารณา
5. ตรวจสอบสถานะสุดท้าย

## 🔧 Business Logic

### การกำหนดอาจารย์ประจำวิชา
- ระบบจะหาอาจารย์ประจำวิชาที่เหมาะสมตาม business logic
- อาจใช้ข้อมูลจาก student's major, faculty, etc.

### การกำหนดอาจารย์นิเทศก์
- ระบบจะหาอาจารย์นิเทศก์ที่เหมาะสมตาม business logic
- อาจใช้ข้อมูลจาก project topic, company, etc.

### การกำหนดกรรมการ
- ระบบจะหากรรมการที่ใช้งานอยู่ในเทอมปัจจุบัน
- ใช้ข้อมูลจาก EducatorRoleAssignment

## 🚀 การใช้งาน

### 1. นักศึกษาสร้างคำขอ
```javascript
const response = await fetch('/api/applications/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    studentId: 's6800001',
    internshipId: 'internship_1',
    projectTopic: 'การพัฒนาระบบจัดการฝึกงาน'
  })
});
```

### 2. อาจารย์ประจำวิชาพิจารณา
```javascript
const response = await fetch('/api/applications/app_123/workflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'approved',
    feedback: 'โครงการเหมาะสม'
  })
});
```

### 3. กรรมการพิจารณา
```javascript
const response = await fetch('/api/applications/app_123/workflow', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'approved',
    feedback: 'โครงการมีประโยชน์'
  })
});
```

## 📝 Notes

- ระบบจะบันทึก timestamp ของแต่ละขั้นตอน
- ระบบจะบันทึก feedback จากแต่ละ role
- ระบบจะตรวจสอบสิทธิ์การเข้าถึงในแต่ละขั้นตอน
- ระบบจะส่ง notification เมื่อมีการเปลี่ยนแปลงสถานะ
