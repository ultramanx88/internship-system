// เทมเพลตแบบฟอร์มสหกิจศึกษาแยกต่างหาก
// ไม่ต้องตามรูปแบบเทมเพลตปกติ

export const COOP_FORM_TEMPLATE = {
  title: "แบบแจ้งสถานที่ฝึกประสบการณ์สหกิจศึกษา (Co-operative Education)",
  content: `
<div class="coop-document">
  <!-- ส่วนหัวแบบฟอร์ม -->
  <div class="coop-header">
    <div class="university-title">มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา</div>
    <div class="form-main-title">แบบแจ้งสถานที่ฝึกประสบการณ์สหกิจศึกษา (Co-operative Education) {{academicYear}}</div>
  </div>
  
  <!-- ส่วนที่ 1 -->
  <div class="section-divider">
    <div class="section-title-box">
      <span class="section-title">ส่วนที่ ๑</span>
    </div>
  </div>
  
  <div class="form-body">
    <div class="form-item">
      <span class="item-num">๑.</span>
      <span class="item-text">ชื่อนักศึกษา</span>
      <span class="fill-blank long">{{studentName}}</span>
      <span class="item-text">รหัส</span>
      <span class="fill-blank medium">{{studentId}}</span>
    </div>
    
    <div class="form-item">
      <span class="item-num">๒.</span>
      <span class="item-text">ชื่อนักศึกษา</span>
      <span class="fill-blank long">{{studentName2}}</span>
      <span class="item-text">รหัส</span>
      <span class="fill-blank medium">{{studentId2}}</span>
    </div>
    
    <div class="form-item">
      <span class="item-text">ระดับ :</span>
      <span class="static-info">ปริญญาตรี หลักสูตรการจัดการธุรกิจระหว่างประเทศ ชั้นปีที่ {{year}} คณะบริหารธุรกิจและศิลปศาสตร์</span>
    </div>
    
    <div class="form-item">
      <span class="item-text">เบอร์โทรศัพท์</span>
      <span class="fill-blank medium">{{phoneNumber}}</span>
      <span class="item-text">อีเมล์</span>
      <span class="fill-blank extra-long">{{studentEmail}}</span>
    </div>
  </div>
  
  <!-- ส่วนที่ 2 -->
  <div class="section-divider">
    <div class="section-title-box">
      <span class="section-title">ส่วนที่ ๒</span>
    </div>
  </div>
  
  <div class="form-body">
    <div class="form-item">
      <span class="item-num">๑.</span>
      <span class="item-text">ชื่อสถานประกอบการ</span>
      <span class="fill-blank full-width">{{companyName}}</span>
    </div>
    
    <div class="form-item">
      <span class="item-num">๒.</span>
      <span class="item-text">ชื่อหัวหน้าหน่วยงาน</span>
      <span class="fill-blank full-width">{{supervisorName}}</span>
    </div>
    
    <div class="form-item">
      <span class="item-num">๓.</span>
      <span class="item-text">ตำแหน่ง</span>
      <span class="fill-blank full-width">{{position}}</span>
    </div>
    
    <div class="form-item">
      <span class="item-num">๔.</span>
      <span class="item-text">ที่อยู่สถานประกอบการ</span>
      <span class="fill-blank full-width">{{companyAddress}}</span>
    </div>
    
    <div class="form-item">
      <span class="item-num">๕.</span>
      <span class="item-text">เบอร์โทรศัพท์</span>
      <span class="fill-blank medium">{{companyPhone}}</span>
      <span class="item-text">โทรสาร</span>
      <span class="fill-blank medium">{{companyFax}}</span>
    </div>
    
    <div class="form-item">
      <span class="item-num">๖.</span>
      <span class="item-text">ประเภทของกิจการ</span>
      <span class="fill-blank full-width">{{businessType}}</span>
    </div>
    
    <div class="form-item">
      <span class="item-num">๗.</span>
      <span class="item-text">แผนกที่นักศึกษาฝึกประสบการณ์</span>
      <span class="fill-blank full-width">{{department}}</span>
    </div>
    
    <div class="form-item">
      <span class="item-num">๘.</span>
      <span class="item-text">ลักษณะงาน</span>
      <span class="fill-blank full-width">{{jobDescription}}</span>
    </div>
    
    <div class="job-detail-area">
      <div class="job-line"></div>
    </div>
    
    <div class="form-item map-item">
      <span class="item-num">๙.</span>
      <span class="item-text">แผนที่</span>
    </div>
    
    <div class="map-container">
      <div class="map-frame">
        [แผนที่หรือเส้นทางไปสถานประกอบการ]
      </div>
    </div>
  </div>
</div>
  `,
};

// CSS สำหรับแบบฟอร์มสหกิจศึกษา
export const COOP_FORM_CSS = `
  .coop-document {
    font-family: 'Sarabun', 'TH SarabunPSK', Arial, sans-serif;
    font-size: 19px; /* เพิ่มจาก 17px เป็น 19px */
    line-height: 1.8; /* เพิ่มจาก 1.7 เป็น 1.8 */
    color: #000;
    padding: 5mm 20mm 5mm 25mm;
    background: white;
    border: none;
    max-width: 210mm;
    min-height: auto;
    margin: 0 auto;
    box-shadow: none;
  }
  
  .coop-header {
    text-align: center;
    margin-bottom: 20px;
    margin-top: -10px; /* ดึงส่วนหัวขึ้นไปใกล้โลโก้มากขึ้น */
  }
  
  .university-title {
    font-size: 22px; /* เพิ่มจาก 20px เป็น 22px */
    font-weight: bold;
    margin-bottom: 6px;
    margin-top: -2px;
  }
  
  .form-main-title {
    font-size: 20px; /* เพิ่มจาก 18px เป็น 20px */
    font-weight: bold;
    margin-bottom: 15px;
    margin-top: 5px;
  }
  
  .section-divider {
    text-align: left; /* เปลี่ยนจาก center เป็น left เพื่อให้ชิดซ้าย */
    margin: 25px 0 20px 0; /* ลดระยะห่าง */
  }
  
  .section-title-box {
    border: 2px solid #000;
    display: inline-block;
    padding: 0;
  }
  
  .section-title {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 35px;
    font-weight: bold;
    font-size: 20px; /* เพิ่มจาก 18px เป็น 20px */
    background: white;
    text-align: center;
  }
  
  .form-body {
    margin: 20px 0;
  }
  
  .form-item {
    margin-bottom: 15px; /* ลดจาก 18px เป็น 15px */
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 6px; /* ลดจาก 8px เป็น 6px */
    line-height: 1.8; /* ลดจาก 2 เป็น 1.8 */
  }
  
  .item-num {
    font-weight: bold;
    min-width: 25px;
    font-size: 19px; /* เพิ่มจาก 17px เป็น 19px */
  }
  
  .item-text {
    font-size: 19px; /* เพิ่มจาก 17px เป็น 19px */
    margin-right: 6px;
  }
  
  .static-info {
    font-size: 19px; /* เพิ่มจาก 17px เป็น 19px */
    line-height: 1.9; /* เพิ่มจาก 1.8 เป็น 1.9 */
  }
  
  .fill-blank {
    border-bottom: 1px dotted #000;
    display: inline-block;
    min-height: 26px; /* เพิ่มจาก 24px เป็น 26px */
    padding: 5px 9px; /* เพิ่มจาก 4px 8px เป็น 5px 9px */
    font-weight: bold;
    margin: 0 4px;
    background: transparent;
    font-size: 18px; /* เพิ่มจาก 16px เป็น 18px */
  }
  
  .fill-blank.medium {
    min-width: 150px;
  }
  
  .fill-blank.long {
    min-width: 200px;
  }
  
  .fill-blank.extra-long {
    min-width: 280px;
  }
  
  .fill-blank.full-width {
    min-width: 400px;
  }
  
  .address-area,
  .job-detail-area {
    margin: 15px 0 20px 45px;
  }
  
  .address-line,
  .job-line {
    border-bottom: 1px dotted #000;
    width: 100%;
    min-height: 28px; /* เพิ่มจาก 26px เป็น 28px */
    margin: 8px 0;
    padding: 4px 8px; /* เพิ่มจาก 3px 7px เป็น 4px 8px */
    font-weight: bold;
    font-size: 16px; /* เพิ่มจาก 14px เป็น 16px */
  }
  
  .map-item {
    page-break-before: always; /* บังคับให้หัวข้อแผนที่ขึ้นหน้าใหม่ */
  }
  
  .map-container {
    margin: 25px 0;
    text-align: center;
  }
  
  .map-frame {
    border: 2px solid #000;
    height: 400px; /* เพิ่มจาก 320px เป็น 400px เพื่อให้สูงขึ้นอีก */
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9f9f9;
    color: #666;
    font-style: italic;
    font-size: 17px;
  }
  
  /* Print Styles */
  @media print {
    .coop-document {
      box-shadow: none !important;
      border: none !important;
      margin: 0;
      padding: 3mm 15mm 3mm 20mm; /* ลด padding-bottom อีกเพื่อป้องกันหน้าเปล่า */
      font-size: 15px;
      line-height: 1.5; /* ลด line-height เพื่อประหยัดพื้นที่ */
      page-break-inside: avoid;
      page-break-after: avoid;
      min-height: auto; /* ไม่บังคับความสูงขั้นต่ำ */
    }
    
    .coop-header {
      margin-top: -5mm; /* ดึงส่วนหัวขึ้นไปใกล้โลโก้มากขึ้นสำหรับการปริ้น */
      margin-bottom: 15px;
    }
    
    .university-title {
      margin-top: -2mm; /* ดึงชื่อมหาวิทยาลัยขึ้นไปใกล้โลโก้สำหรับการปริ้น */
      margin-bottom: 4px;
    }
    
    body {
      margin: 0 !important;
      padding: 0 !important;
    }
    
    .coop-document:last-child {
      page-break-after: avoid;
    }
    
    /* จัดการหน้าสำหรับการปริ้น */
    .map-item {
      page-break-before: always; /* บังคับให้หัวข้อแผนที่ขึ้นหน้าใหม่ */
    }
    
    .map-container {
      page-break-inside: avoid;
      page-break-after: avoid; /* ป้องกันหน้าเปล่าหลังแผนที่ */
      margin: 15px 0 0 0; /* ลด margin-bottom เป็น 0 */
    }
    
    .map-frame {
      page-break-inside: avoid;
      height: 250px; /* เพิ่มความสูงสำหรับการปริ้น */
    }
    
    /* ลดระยะห่างทั่วไปสำหรับการปริ้น */
    .form-item {
      margin-bottom: 10px;
    }
    
    .section-divider {
      margin: 15px 0 10px 0;
    }
    
    .section-title-box {
      border: 1px solid #000;
    }
    
    .map-frame {
      border: 1px solid #000;
    }
    
    .university-title {
      font-size: 16px; /* เพิ่มจาก 14px เป็น 16px */
    }
    
    .form-main-title {
      font-size: 14px; /* เพิ่มจาก 12px เป็น 14px */
    }
    
    .section-title {
      font-size: 14px; /* เพิ่มจาก 12px เป็น 14px */
    }
    
    .item-num,
    .item-text,
    .static-info {
      font-size: 13px; /* เพิ่มจาก 12px เป็น 13px */
    }
    
    .fill-blank,
    .address-line,
    .job-line {
      font-size: 12px; /* เพิ่มจาก 11px เป็น 12px */
    }
  }
  
  /* PDF Export Styles */
  .coop-document.pdf-export {
    border: none !important;
    box-shadow: none !important;
    margin: 0;
    padding: 3mm 15mm 3mm 20mm; /* ลด padding-bottom อีกเพื่อป้องกันหน้าเปล่า */
    font-size: 14px;
    line-height: 1.4; /* ลด line-height เพื่อประหยัดพื้นที่ */
    page-break-inside: avoid;
    page-break-after: avoid;
    min-height: auto; /* ไม่บังคับความสูงขั้นต่ำ */
  }
  
  .pdf-export .coop-header {
    margin-top: -5mm; /* ดึงส่วนหัวขึ้นไปใกล้โลโก้มากขึ้นสำหรับ PDF export */
    margin-bottom: 12px;
  }
  
  .pdf-export .university-title {
    margin-top: -2mm; /* ดึงชื่อมหาวิทยาลัยขึ้นไปใกล้โลโก้สำหรับ PDF export */
    margin-bottom: 4px;
  }
  
  .pdf-export .university-title {
    font-size: 16px; /* เพิ่มจาก 14px เป็น 16px */
  }
  
  .pdf-export .form-main-title {
    font-size: 14px; /* เพิ่มจาก 12px เป็น 14px */
  }
  
  .pdf-export .section-title {
    font-size: 14px; /* เพิ่มจาก 12px เป็น 14px */
  }
  
  .pdf-export .item-num,
  .pdf-export .item-text,
  .pdf-export .static-info {
    font-size: 12px; /* เพิ่มจาก 11px เป็น 12px */
  }
  
  .pdf-export .fill-blank,
  .pdf-export .address-line,
  .pdf-export .job-line {
    font-size: 11px; /* เพิ่มจาก 10px เป็น 11px */
  }
  
  .pdf-export {
    border: none !important;
    box-shadow: none !important;
  }
  
  /* จัดการหน้าสำหรับ PDF export */
  .pdf-export .map-item {
    page-break-before: always; /* บังคับให้หัวข้อแผนที่ขึ้นหน้าใหม่ */
  }
  
  .pdf-export .map-container {
    page-break-inside: avoid;
    page-break-after: avoid; /* ป้องกันหน้าเปล่าหลังแผนที่ */
    margin: 15px 0 0 0; /* ลด margin-bottom เป็น 0 */
  }
  
  .pdf-export .map-frame {
    page-break-inside: avoid;
    height: 250px; /* เพิ่มความสูงสำหรับ PDF export */
  }
  
  /* ลดระยะห่างทั่วไปสำหรับ PDF export */
  .pdf-export .form-item {
    margin-bottom: 8px;
  }
  
  .pdf-export .section-divider {
    margin: 12px 0 8px 0;
  }
`;

// ฟังก์ชันแทนที่ตัวแปรในแบบฟอร์มสหกิจศึกษา
export function replaceCoopFormVariables(
  html: string,
  variables: Record<string, string>
): string {
  let result = html;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, value || `[${key}]`);
  });

  return result;
}
