# 🔢 ระบบตัวเลขและปีตามภาษา

## 🎯 เงื่อนไขใหม่

### 📄 เอกสารภาษาไทย
- **ตัวเลข**: ใช้เลขไทย (๐๑๒๓๔๕๖๗๘๙)
- **ปี**: ใช้พุทธศักราช (พ.ศ.) เช่น ๒๕๖๗
- **วันที่**: รูปแบบไทย เช่น ๑๖ กันยายน ๒๕๖๗

### 🌐 เอกสารภาษาอังกฤษ
- **ตัวเลข**: ใช้เลขอารบิก (0123456789)
- **ปี**: ใช้คริสตศักราช (ค.ศ.) เช่น 2024
- **วันที่**: รูปแบบอังกฤษ เช่น 16 September 2024

## ✅ ฟังก์ชันใหม่ที่เพิ่ม

### 🔄 การแปลงตัวเลข
```typescript
// แปลงเป็นเลขไทย (สำหรับเอกสารไทย)
const toThaiNumerals = (text: string): string => {
  const thaiNumerals = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return text.replace(/[0-9]/g, (digit) => thaiNumerals[parseInt(digit)]);
};

// แปลงเป็นเลขอารบิก (สำหรับเอกสารอังกฤษ)
const toArabicNumerals = (text: string): string => {
  return text.replace(/[๐-๙]/g, (digit) => {
    const thaiNumerals = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
    return thaiNumerals.indexOf(digit).toString();
  });
};

// จัดรูปแบบตัวเลขตามภาษา
const formatNumber = (number: string | number, language: 'th' | 'en'): string => {
  const numStr = number.toString();
  return language === 'th' ? toThaiNumerals(numStr) : numStr;
};
```

### 📅 การจัดรูปแบบวันที่
```typescript
// วันที่ภาษาไทย (เลขไทย + พ.ศ.)
const formatThaiDateWithThaiNumerals = (thaiDateString: string) => {
  const date = parseThaiDate(thaiDateString);
  if (!date) return toThaiNumerals(thaiDateString);
  
  const thaiDate = formatThaiDate(date);
  return toThaiNumerals(thaiDate);
};

// วันที่ภาษาอังกฤษ (เลขอารบิก + ค.ศ.)
const formatEnglishDate = (thaiDateString: string) => {
  const date = parseThaiDate(thaiDateString);
  if (!date) return thaiDateString;
  
  const months = ['January', 'February', 'March', ...];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear(); // ใช้ ค.ศ.
  
  return `${day} ${month} ${year}`;
};
```

### 🗓️ การจัดการปี
```typescript
// ปีปัจจุบันตามภาษา
const getCurrentYear = (language: 'th' | 'en'): string => {
  const currentYear = new Date().getFullYear();
  if (language === 'th') {
    const buddhistYear = currentYear + 543; // แปลงเป็น พ.ศ.
    return toThaiNumerals(buddhistYear.toString());
  } else {
    return currentYear.toString(); // ใช้ ค.ศ. เลขอารบิก
  }
};
```

## 🎨 ตัวอย่างการแสดงผล

### 📄 เอกสารภาษาไทย
```
ที่ อว ๐๖๕๔.๐๒/ว ๑๐๓        วันที่ ๑๖ กันยายน ๒๕๖๗

รหัสนักศึกษา: ๖๔๑๑๔๕๔๐๐๐๑
ชั้นปีที่: ๔
ปีการศึกษา: ๒๕๖๗
เบอร์โทรศัพท์: ๐๘๑-๒๓๔-๕๖๗๘
```

### 🌐 เอกสารภาษาอังกฤษ
```
No. อว 0654.02/ว 103        Date: 16 September 2024

Student ID: 64114540001
Year: 4
Academic Year: 2024
Phone: 081-234-5678
```

## 🔧 การปรับปรุงโค้ด

### ฟังก์ชันสร้างตัวแปรเทมเพลต
```typescript
const createTemplateVariables = () => {
  return {
    studentName: user.name || '[ชื่อนักศึกษา]',
    studentId: formatNumber(user.studentId || '', selectedLanguage),
    year: formatNumber(user.year || '4', selectedLanguage),
    phoneNumber: formatNumber('[081-234-5678]', selectedLanguage),
    companyPhone: formatNumber('[02-123-4567]', selectedLanguage),
    documentNumber: formatNumber('อว 0654.02/ว 103', selectedLanguage),
    academicYear: getCurrentYear(selectedLanguage),
    documentDate: formData.preferredStartDate ? 
      (selectedLanguage === 'th' ? 
        formatThaiDateWithThaiNumerals(formData.preferredStartDate) : 
        formatEnglishDate(formData.preferredStartDate)
      ) : '[วันที่]',
    contactPhone: formatNumber('0 5392 1444 ต่อ 1294', selectedLanguage),
    // ... ตัวแปรอื่นๆ
  };
};
```

### การใช้งานในเทมเพลต
```typescript
// ใช้ฟังก์ชันเดียวสำหรับทุก renderer
<BetterDocumentRenderer
  type={type}
  documentType={selectedDocument}
  language={selectedLanguage}
  variables={createTemplateVariables()}
  zoomLevel={zoomLevel}
/>
```

## 📊 เปรียบเทียบก่อน/หลัง

| ส่วนประกอบ | ก่อน | หลัง (ไทย) | หลัง (อังกฤษ) |
|-------------|------|------------|---------------|
| **รหัสนักศึกษา** | 64114540001 | ๖๔๑๑๔๕๔๐๐๐๑ | 64114540001 |
| **ปีการศึกษา** | 2567 | ๒๕๖๗ | 2024 |
| **วันที่** | 16/9/2567 | ๑๖ กันยายน ๒๕๖๗ | 16 September 2024 |
| **เบอร์โทร** | 081-234-5678 | ๐๘๑-๒๓๔-๕๖๗๘ | 081-234-5678 |
| **เลขที่เอกสาร** | อว 0654.02/ว 103 | อว ๐๖๕๔.๐๒/ว ๑๐๓ | อว 0654.02/ว 103 |

## 🎯 ข้อดีของระบบใหม่

### ✅ ความถูกต้องตามมาตรฐาน
- **เอกสารไทย**: ใช้เลขไทยตามมาตรฐานเอกสารราชการ
- **เอกสารอังกฤษ**: ใช้เลขอารบิกตามมาตรฐานสากล
- **ปีที่ถูกต้อง**: พ.ศ. สำหรับไทย, ค.ศ. สำหรับอังกฤษ

### 🌐 รองรับหลายภาษา
- **สลับอัตโนมัติ**: เปลี่ยนรูปแบบตามภาษาที่เลือก
- **ความสอดคล้อง**: ทุกตัวเลขในเอกสารใช้รูปแบบเดียวกัน
- **ไม่มีข้อผิดพลาด**: ไม่มีเลขผสมกันในเอกสารเดียว

### 🔄 ง่ายต่อการบำรุงรักษา
- **ฟังก์ชันกลาง**: จัดการการแปลงในที่เดียว
- **ไม่ซ้ำซ้อน**: ใช้ฟังก์ชันเดียวสำหรับทุก renderer
- **ปรับแต่งง่าย**: เปลี่ยนแปลงในที่เดียวส่งผลทั้งระบบ

## 🧪 การทดสอบ

### ✅ ทดสอบแล้ว
- [x] เลขไทยในเอกสารไทย
- [x] เลขอารบิกในเอกสารอังกฤษ
- [x] พ.ศ. ในเอกสารไทย
- [x] ค.ศ. ในเอกสารอังกฤษ
- [x] วันที่รูปแบบถูกต้อง
- [x] การสลับภาษาทำงานได้

### 🔍 วิธีทดสอบ
1. **เข้าหน้าพรีวิวเอกสาร**
2. **เลือกภาษาไทย** - ตรวจสอบเลขไทยและ พ.ศ.
3. **เลือกภาษาอังกฤษ** - ตรวจสอบเลขอารบิกและ ค.ศ.
4. **ตรวจสอบวันที่** - รูปแบบต้องถูกต้องตามภาษา
5. **ดาวน์โหลด PDF** - ตรวจสอบในไฟล์ที่ดาวน์โหลด

## 📝 ตัวอย่างเอกสารจริง

### เอกสารไทย
```
ที่ อว ๐๖๕๔.๐๒/ว ๑๐๓                    วันที่ ๑๖ กันยายน ๒๕๖๗

เรื่อง ขอความอนุเคราะห์รับนักศึกษาปฏิบัติงานสหกิจศึกษา

เรียน ผู้จัดการฝ่ายบุคคล
      บริษัท เทคโนโลยี จำกัด

รายละเอียดนักศึกษา
ชื่อ-นามสกุล    นายสมชาย ใจดี
รหัสนักศึกษา    ๖๔๑๑๔๕๔๐๐๐๑
ชั้นปี          ๔
ปีการศึกษา      ๒๕๖๗
```

### เอกสารอังกฤษ
```
No. อว 0654.02/ว 103                    Date: 16 September 2024

Subject: Request for Co-operative Education Student Placement

To: Human Resources Manager
    Technology Company Limited

Student Details
Name            Mr. Somchai Jaidee
Student ID      64114540001
Year            4
Academic Year   2024
```

---

**สรุป**: ระบบได้รับการปรับปรุงให้ใช้ตัวเลขและปีที่ถูกต้องตามภาษา เอกสารไทยใช้เลขไทยและ พ.ศ. เอกสารอังกฤษใช้เลขอารบิกและ ค.ศ. ตามมาตรฐานที่ถูกต้อง ✅

**ผลลัพธ์**: เอกสารดูเป็นทางการและถูกต้องตามมาตรฐานของแต่ละภาษา 100% 🎯