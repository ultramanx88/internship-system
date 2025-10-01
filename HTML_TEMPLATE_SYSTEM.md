# ระบบเทมเพลต HTML สำหรับเอกสารฝึกงาน

## ภาพรวม

ระบบนี้ช่วยให้คุณสามารถแปลงไฟล์ PDF เป็นเทมเพลต HTML และใช้สร้างเอกสารแบบฟอร์มต่างๆ ได้อย่างง่ายดาย

## ไฟล์ที่สร้างขึ้น

### 1. Components
- `src/components/admin/documents/HtmlTemplateViewer.tsx` - Component สำหรับแสดงและแก้ไขเทมเพลต HTML

### 2. API Routes
- `src/app/api/templates/html/route.ts` - API สำหรับอ่านไฟล์เทมเพลต HTML
- `src/app/api/documents/generate-html/route.ts` - API สำหรับสร้างเอกสารจากเทมเพลต

### 3. Pages
- `src/app/admin/documents/html-templates/page.tsx` - หน้าจัดการเทมเพลต HTML
- `src/app/admin/documents/templates/page.tsx` - หน้าจัดการเทมเพลตเอกสารทั่วไป
- `src/app/admin/documents/generated/page.tsx` - หน้าแสดงเอกสารที่สร้างแล้ว

### 4. Templates
- `document-templates/co-op/th/A แบบฟอร์มขอฝึกสหกิจ [ไทย] - Template.html` - เทมเพลต HTML ที่ปรับปรุงแล้ว

## วิธีการใช้งาน

### 1. เข้าถึงระบบ
1. เข้าสู่ระบบด้วยบัญชี Admin
2. ไปที่เมนู "จัดการเอกสาร" > "เทมเพลต HTML"

### 2. ใช้งานเทมเพลต
1. เลือกเทมเพลตที่ต้องการ
2. คลิก "ดูและแก้ไข"
3. กรอกข้อมูลในฟอร์ม
4. ดูตัวอย่างเอกสาร
5. คลิก "ดาวน์โหลด" เพื่อบันทึกเอกสาร

### 3. ฟิลด์ที่รองรับ
- `{{student_name}}` - ชื่อ-นามสกุล นักศึกษา
- `{{student_id}}` - รหัสนักศึกษา
- `{{faculty}}` - คณะ
- `{{department}}` - สาขาวิชา
- `{{year}}` - ชั้นปี
- `{{gpa}}` - เกรดเฉลี่ย
- `{{phone}}` - เบอร์โทรศัพท์
- `{{email}}` - อีเมล
- `{{company_name}}` - ชื่อบริษัท/หน่วยงาน
- `{{company_address}}` - ที่อยู่บริษัท
- `{{supervisor_name}}` - ชื่อพี่เลี้ยง
- `{{supervisor_position}}` - ตำแหน่งพี่เลี้ยง
- `{{start_date}}` - วันที่เริ่มฝึกงาน
- `{{end_date}}` - วันที่สิ้นสุดฝึกงาน
- `{{application_date}}` - วันที่ยื่นใบสมัคร

## การแปลงไฟล์ PDF เป็น HTML

### วิธีที่ 1: ใช้ pdf2htmlEX (แนะนำ)
```bash
# ติดตั้ง pdf2htmlEX
brew install pdf2htmlex  # macOS
sudo apt-get install pdf2htmlex  # Ubuntu

# แปลงไฟล์
pdf2htmlEX --zoom 1.3 --dest-dir document-templates/co-op/th/ "input.pdf"
```

### วิธีที่ 2: ใช้เครื่องมือออนไลน์
- PDF24
- SmallPDF
- ILovePDF

### วิธีที่ 3: ใช้ Adobe Acrobat
1. เปิดไฟล์ PDF ใน Adobe Acrobat
2. File > Export To > Web Page, HTML
3. เลือกการตั้งค่าที่เหมาะสม
4. บันทึกไฟล์

## การปรับแต่งเทมเพลต

### 1. เพิ่ม Placeholder
```html
<span class="underline">{{field_name}}</span>
```

### 2. เพิ่มสไตล์สำหรับการพิมพ์
```css
@media print {
    .no-print { display: none; }
    body { margin: 0; }
}
```

### 3. เพิ่มฟอนต์ภาษาไทย
```css
body {
    font-family: 'Sarabun', 'TH SarabunPSK', Arial, sans-serif;
}
```

## การเพิ่มเทมเพลตใหม่

### 1. เพิ่มไฟล์เทมเพลต
1. วางไฟล์ HTML ในโฟลเดอร์ `document-templates/`
2. ตั้งชื่อไฟล์ให้สื่อความหมาย

### 2. อัปเดตการกำหนดค่า
แก้ไขไฟล์ `src/app/admin/documents/html-templates/page.tsx`:

```typescript
const HTML_TEMPLATES: HtmlTemplate[] = [
  // เทมเพลตเดิม...
  {
    id: 'new-template-id',
    name: 'ชื่อเทมเพลตใหม่',
    path: 'document-templates/path/to/template.html',
    description: 'คำอธิบายเทมเพลต',
    category: 'หมวดหมู่',
    fields: [
      {
        id: 'field_id',
        name: 'ชื่อฟิลด์',
        type: 'text',
        placeholder: 'ตัวอย่าง',
        required: true
      }
      // ฟิลด์อื่นๆ...
    ]
  }
]
```

## การแก้ไขปัญหา

### 1. ไฟล์เทมเพลตไม่โหลด
- ตรวจสอบ path ของไฟล์
- ตรวจสอบสิทธิ์การอ่านไฟล์
- ตรวจสอบ encoding ของไฟล์ (ควรเป็น UTF-8)

### 2. ฟอนต์ภาษาไทยไม่แสดง
- เพิ่ม Google Fonts หรือฟอนต์ภาษาไทย
- ตรวจสอบ CSS font-family

### 3. การพิมพ์ไม่ถูกต้อง
- ตรวจสอบ CSS @media print
- ปรับขนาดหน้ากระดาษใน CSS

## ข้อมูลเพิ่มเติม

### Browser Support
- Chrome/Edge: ✅ รองรับเต็มรูปแบบ
- Firefox: ✅ รองรับเต็มรูปแบบ
- Safari: ✅ รองรับเต็มรูปแบบ

### File Size Recommendations
- HTML Template: < 1MB
- Generated Document: < 2MB

### Security Considerations
- ไฟล์เทมเพลตควรอยู่ในโฟลเดอร์ที่กำหนด
- ตรวจสอบ input จากผู้ใช้
- จำกัดการเข้าถึงเฉพาะผู้ใช้ที่มีสิทธิ์

## การพัฒนาต่อ

### 1. เพิ่มฟีเจอร์
- [ ] แปลงเป็น PDF อัตโนมัติ
- [ ] ระบบอนุมัติเอกสาร
- [ ] การแจ้งเตือนทางอีเมล
- [ ] ประวัติการแก้ไข

### 2. ปรับปรุงประสิทธิภาพ
- [ ] Cache เทมเพลต
- [ ] Lazy loading
- [ ] Compression

### 3. UI/UX
- [ ] Drag & Drop สำหรับอัปโหลด
- [ ] Real-time preview
- [ ] Mobile responsive

---

สร้างโดย: ระบบจัดการฝึกงาน InternshipFlow
วันที่: ${new Date().toLocaleDateString('th-TH')}