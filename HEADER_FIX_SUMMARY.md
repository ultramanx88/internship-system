# 🔧 การแก้ไขปัญหาส่วนหัวเอกสารแยกกัน

## 🎯 ปัญหาที่พบ
**ปัญหา**: ส่วนหัวของเอกสารแยกกันเป็น 2 ส่วน
- ส่วนหัวใน DocumentPreview component
- ส่วนหัวใน BetterDocumentRenderer component

## ✅ การแก้ไข

### 1. ลบส่วนหัวซ้ำใน DocumentPreview
```typescript
// ลบส่วนนี้ออก
<div className="text-center mb-4 bg-white p-4 border border-gray-300">
  <img src="/assets/images/garuda-logo.png" alt="ตราครุฑ" />
  <div className="text-base font-bold mb-1">
    มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา
  </div>
  // ...
</div>
```

### 2. ปรับปรุง BetterDocumentRenderer
```typescript
// แสดงส่วนหัวสำหรับทุกเอกสาร
<div className="text-center mb-6 bg-white p-4">
  <img src="/assets/images/garuda-logo.svg" alt="ตราครุฑ" />
  <div className="text-lg font-bold mb-2">
    มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา
  </div>
  <div className="text-base">
    คณะบริหารธุรกิจและศิลปศาสตร์
  </div>
  {/* แสดงชื่อเอกสารสำหรับแบบฟอร์มสหกิจศึกษา */}
  {documentType === 'application' && type === 'co_op' && (
    <div className="text-sm font-medium mt-2">
      แบบแจ้งสถานที่ฝึกประสบการณ์สหกิจศึกษา (Co-operative Education) {academicYear}
    </div>
  )}
</div>
```

### 3. แก้ไขเทมเพลตแบบฟอร์มสหกิจศึกษา
```html
<!-- ลบส่วนหัวออกจากเทมเพลต -->
<div class="document-page">
  <!-- ไม่มี form-header แล้ว -->
  <div class="section-divider">
    <div class="section-box">
      <div class="section-header">ส่วนที่ ๑</div>
    </div>
  </div>
  <!-- เนื้อหาฟอร์ม -->
</div>
```

### 4. ปรับปรุงโลโก้
- เปลี่ยนจาก PNG เป็น SVG
- เพิ่ม fallback กรณีไฟล์ไม่พบ
- ปรับขนาดให้เหมาะสม

## 🎨 ผลลัพธ์

### ✅ สิ่งที่ได้รับการแก้ไข
- **ส่วนหัวเดียว**: ไม่มีส่วนหัวซ้ำแล้ว
- **โลโก้ตราครุฑ**: แสดงในตำแหน่งที่ถูกต้อง
- **ชื่อมหาวิทยาลัย**: แสดงครบถ้วน
- **ชื่อเอกสาร**: แสดงสำหรับแบบฟอร์มสหกิจศึกษา

### 📄 รูปแบบส่วนหัวตามประเภทเอกสาร

#### แบบฟอร์มสหกิจศึกษา
```
[โลโก้ตราครุฑ]
มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา
คณะบริหารธุรกิจและศิลปศาสตร์
แบบแจ้งสถานที่ฝึกประสบการณ์สหกิจศึกษา (Co-operative Education) 2567
```

#### หนังสือราชการ (ขอ/ส่งตัว)
```
[โลโก้ตราครุฑ]
มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา
คณะบริหารธุรกิจและศิลปศาสตร์

ที่ อว ๐๖๕๔.๐๒/ว ๑๐๓        วันที่ ๑๖ กันยายน ๒๕๖๗
เรื่อง ขอความอนุเคราะห์...
```

## 🔧 ไฟล์ที่แก้ไข

### Components
- `src/components/student/DocumentPreview.tsx` - ลบส่วนหัวซ้ำ
- `src/components/student/BetterDocumentRenderer.tsx` - ปรับปรุงส่วนหัว

### Templates
- `src/lib/better-templates.ts` - แก้ไขเทมเพลตแบบฟอร์ม

### Scripts
- `scripts/fix-template-headers.js` - สคริปต์แก้ไขส่วนหัว

### Assets
- `public/assets/images/garuda-logo.svg` - โลโก้ตราครุฑ SVG

## 🎯 การทดสอบ

### ✅ ตรวจสอบแล้ว
- [x] ส่วนหัวไม่ซ้ำ
- [x] โลโก้แสดงถูกต้อง
- [x] ชื่อมหาวิทยาลัยครบถ้วน
- [x] ชื่อเอกสารแสดงตามประเภท
- [x] รูปแบบตรงตามต้นฉบับ

### 🧪 การทดสอบเพิ่มเติม
```bash
# ตรวจสอบ syntax
npm run type-check

# ตรวจสอบการทำงาน
npm run dev
```

## 📊 เปรียบเทียบก่อน/หลัง

| ส่วนประกอบ | ก่อนแก้ไข | หลังแก้ไข |
|-------------|-----------|-----------|
| **ส่วนหัว** | ซ้ำ 2 ที่ | เดียว ✅ |
| **โลโก้** | PNG/ไม่มี | SVG ✅ |
| **ชื่อเอกสาร** | ไม่ครบ | ครบถ้วน ✅ |
| **Layout** | แยกกัน | รวมกัน ✅ |

---

**สรุป**: ปัญหาส่วนหัวแยกกันได้รับการแก้ไขแล้ว ตอนนี้เอกสารมีส่วนหัวเดียวที่สมบูรณ์และเหมือนต้นฉบับ ✅