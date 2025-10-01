const fs = require('fs');
const path = require('path');

// สร้างเทมเพลต HTML ที่เหมือนต้นฉบับ
function createBetterTemplates() {
  const templates = {
    internship: {
      th: {
        request_letter: {
          title: 'หนังสือขอความอนุเคราะห์รับนักศึกษาฝึกงาน',
          content: `
<div class="document-page">
  <div class="document-header">
    <div class="doc-number-date">
      <span class="doc-number">ที่ {{documentNumber}}</span>
      <span class="doc-date">วันที่ {{documentDate}}</span>
    </div>
  </div>
  
  <div class="document-subject">
    <strong>เรื่อง</strong> ขอความอนุเคราะห์รับนักศึกษาฝึกงานในสถานประกอบการ
  </div>
  
  <div class="document-recipient">
    <strong>เรียน</strong> {{recipientTitle}}<br>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{companyName}}
  </div>
  
  <div class="document-attachment">
    <strong>สิ่งที่ส่งมาด้วย</strong> หนังสือตอบรับนักศึกษาฝึกงานในสถานประกอบการ จำนวน ๑ ฉบับ
  </div>
  
  <div class="document-body">
    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ด้วย {{facultyName}} {{universityName}} มีความประสงค์ให้นักศึกษาระดับปริญญาตรี หลักสูตรการจัดการธุรกิจระหว่างประเทศ ได้มีโอกาสเข้าฝึกงานในหน่วยงานของท่าน ในรายวิชา Job Internship in Business Management ซึ่งเป็นการจัดให้มีการบูรณาการการเรียนของนักศึกษากับการปฏิบัติงานเพื่อหาประสบการณ์จริงจากสถานประกอบการ</p>
    
    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ในการนี้ {{facultyName}} ได้พิจารณาแล้วเห็นว่าการเข้าฝึกงานในสถานประกอบการของท่านจะเกิดประโยชน์แก่นักศึกษาเป็นอย่างมาก จึงใคร่ขอความอนุเคราะห์ท่านรับนักศึกษาเข้าฝึกงานในสถานประกอบการ ภาคการศึกษาที่ ๒ ปีการศึกษา {{academicYear}} ระหว่างวันที่ {{startDate}} ถึงวันที่ {{endDate}} โดยคณะฯ กำหนดให้นักศึกษาฝึกงานในสถานประกอบการในฐานะพนักงานเต็มเวลา</p>
    
    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ หากผลการพิจารณาเป็นประการใด กรุณาส่งหนังสือตอบรับที่แนบมาพร้อมนี้กลับมายัง {{programName}} {{facultyName}} {{universityName}}</p>
  </div>
  
  <div class="document-signature">
    <div class="signature-right">
      <div>ขอแสดงความนับถือ</div>
      <br><br><br>
      <div>({{deanName}})</div>
      <div>คณบดี{{facultyName}}</div>
    </div>
  </div>
  
  <div class="document-footer">
    <div>{{programName}}</div>
    <div>โทรศัพท์ {{contactPhone}}</div>
    <div>({{coordinatorName}} ผู้ประสานงาน)</div>
  </div>
</div>
          `
        },
        
        introduction_letter: {
          title: 'หนังสือส่งตัวนักศึกษาฝึกงาน',
          content: `
<div class="document-page">
  <div class="document-header">
    <div class="doc-number-date">
      <span class="doc-number">ที่ {{documentNumber}}</span>
      <span class="doc-date">วันที่ {{documentDate}}</span>
    </div>
  </div>
  
  <div class="document-subject">
    <strong>เรื่อง</strong> ขอส่งตัวนักศึกษาฝึกงานในสถานประกอบการ
  </div>
  
  <div class="document-recipient">
    <strong>เรียน</strong> {{recipientTitle}}<br>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{companyName}}
  </div>
  
  <div class="document-attachment">
    <strong>สิ่งที่ส่งมาด้วย</strong> ๑. รายชื่อนักศึกษาฝึกงานในสถานประกอบการ จำนวน ๑ ฉบับ
  </div>
  
  <div class="document-body">
    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ตามที่ท่านได้ให้ความอนุเคราะห์รับนักศึกษาหลักสูตรการจัดการธุรกิจระหว่างประเทศ {{facultyName}} {{universityName}} เข้ารับการฝึกงานในสถานประกอบการของท่าน นั้น</p>
    
    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;คณะขอส่งตัวนักศึกษาฝึกงานในสถานประกอบการ จำนวน ๑ ราย เพื่อรายงานตัวเข้ารับการฝึกงาน ในภาคเรียนที่ ๒ ปีการศึกษา {{academicYear}} ระหว่างวันที่ {{startDate}} ถึงวันที่ {{endDate}}</p>
    
    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;หากการฝึกงานในสถานประกอบการของนักศึกษาสิ้นสุดลง ขอความอนุเคราะห์สถานประกอบการประเมินผลการฝึกงานของนักศึกษา และนำส่งกลับมายัง {{programName}} {{facultyName}} {{universityName}} โดยปิดผนึกฝากกับนักศึกษา หรือส่งผ่านไปรษณีย์อิเล็กทรอนิกส์ sjariangprasert@gmail.com ภายในเวลา ๗ วันหลังจากนักศึกษาฝึกงานเสร็จสิ้น หากมีข้อสงสัยเกี่ยวข้องกับการฝึกงานในครั้งนี้ สามารถติดต่อประสานงานกับอาจารย์ศิวพร ศิริกมล หมายเลขโทรศัพท์ {{contactPhone}}</p>
    
    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;คณะขอขอบคุณที่ท่านได้กรุณารับนักศึกษาเข้าฝึกงานในสถานประกอบการของท่าน และหวังเป็นอย่างยิ่งว่าจะได้รับความอนุเคราะห์จากท่านอีกในโอกาสต่อไป</p>
  </div>
  
  <div class="document-signature">
    <div class="signature-right">
      <div>ขอแสดงความนับถือ</div>
      <br><br><br>
      <div>({{deanName}})</div>
      <div>คณบดี{{facultyName}}</div>
    </div>
  </div>
  
  <div class="document-footer">
    <div>{{programName}}</div>
    <div>โทรศัพท์ {{contactPhone}}</div>
    <div>({{coordinatorName}} ผู้ประสานงาน)</div>
  </div>
  
  <div class="student-list">
    <div class="list-header">
      <div>สถานประกอบการ {{companyName}}</div>
      <div>{{companyAddress}}</div>
      <br>
      <div><strong>รายชื่อนักศึกษาที่เข้ารับการฝึกงาน จำนวน ๑ ราย</strong></div>
      <div>๑. {{studentName}}</div>
    </div>
  </div>
</div>
          `
        }
      }
    },
    
    co_op: {
      th: {
        application_form: {
          title: 'แบบแจ้งสถานที่ฝึกประสบการณ์สหกิจศึกษา',
          content: `
<div class="document-page">
  <div class="form-header">
    <div class="university-title">มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา</div>
    <div class="form-title">แบบแจ้งสถานที่ฝึกประสบการณ์สหกิจศึกษา (Co-operative Education) {{academicYear}}</div>
  </div>
  
  <div class="section-divider">
    <div class="section-box">
      <div class="section-header">ส่วนที่ ๑</div>
    </div>
  </div>
  
  <div class="form-section">
    <div class="form-row">
      <span class="number">๑.</span>
      <span class="label">ชื่อนักศึกษา</span>
      <span class="underline-field">{{studentName}}</span>
      <span class="label">รหัส</span>
      <span class="underline-field">{{studentId}}</span>
    </div>
    
    <div class="form-row">
      <span class="number">๒.</span>
      <span class="label">ชื่อนักศึกษา</span>
      <span class="underline-field">{{studentName}}</span>
      <span class="label">รหัส</span>
      <span class="underline-field">{{studentId}}</span>
    </div>
    
    <div class="form-row">
      <span class="label">ระดับ :</span>
      <span class="text">ปริญญาตรี หลักสูตรการจัดการธุรกิจระหว่างประเทศ ชั้นปีที่ {{year}} คณะบริหารธุรกิจและศิลปศาสตร์</span>
    </div>
    
    <div class="form-row">
      <span class="label">เบอร์โทรศัพท์</span>
      <span class="underline-field">{{phoneNumber}}</span>
      <span class="label">อีเมล์</span>
      <span class="underline-field">{{studentEmail}}</span>
    </div>
  </div>
  
  <div class="section-divider">
    <div class="section-box">
      <div class="section-header">ส่วนที่ ๒</div>
    </div>
  </div>
  
  <div class="form-section">
    <div class="form-row">
      <span class="number">๑.</span>
      <span class="label">ชื่อสถานประกอบการ</span>
      <span class="underline-field-long">{{companyName}}</span>
    </div>
    
    <div class="form-row">
      <span class="number">๒.</span>
      <span class="label">ชื่อหัวหน้าหน่วยงาน</span>
      <span class="underline-field-long">{{supervisorName}}</span>
    </div>
    
    <div class="form-row">
      <span class="number">๓.</span>
      <span class="label">ตำแหน่ง</span>
      <span class="underline-field-long">{{position}}</span>
    </div>
    
    <div class="form-row">
      <span class="number">๔.</span>
      <span class="label">ที่อยู่สถานประกอบการ</span>
    </div>
    <div class="address-lines">
      <div class="underline-full">{{companyAddress}}</div>
      <div class="underline-full"></div>
    </div>
    
    <div class="form-row">
      <span class="number">๕.</span>
      <span class="label">เบอร์โทรศัพท์</span>
      <span class="underline-field">{{companyPhone}}</span>
      <span class="label">โทรสาร</span>
      <span class="underline-field">{{companyFax}}</span>
    </div>
    
    <div class="form-row">
      <span class="number">๖.</span>
      <span class="label">ประเภทของกิจการ</span>
      <span class="underline-field-long">{{businessType}}</span>
    </div>
    
    <div class="form-row">
      <span class="number">๗.</span>
      <span class="label">แผนกที่นักศึกษาฝึกประสบการณ์</span>
      <span class="underline-field-long">{{department}}</span>
    </div>
    
    <div class="form-row">
      <span class="number">๘.</span>
      <span class="label">ลักษณะงาน</span>
      <span class="underline-field-long">{{jobDescription}}</span>
    </div>
    <div class="job-description-lines">
      <div class="underline-full"></div>
      <div class="underline-full"></div>
    </div>
    
    <div class="form-row">
      <span class="number">๙.</span>
      <span class="label">แผนที่</span>
    </div>
    
    <div class="map-section">
      <div class="map-placeholder">
        [แผนที่หรือเส้นทางไปสถานประกอบการ]
      </div>
    </div>
  </div>
</div>
          `
        },
        
        request_letter: {
          title: 'หนังสือขอความอนุเคราะห์รับนักศึกษาปฏิบัติงานสหกิจศึกษา',
          content: `
<div class="document-page">
  <div class="document-header">
    <div class="doc-number-date">
      <span class="doc-number">ที่ {{documentNumber}}</span>
      <span class="doc-date">วันที่ {{documentDate}}</span>
    </div>
  </div>
  
  <div class="document-subject">
    <strong>เรื่อง</strong> ขอความอนุเคราะห์รับนักศึกษาปฏิบัติงานสหกิจศึกษา
  </div>
  
  <div class="document-recipient">
    <strong>เรียน</strong> {{recipientTitle}}<br>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{companyName}}
  </div>
  
  <div class="document-attachment">
    <strong>สิ่งที่ส่งมาด้วย</strong> หนังสือตอบรับนักศึกษาปฏิบัติงานสหกิจศึกษา จำนวน ๑ ฉบับ
  </div>
  
  <div class="document-body">
    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ด้วย {{facultyName}} {{universityName}} มีความประสงค์ให้นักศึกษาระดับปริญญาตรี หลักสูตรการจัดการธุรกิจระหว่างประเทศ ได้มีโอกาสเข้าปฏิบัติงานสหกิจศึกษาในหน่วยงานของท่าน ในรายวิชา Co-Operative Education in Business Administration ซึ่งเป็นการจัดให้มีการบูรณาการการเรียนของนักศึกษากับการปฏิบัติงานเพื่อหาประสบการณ์จริงจากสถานประกอบการ</p>
    
    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ในการนี้ คณะได้พิจารณาแล้วเห็นว่าการเข้าปฏิบัติงานสหกิจศึกษาในหน่วยงานของท่านจะเกิดประโยชน์แก่นักศึกษาเป็นอย่างยิ่ง ดังนั้น คณะจึงขอความอนุเคราะห์ท่านรับนักศึกษาปฏิบัติงานสหกิจศึกษาในภาคการศึกษาที่ ๒ ปีการศึกษา {{academicYear}} ตั้งแต่วันที่ {{startDate}} ถึงวันที่ {{endDate}} โดยคณะกำหนดให้นักศึกษาออกปฏิบัติงานสหกิจศึกษาในสถานประกอบการในฐานะพนักงานเต็มเวลา และระหว่างการปฏิบัติงานสหกิจศึกษานั้น นักศึกษาต้องจัดทำโครงงาน ๑ เรื่อง เพื่อให้เป็นไปตามข้อกำหนดของหลักสูตร</p>
    
    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ หากผลการพิจารณาเป็นประการใด กรุณาส่งหนังสือตอบรับที่แนบมาพร้อมนี้กลับมายัง {{programName}} {{facultyName}} {{universityName}}</p>
  </div>
  
  <div class="document-signature">
    <div class="signature-right">
      <div>ขอแสดงความนับถือ</div>
      <br><br><br>
      <div>({{deanName}})</div>
      <div>คณบดี{{facultyName}}</div>
    </div>
  </div>
  
  <div class="document-footer">
    <div>{{programName}}</div>
    <div>โทรศัพท์ {{contactPhone}}</div>
    <div>({{coordinatorName}} ผู้ประสานงาน)</div>
  </div>
</div>
          `
        },
        
        introduction_letter: {
          title: 'หนังสือส่งตัวนักศึกษาฝึกปฏิบัติงานสหกิจศึกษา',
          content: `
<div class="document-page">
  <div class="document-header">
    <div class="doc-number-date">
      <span class="doc-number">ที่ {{documentNumber}}</span>
      <span class="doc-date">วันที่ {{documentDate}}</span>
    </div>
  </div>
  
  <div class="document-subject">
    <strong>เรื่อง</strong> ขอส่งตัวนักศึกษาฝึกปฏิบัติงานสหกิจศึกษา
  </div>
  
  <div class="document-recipient">
    <strong>เรียน</strong> {{recipientTitle}}<br>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{companyName}}
  </div>
  
  <div class="document-attachment">
    <strong>สิ่งที่ส่งมาด้วย</strong> ๑. รายชื่อนักศึกษาฝึกปฏิบัติงานสหกิจศึกษา จำนวน ๑ ฉบับ
  </div>
  
  <div class="document-body">
    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ตามที่ท่านได้ให้ความอนุเคราะห์รับนักศึกษาหลักสูตรการจัดการธุรกิจระหว่างประเทศ {{facultyName}} {{universityName}} เข้ารับการฝึกปฏิบัติงานสหกิจศึกษาในหน่วยงานของท่าน นั้น</p>
    
    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;คณะขอส่งตัวนักศึกษาฝึกปฏิบัติงานสหกิจศึกษา จำนวน ๑ ราย เพื่อรายงานตัวเข้ารับการฝึกปฏิบัติงานสหกิจศึกษา ในภาคเรียนที่ ๒ ปีการศึกษา {{academicYear}} ระหว่างวันที่ {{startDate}} ถึงวันที่ {{endDate}} หากการปฏิบัติงานสหกิจศึกษาของนักศึกษาสิ้นสุดลง ขอความอนุเคราะห์สถานประกอบการประเมินผลการปฏิบัติงานสหกิจศึกษาของนักศึกษา และนำส่งกลับมายัง {{programName}} {{facultyName}} {{universityName}} โดยปิดผนึกฝากกับนักศึกษา หรือส่งผ่านไปรษณีย์อิเล็กทรอนิกส์ sjariangprasert@gmail.com ภายในเวลา ๗ วันหลังจากนักศึกษาฝึกงานเสร็จสิ้น หากมีข้อสงสัยเกี่ยวข้องกับการฝึกงานในครั้งนี้ สามารถติดต่อประสานงานกับอาจารย์ศิวพร ศิริกมล หมายเลขโทรศัพท์ {{contactPhone}}</p>
    
    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;คณะขอขอบคุณที่ท่านได้กรุณารับนักศึกษาเข้าฝึกปฏิบัติงานสหกิจศึกษาในหน่วยงานของท่าน และหวังเป็นอย่างยิ่งว่าจะได้รับความอนุเคราะห์จากท่านอีกในโอกาสต่อไป</p>
  </div>
  
  <div class="document-signature">
    <div class="signature-right">
      <div>ขอแสดงความนับถือ</div>
      <br><br><br>
      <div>({{deanName}})</div>
      <div>คณบดี{{facultyName}}</div>
    </div>
  </div>
  
  <div class="document-footer">
    <div>{{programName}}</div>
    <div>โทรศัพท์ {{contactPhone}}</div>
    <div>({{coordinatorName}} ผู้ประสานงาน)</div>
  </div>
  
  <div class="student-list">
    <div class="list-header">
      <div>สถานประกอบการ {{companyName}}</div>
      <div>{{companyAddress}}</div>
      <br>
      <div><strong>รายชื่อนักศึกษาที่เข้ารับการฝึกประสบการณ์ จำนวน ๑ ราย</strong></div>
      <div>๑. {{studentName}}</div>
    </div>
  </div>
</div>
          `
        }
      }
    }
  };

  // CSS ที่ปรับปรุงแล้ว
  const improvedCSS = `
  .document-page {
    font-family: 'Sarabun', 'TH SarabunPSK', Arial, sans-serif;
    font-size: 16px;
    line-height: 1.8;
    color: #000;
    padding: 40px;
    background: white;
    border: 2px solid #000;
    max-width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    box-shadow: none;
  }
  
  /* Form Header */
  .form-header {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .university-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .form-title {
    font-size: 16px;
    font-weight: bold;
  }
  
  /* Section Dividers */
  .section-divider {
    text-align: center;
    margin: 30px 0;
  }
  
  .section-box {
    border: 2px solid #000;
    display: inline-block;
    padding: 0;
  }
  
  .section-header {
    padding: 10px 40px;
    font-weight: bold;
    font-size: 16px;
    background: white;
  }
  
  /* Form Sections */
  .form-section {
    margin: 20px 0;
  }
  
  .form-row {
    margin-bottom: 20px;
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .number {
    font-weight: bold;
    min-width: 30px;
    font-size: 16px;
  }
  
  .label {
    font-weight: normal;
    font-size: 16px;
  }
  
  .text {
    font-size: 16px;
    line-height: 1.8;
  }
  
  /* Underline Fields */
  .underline-field {
    border-bottom: 1px solid #000;
    min-width: 150px;
    padding: 2px 5px;
    display: inline-block;
    font-weight: bold;
  }
  
  .underline-field-long {
    border-bottom: 1px solid #000;
    min-width: 300px;
    padding: 2px 5px;
    display: inline-block;
    font-weight: bold;
  }
  
  .underline-full {
    border-bottom: 1px solid #000;
    width: 100%;
    min-height: 25px;
    margin: 5px 0;
    padding: 2px 5px;
    font-weight: bold;
  }
  
  /* Address and Job Description */
  .address-lines,
  .job-description-lines {
    margin: 10px 0 20px 40px;
  }
  
  /* Map Section */
  .map-section {
    margin: 20px 0;
    text-align: center;
  }
  
  .map-placeholder {
    border: 2px solid #000;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9f9f9;
    color: #666;
    font-style: italic;
  }
  
  /* Document Header */
  .document-header {
    margin-bottom: 30px;
  }
  
  .doc-number-date {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    font-size: 16px;
  }
  
  /* Document Content */
  .document-subject {
    margin-bottom: 20px;
    font-size: 16px;
  }
  
  .document-recipient {
    margin-bottom: 20px;
    font-size: 16px;
  }
  
  .document-attachment {
    margin-bottom: 30px;
    font-size: 16px;
  }
  
  .document-body p {
    margin-bottom: 20px;
    text-align: justify;
    text-indent: 0;
    font-size: 16px;
    line-height: 2;
  }
  
  /* Signature */
  .document-signature {
    margin-top: 50px;
    text-align: right;
  }
  
  .signature-right {
    display: inline-block;
    text-align: center;
    font-size: 16px;
  }
  
  /* Footer */
  .document-footer {
    margin-top: 40px;
    font-size: 14px;
  }
  
  /* Student List */
  .student-list {
    margin-top: 50px;
    border-top: 1px solid #000;
    padding-top: 20px;
  }
  
  .list-header {
    font-size: 14px;
    line-height: 1.6;
  }
  
  /* Print Styles */
  @media print {
    .document-page {
      box-shadow: none;
      border: none;
      margin: 0;
      padding: 20mm;
      font-size: 14px;
    }
    
    .section-box {
      border: 1px solid #000;
    }
    
    .map-placeholder {
      border: 1px solid #000;
    }
  }
  `;

  // สร้างไฟล์ TypeScript
  const tsContent = `// เทมเพลต HTML ที่ปรับปรุงแล้วให้เหมือนต้นฉบับ
// สร้างโดย scripts/create-better-templates.js

export const BETTER_TEMPLATES = ${JSON.stringify(templates, null, 2)};

// CSS ที่ปรับปรุงแล้ว
export const IMPROVED_DOCUMENT_CSS = \`${improvedCSS}\`;

// ฟังก์ชันแทนที่ตัวแปรใน HTML
export function replaceBetterVariables(
  html: string, 
  variables: Record<string, string>
): string {
  let result = html;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(\`{{\${key}}}\`, 'g');
    result = result.replace(regex, value || \`[\${key}]\`);
  });
  
  return result;
}
`;

  const outputFile = path.join(__dirname, '..', 'src', 'lib', 'better-templates.ts');
  fs.writeFileSync(outputFile, tsContent, 'utf8');
  
  console.log('✅ สร้างเทมเพลตที่ปรับปรุงแล้วสำเร็จ:', outputFile);
  console.log('📊 จำนวนเทมเพลต:', Object.keys(templates.co_op.th).length + Object.keys(templates.internship.th).length);
}

// เรียกใช้งาน
createBetterTemplates();