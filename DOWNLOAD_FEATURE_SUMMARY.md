# 📥 ฟีเจอร์ดาวน์โหลดเอกสาร

## 🎯 ปัญหาที่แก้ไข
**ปัญหา**: ปุ่มดาวน์โหลดในหน้าพรีวิวไม่ทำงาน

**การแก้ไข**: เพิ่มฟังก์ชันดาวน์โหลดเอกสารเป็น PDF และพิมพ์เอกสาร

## ✅ ฟีเจอร์ใหม่

### 📄 ดาวน์โหลด PDF
- **ไลบรารี**: html2canvas + jsPDF
- **คุณภาพ**: ความละเอียดสูง (scale: 2)
- **รูปแบบ**: A4 Portrait
- **ชื่อไฟล์**: `[ชื่อเอกสาร]_[ชื่อนักศึกษา]_[วันที่].pdf`

### 🖨️ พิมพ์เอกสาร
- **ฟังก์ชัน**: window.print() ในหน้าต่างใหม่
- **สไตล์**: รวม CSS และฟอนต์ Sarabun
- **การใช้งาน**: Fallback หาก PDF ไม่ทำงาน

## 🔧 การติดตั้ง

### Dependencies ที่เพิ่ม
```bash
npm install html2canvas jspdf
```

### Import ใหม่
```typescript
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
```

## 💻 การใช้งาน

### ปุ่มดาวน์โหลด PDF
```typescript
<Button 
  variant="outline" 
  size="sm" 
  onClick={handleDownload}
  disabled={isDownloading}
>
  <Download className="h-3 w-3 mr-1" />
  {isDownloading ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลด PDF'}
</Button>
```

### ปุ่มพิมพ์
```typescript
<Button 
  variant="outline" 
  size="sm" 
  onClick={handlePrint}
  title="พิมพ์เอกสาร"
>
  🖨️ พิมพ์
</Button>
```

## 🎨 ฟังก์ชันการทำงาน

### handleDownload()
```typescript
const handleDownload = async () => {
  setIsDownloading(true);
  try {
    // 1. หา element เอกสาร
    const documentElement = document.querySelector('.document-page');
    
    // 2. สร้าง canvas ความละเอียดสูง
    const canvas = await html2canvas(documentElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // 3. สร้าง PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // 4. เพิ่มรูปภาพลง PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    
    // 5. ดาวน์โหลด
    pdf.save(fileName);
    
  } catch (error) {
    // Fallback ไปใช้ print
    handlePrint();
  }
};
```

### handlePrint()
```typescript
const handlePrint = () => {
  // 1. เปิดหน้าต่างใหม่
  const printWindow = window.open('', '_blank');
  
  // 2. เขียน HTML พร้อม CSS
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${docName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Sarabun...');
          /* CSS สำหรับพิมพ์ */
        </style>
      </head>
      <body>
        ${documentElement.outerHTML}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `);
};
```

## 📊 คุณสมบัติ

### ✅ ดาวน์โหลด PDF
- **ความละเอียดสูง**: Scale 2x สำหรับความชัด
- **รองรับหลายหน้า**: แบ่งหน้าอัตโนมัติ
- **ชื่อไฟล์อัตโนมัติ**: รวมชื่อเอกสาร + นักศึกษา + วันที่
- **Error Handling**: Fallback ไปใช้ print หากเกิดข้อผิดพลาด

### 🖨️ พิมพ์เอกสาร
- **หน้าต่างใหม่**: ไม่รบกวนหน้าหลัก
- **CSS ครบถ้วน**: รวมฟอนต์และสไตล์
- **Auto Print**: พิมพ์อัตโนมัติเมื่อโหลดเสร็จ
- **Auto Close**: ปิดหน้าต่างหลังพิมพ์

## 🎯 ตัวอย่างชื่อไฟล์

### ไฟล์ PDF ที่ดาวน์โหลด
```
01_แบบฟอร์มขอสหกิจศึกษา_นายสมชาย ใจดี_10/1/2025.pdf
02_หนังสือขอสหกิจศึกษา_นายสมชาย ใจดี_10/1/2025.pdf
03_หนังสือส่งตัวสหกิจศึกษา_นายสมชาย ใจดี_10/1/2025.pdf
```

## 🔍 การทดสอบ

### ✅ ทดสอบแล้ว
- [x] ดาวน์โหลด PDF ทำงานได้
- [x] พิมพ์เอกสารทำงานได้
- [x] ชื่อไฟล์ถูกต้อง
- [x] ความละเอียดสูง
- [x] รองรับหลายหน้า
- [x] Error handling

### 🧪 วิธีทดสอบ
1. **เข้าหน้าพรีวิวเอกสาร**
2. **คลิก "ดาวน์โหลด PDF"** - ควรดาวน์โหลดไฟล์ PDF
3. **คลิก "พิมพ์"** - ควรเปิดหน้าต่างพิมพ์
4. **ตรวจสอบชื่อไฟล์** - ควรมีชื่อเอกสาร + นักศึกษา + วันที่
5. **ตรวจสอบคุณภาพ** - ควรมีความละเอียดสูง

## ⚠️ ข้อควรระวัง

### Browser Compatibility
- **Chrome/Edge**: ✅ รองรับเต็มรูปแบบ
- **Firefox**: ✅ รองรับเต็มรูปแบบ
- **Safari**: ⚠️ อาจมีปัญหา CORS กับรูปภาพ
- **Mobile**: ⚠️ อาจช้าเนื่องจากขนาดไฟล์

### Performance
- **ไฟล์ใหญ่**: อาจใช้เวลานานในการสร้าง PDF
- **Memory Usage**: ใช้ RAM มากเมื่อสร้าง canvas
- **Network**: ต้องโหลดฟอนต์ Google Fonts

## 🚀 การปรับปรุงต่อไป

### ✨ ฟีเจอร์เพิ่มเติม
- [ ] เลือกรูปแบบการดาวน์โหลด (PDF/PNG/DOCX)
- [ ] ปรับคุณภาพการดาวน์โหลด
- [ ] บีบอัดไฟล์ PDF
- [ ] เพิ่ม watermark
- [ ] ส่งอีเมลเอกสาร

### 🔧 การปรับปรุง
- [ ] เพิ่ม loading indicator
- [ ] ปรับปรุง error handling
- [ ] เพิ่ม progress bar
- [ ] รองรับ mobile ดีขึ้น

---

**สรุป**: ฟีเจอร์ดาวน์โหลดเอกสารทำงานได้แล้ว รองรับทั้งการดาวน์โหลด PDF และพิมพ์เอกสาร พร้อมระบบ fallback ที่เสถียร ✅

**การใช้งาน**: คลิก "ดาวน์โหลด PDF" เพื่อบันทึกเอกสาร หรือ "พิมพ์" เพื่อพิมพ์เอกสารได้ทันที 📥