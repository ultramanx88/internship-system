# Document Templates

โฟลเดอร์นี้เก็บ template เอกสารสำหรับระบบฝึกงานและสหกิจศึกษา

## โครงสร้างโฟลเดอร์

```
document-templates/
├── assets/                       # ไฟล์สำหรับเอกสาร
│   └── images/
│       └── garuda-logo.png       # โลโก้ตราครุฑ
├── internship/                   # Templates สำหรับฝึกงาน
│   ├── th/                       # เอกสารภาษาไทย
│   │   ├── 01_หนังสือขอฝึกงาน.docx
│   │   ├── 01_หนังสือขอฝึกงาน.pdf
│   │   ├── 02_หนังสือส่งตัวฝึกงาน.docx
│   │   └── 02_หนังสือส่งตัวฝึกงาน.pdf
│   └── en/                       # เอกสารภาษาอังกฤษ
│       ├── 01_Request_Letter_Internship.docx
│       ├── 01_Request_Letter_Internship.pdf
│       ├── 02_Introduction_Letter_Internship.docx
│       └── 02_Introduction_Letter_Internship.pdf
├── co-op/                        # Templates สำหรับสหกิจศึกษา
│   ├── th/                       # เอกสารภาษาไทย
│   │   ├── 01_แบบฟอร์มขอสหกิจศึกษา.docx
│   │   ├── 01_แบบฟอร์มขอสหกิจศึกษา.pdf
│   │   ├── 02_หนังสือขอสหกิจศึกษา.docx
│   │   ├── 02_หนังสือขอสหกิจศึกษา.pdf
│   │   ├── 03_หนังสือส่งตัวสหกิจศึกษา.docx
│   │   ├── 03_หนังสือส่งตัวสหกิจศึกษา.pdf
│   │   ├── 04_แบบฟอร์มประเมินสหกิจศึกษา.docx
│   │   └── 04_แบบฟอร์มประเมินสหกิจศึกษา.pdf
│   └── en/                       # เอกสารภาษาอังกฤษ
│       ├── 01_Application_Form_Cooperative_Education.docx
│       ├── 01_Application_Form_Cooperative_Education.pdf
│       ├── 02_Request_Letter_Cooperative_Education.docx
│       ├── 02_Request_Letter_Cooperative_Education.pdf
│       ├── 03_Introduction_Letter_Cooperative_Education.docx
│       └── 03_Introduction_Letter_Cooperative_Education.pdf
├── ข้อมูล คณะ สาขา.xlsx           # ข้อมูลคณะและสาขา
└── README.md                     # ไฟล์นี้
```

## การใช้งาน

1. **เพิ่ม Template ใหม่**
   - วาง template files (.docx, .pdf) ในโฟลเดอร์ที่เหมาะสม
   - ตั้งชื่อไฟล์ให้สื่อความหมาย เช่น `หนังสือขอฝึกงาน.docx`

2. **Template Variables**
   - ใช้ placeholder ในรูปแบบ `{{variable_name}}` เช่น:
     - `{{studentName}}` - ชื่อนักศึกษา
     - `{{studentId}}` - รหัสนักศึกษา
     - `{{companyName}}` - ชื่อบริษัท
     - `{{documentNumber}}` - เลขที่เอกสาร
     - `{{documentDate}}` - วันที่เอกสาร
     - `{{currentDate}}` - วันที่ปัจจุบัน

3. **รายการเอกสารที่มี**

   **ฝึกงาน (Internship):**
   - หนังสือขอฝึกงาน (Request Letter)
   - หนังสือส่งตัวฝึกงาน (Introduction Letter)
   
   **สหกิจศึกษา (Co-op):**
   - แบบฟอร์มขอสหกิจศึกษา (Application Form)
   - หนังสือขอสหกิจศึกษา (Request Letter)
   - หนังสือส่งตัวสหกิจศึกษา (Introduction Letter)
   - แบบฟอร์มประเมินสหกิจศึกษา (Evaluation Form)

4. **การตั้งชื่อไฟล์**
   - ใช้เลขลำดับนำหน้า (01_, 02_, 03_, ...)
   - แยกภาษาไทย (th/) และอังกฤษ (en/)
   - รูปแบบ: `{ลำดับ}_{ชื่อเอกสาร}.{นามสกุล}`

## Assets และรูปภาพ

1. **โลโก้ตราครุฑ**
   - ไฟล์: `assets/images/garuda-logo.png`
   - ใช้ในส่วนหัวของเอกสารทุกประเภท
   - คัดลอกไปยัง `public/assets/images/` สำหรับเว็บแอป

2. **การใช้งานในเทมเพลต**
   - โลโก้จะแสดงที่ส่วนบนของเอกสาร
   - ตามด้วยชื่อมหาวิทยาลัย คณะ และภาควิชา

## หมายเหตุ

- ไฟล์ template ควรมี version control
- ตรวจสอบ placeholder variables ให้ถูกต้องก่อนใช้งาน
- สำรองข้อมูล template เป็นประจำ
- โลโก้ตราครุฑต้องมีในทุกเอกสารราชการ