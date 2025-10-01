// เทมเพลต HTML ที่แก้ไขส่วนหัวแล้ว
// สร้างโดย scripts/fix-template-headers.js

export const BETTER_TEMPLATES = {
  "internship": {
    "th": {
      "request_letter": {
        "title": "หนังสือขอความอนุเคราะห์รับนักศึกษาฝึกงาน",
        "content": "\n<div class=\"document-page\">\n  <div class=\"document-header\">\n    <div class=\"doc-number-date\">\n      <span class=\"doc-number\">ที่ {{documentNumber}}</span>\n      <span class=\"doc-date\">วันที่ {{documentDate}}</span>\n    </div>\n  </div>\n  \n  <div class=\"document-subject\">\n    <strong>เรื่อง</strong> ขอความอนุเคราะห์รับนักศึกษาฝึกงานในสถานประกอบการ\n  </div>\n  \n  <div class=\"document-recipient\">\n    <strong>เรียน</strong> {{recipientTitle}}<br>\n    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{companyName}}\n  </div>\n  \n  <div class=\"document-attachment\">\n    <strong>สิ่งที่ส่งมาด้วย</strong> หนังสือตอบรับนักศึกษาฝึกงานในสถานประกอบการ จำนวน ๑ ฉบับ\n  </div>\n  \n  <div class=\"document-body\">\n    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ด้วย {{facultyName}} {{universityName}} มีความประสงค์ให้นักศึกษาระดับปริญญาตรี หลักสูตรการจัดการธุรกิจระหว่างประเทศ ได้มีโอกาสเข้าฝึกงานในหน่วยงานของท่าน ในรายวิชา Job Internship in Business Management ซึ่งเป็นการจัดให้มีการบูรณาการการเรียนของนักศึกษากับการปฏิบัติงานเพื่อหาประสบการณ์จริงจากสถานประกอบการ</p>\n    \n    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ในการนี้ {{facultyName}} ได้พิจารณาแล้วเห็นว่าการเข้าฝึกงานในสถานประกอบการของท่านจะเกิดประโยชน์แก่นักศึกษาเป็นอย่างมาก จึงใคร่ขอความอนุเคราะห์ท่านรับนักศึกษาเข้าฝึกงานในสถานประกอบการ ภาคการศึกษาที่ ๒ ปีการศึกษา {{academicYear}} ระหว่างวันที่ {{startDate}} ถึงวันที่ {{endDate}} โดยคณะฯ กำหนดให้นักศึกษาฝึกงานในสถานประกอบการในฐานะพนักงานเต็มเวลา</p>\n    \n    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ หากผลการพิจารณาเป็นประการใด กรุณาส่งหนังสือตอบรับที่แนบมาพร้อมนี้กลับมายัง {{programName}} {{facultyName}} {{universityName}}</p>\n  </div>\n  \n  <div class=\"document-signature\">\n    <div class=\"signature-right\">\n      <div>ขอแสดงความนับถือ</div>\n      <br><br><br>\n      <div>({{deanName}})</div>\n      <div>คณบดี{{facultyName}}</div>\n    </div>\n  </div>\n  \n  <div class=\"document-footer\">\n    <div>{{programName}}</div>\n    <div>โทรศัพท์ {{contactPhone}}</div>\n    <div>({{coordinatorName}} ผู้ประสานงาน)</div>\n  </div>\n</div>\n          "
      },
      "introduction_letter": {
        "title": "หนังสือส่งตัวนักศึกษาฝึกงาน",
        "content": "\n<div class=\"document-page\">\n  <div class=\"document-header\">\n    <div class=\"doc-number-date\">\n      <span class=\"doc-number\">ที่ {{documentNumber}}</span>\n      <span class=\"doc-date\">วันที่ {{documentDate}}</span>\n    </div>\n  </div>\n  \n  <div class=\"document-subject\">\n    <strong>เรื่อง</strong> ขอส่งตัวนักศึกษาฝึกงานในสถานประกอบการ\n  </div>\n  \n  <div class=\"document-recipient\">\n    <strong>เรียน</strong> {{recipientTitle}}<br>\n    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{companyName}}\n  </div>\n  \n  <div class=\"document-attachment\">\n    <strong>สิ่งที่ส่งมาด้วย</strong> ๑. รายชื่อนักศึกษาฝึกงานในสถานประกอบการ จำนวน ๑ ฉบับ\n  </div>\n  \n  <div class=\"document-body\">\n    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ตามที่ท่านได้ให้ความอนุเคราะห์รับนักศึกษาหลักสูตรการจัดการธุรกิจระหว่างประเทศ {{facultyName}} {{universityName}} เข้ารับการฝึกงานในสถานประกอบการของท่าน นั้น</p>\n    \n    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;คณะขอส่งตัวนักศึกษาฝึกงานในสถานประกอบการ จำนวน ๑ ราย เพื่อรายงานตัวเข้ารับการฝึกงาน ในภาคเรียนที่ ๒ ปีการศึกษา {{academicYear}} ระหว่างวันที่ {{startDate}} ถึงวันที่ {{endDate}}</p>\n    \n    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;หากการฝึกงานในสถานประกอบการของนักศึกษาสิ้นสุดลง ขอความอนุเคราะห์สถานประกอบการประเมินผลการฝึกงานของนักศึกษา และนำส่งกลับมายัง {{programName}} {{facultyName}} {{universityName}} โดยปิดผนึกฝากกับนักศึกษา หรือส่งผ่านไปรษณีย์อิเล็กทรอนิกส์ sjariangprasert@gmail.com ภายในเวลา ๗ วันหลังจากนักศึกษาฝึกงานเสร็จสิ้น หากมีข้อสงสัยเกี่ยวข้องกับการฝึกงานในครั้งนี้ สามารถติดต่อประสานงานกับอาจารย์ศิวพร ศิริกมล หมายเลขโทรศัพท์ {{contactPhone}}</p>\n    \n    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;คณะขอขอบคุณที่ท่านได้กรุณารับนักศึกษาเข้าฝึกงานในสถานประกอบการของท่าน และหวังเป็นอย่างยิ่งว่าจะได้รับความอนุเคราะห์จากท่านอีกในโอกาสต่อไป</p>\n  </div>\n  \n  <div class=\"document-signature\">\n    <div class=\"signature-right\">\n      <div>ขอแสดงความนับถือ</div>\n      <br><br><br>\n      <div>({{deanName}})</div>\n      <div>คณบดี{{facultyName}}</div>\n    </div>\n  </div>\n  \n  <div class=\"document-footer\">\n    <div>{{programName}}</div>\n    <div>โทรศัพท์ {{contactPhone}}</div>\n    <div>({{coordinatorName}} ผู้ประสานงาน)</div>\n  </div>\n  \n  <div class=\"student-list\">\n    <div class=\"list-header\">\n      <div>สถานประกอบการ {{companyName}}</div>\n      <div>{{companyAddress}}</div>\n      <br>\n      <div><strong>รายชื่อนักศึกษาที่เข้ารับการฝึกงาน จำนวน ๑ ราย</strong></div>\n      <div>๑. {{studentName}}</div>\n    </div>\n  </div>\n</div>\n          "
      }
    }
  },
  "co_op": {
    "th": {
      "application_form": {
        "title": "แบบแจ้งสถานที่ฝึกประสบการณ์สหกิจศึกษา (Co-operative Education)",
        "content": "\n<div class=\"document-page coop-form\">\n  <!-- ส่วนหัวแบบฟอร์ม -->\n  <div class=\"form-header\">\n    <div class=\"university-name\">มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา</div>\n    <div class=\"form-title\">แบบแจ้งสถานที่ฝึกประสบการณ์สหกิจศึกษา (Co-operative Education) {{academicYear}}</div>\n  </div>\n  \n  <!-- ส่วนที่ 1 -->\n  <div class=\"section-header-box\">\n    <div class=\"section-number\">ส่วนที่ ๑</div>\n  </div>\n  \n  <div class=\"form-content\">\n    <div class=\"form-line\">\n      <span class=\"item-number\">๑.</span>\n      <span class=\"field-label\">ชื่อนักศึกษา</span>\n      <span class=\"dotted-line\">{{studentName}}</span>\n      <span class=\"field-label\">รหัส</span>\n      <span class=\"dotted-line short\">{{studentId}}</span>\n    </div>\n    \n    <div class=\"form-line\">\n      <span class=\"item-number\">๒.</span>\n      <span class=\"field-label\">ชื่อนักศึกษา</span>\n      <span class=\"dotted-line\">{{studentName2}}</span>\n      <span class=\"field-label\">รหัส</span>\n      <span class=\"dotted-line short\">{{studentId2}}</span>\n    </div>\n    \n    <div class=\"form-line\">\n      <span class=\"field-label\">ระดับ :</span>\n      <span class=\"static-text\">ปริญญาตรี หลักสูตรการจัดการธุรกิจระหว่างประเทศ ชั้นปีที่ {{year}} คณะบริหารธุรกิจและศิลปศาสตร์</span>\n    </div>\n    \n    <div class=\"form-line\">\n      <span class=\"field-label\">เบอร์โทรศัพท์</span>\n      <span class=\"dotted-line medium\">{{phoneNumber}}</span>\n      <span class=\"field-label\">อีเมล์</span>\n      <span class=\"dotted-line long\">{{studentEmail}}</span>\n    </div>\n  </div>\n  \n  <!-- ส่วนที่ 2 -->\n  <div class=\"section-header-box\">\n    <div class=\"section-number\">ส่วนที่ ๒</div>\n  </div>\n  \n  <div class=\"form-content\">\n    <div class=\"form-line\">\n      <span class=\"item-number\">๑.</span>\n      <span class=\"field-label\">ชื่อสถานประกอบการ</span>\n      <span class=\"dotted-line extra-long\">{{companyName}}</span>\n    </div>\n    \n    <div class=\"form-line\">\n      <span class=\"item-number\">๒.</span>\n      <span class=\"field-label\">ชื่อหัวหน้าหน่วยงาน</span>\n      <span class=\"dotted-line extra-long\">{{supervisorName}}</span>\n    </div>\n    \n    <div class=\"form-line\">\n      <span class=\"item-number\">๓.</span>\n      <span class=\"field-label\">ตำแหน่ง</span>\n      <span class=\"dotted-line extra-long\">{{position}}</span>\n    </div>\n    \n    <div class=\"form-line\">\n      <span class=\"item-number\">๔.</span>\n      <span class=\"field-label\">ที่อยู่สถานประกอบการ</span>\n    </div>\n    \n    <div class=\"address-section\">\n      <div class=\"full-dotted-line\">{{companyAddress}}</div>\n      <div class=\"full-dotted-line\"></div>\n    </div>\n    \n    <div class=\"form-line\">\n      <span class=\"item-number\">๕.</span>\n      <span class=\"field-label\">เบอร์โทรศัพท์</span>\n      <span class=\"dotted-line medium\">{{companyPhone}}</span>\n      <span class=\"field-label\">โทรสาร</span>\n      <span class=\"dotted-line medium\">{{companyFax}}</span>\n    </div>\n    \n    <div class=\"form-line\">\n      <span class=\"item-number\">๖.</span>\n      <span class=\"field-label\">ประเภทของกิจการ</span>\n      <span class=\"dotted-line extra-long\">{{businessType}}</span>\n    </div>\n    \n    <div class=\"form-line\">\n      <span class=\"item-number\">๗.</span>\n      <span class=\"field-label\">แผนกที่นักศึกษาฝึกประสบการณ์</span>\n      <span class=\"dotted-line extra-long\">{{department}}</span>\n    </div>\n    \n    <div class=\"form-line\">\n      <span class=\"item-number\">๘.</span>\n      <span class=\"field-label\">ลักษณะงาน</span>\n      <span class=\"dotted-line extra-long\">{{jobDescription}}</span>\n    </div>\n    \n    <div class=\"job-description-section\">\n      <div class=\"full-dotted-line\"></div>\n      <div class=\"full-dotted-line\"></div>\n    </div>\n    \n    <div class=\"form-line\">\n      <span class=\"item-number\">๙.</span>\n      <span class=\"field-label\">แผนที่</span>\n    </div>\n    \n    <div class=\"map-area\">\n      <div class=\"map-box\">\n        [แผนที่หรือเส้นทางไปสถานประกอบการ]\n      </div>\n    </div>\n  </div>\n</div>\n          "
      },
      "request_letter": {
        "title": "หนังสือขอความอนุเคราะห์รับนักศึกษาปฏิบัติงานสหกิจศึกษา",
        "content": "\n<div class=\"document-page\">\n  <div class=\"document-header\">\n    <div class=\"doc-number-date\">\n      <span class=\"doc-number\">ที่ {{documentNumber}}</span>\n      <span class=\"doc-date\">วันที่ {{documentDate}}</span>\n    </div>\n  </div>\n  \n  <div class=\"document-subject\">\n    <strong>เรื่อง</strong> ขอความอนุเคราะห์รับนักศึกษาปฏิบัติงานสหกิจศึกษา\n  </div>\n  \n  <div class=\"document-recipient\">\n    <strong>เรียน</strong> {{recipientTitle}}<br>\n    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{companyName}}\n  </div>\n  \n  <div class=\"document-attachment\">\n    <strong>สิ่งที่ส่งมาด้วย</strong> หนังสือตอบรับนักศึกษาปฏิบัติงานสหกิจศึกษา จำนวน ๑ ฉบับ\n  </div>\n  \n  <div class=\"document-body\">\n    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ด้วย {{facultyName}} {{universityName}} มีความประสงค์ให้นักศึกษาระดับปริญญาตรี หลักสูตรการจัดการธุรกิจระหว่างประเทศ ได้มีโอกาสเข้าปฏิบัติงานสหกิจศึกษาในหน่วยงานของท่าน ในรายวิชา Co-Operative Education in Business Administration ซึ่งเป็นการจัดให้มีการบูรณาการการเรียนของนักศึกษากับการปฏิบัติงานเพื่อหาประสบการณ์จริงจากสถานประกอบการ</p>\n    \n    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ในการนี้ คณะได้พิจารณาแล้วเห็นว่าการเข้าปฏิบัติงานสหกิจศึกษาในหน่วยงานของท่านจะเกิดประโยชน์แก่นักศึกษาเป็นอย่างยิ่ง ดังนั้น คณะจึงขอความอนุเคราะห์ท่านรับนักศึกษาปฏิบัติงานสหกิจศึกษาในภาคการศึกษาที่ ๒ ปีการศึกษา {{academicYear}} ตั้งแต่วันที่ {{startDate}} ถึงวันที่ {{endDate}} โดยคณะกำหนดให้นักศึกษาออกปฏิบัติงานสหกิจศึกษาในสถานประกอบการในฐานะพนักงานเต็มเวลา และระหว่างการปฏิบัติงานสหกิจศึกษานั้น นักศึกษาต้องจัดทำโครงงาน ๑ เรื่อง เพื่อให้เป็นไปตามข้อกำหนดของหลักสูตร</p>\n    \n    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ หากผลการพิจารณาเป็นประการใด กรุณาส่งหนังสือตอบรับที่แนบมาพร้อมนี้กลับมายัง {{programName}} {{facultyName}} {{universityName}}</p>\n  </div>\n  \n  <div class=\"document-signature\">\n    <div class=\"signature-right\">\n      <div>ขอแสดงความนับถือ</div>\n      <br><br><br>\n      <div>({{deanName}})</div>\n      <div>คณบดี{{facultyName}}</div>\n    </div>\n  </div>\n  \n  <div class=\"document-footer\">\n    <div>{{programName}}</div>\n    <div>โทรศัพท์ {{contactPhone}}</div>\n    <div>({{coordinatorName}} ผู้ประสานงาน)</div>\n  </div>\n</div>\n          "
      },
      "introduction_letter": {
        "title": "หนังสือส่งตัวนักศึกษาฝึกปฏิบัติงานสหกิจศึกษา",
        "content": "\n<div class=\"document-page\">\n  <div class=\"document-header\">\n    <div class=\"doc-number-date\">\n      <span class=\"doc-number\">ที่ {{documentNumber}}</span>\n      <span class=\"doc-date\">วันที่ {{documentDate}}</span>\n    </div>\n  </div>\n  \n  <div class=\"document-subject\">\n    <strong>เรื่อง</strong> ขอส่งตัวนักศึกษาฝึกปฏิบัติงานสหกิจศึกษา\n  </div>\n  \n  <div class=\"document-recipient\">\n    <strong>เรียน</strong> {{recipientTitle}}<br>\n    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{companyName}}\n  </div>\n  \n  <div class=\"document-attachment\">\n    <strong>สิ่งที่ส่งมาด้วย</strong> ๑. รายชื่อนักศึกษาฝึกปฏิบัติงานสหกิจศึกษา จำนวน ๑ ฉบับ\n  </div>\n  \n  <div class=\"document-body\">\n    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ตามที่ท่านได้ให้ความอนุเคราะห์รับนักศึกษาหลักสูตรการจัดการธุรกิจระหว่างประเทศ {{facultyName}} {{universityName}} เข้ารับการฝึกปฏิบัติงานสหกิจศึกษาในหน่วยงานของท่าน นั้น</p>\n    \n    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;คณะขอส่งตัวนักศึกษาฝึกปฏิบัติงานสหกิจศึกษา จำนวน ๑ ราย เพื่อรายงานตัวเข้ารับการฝึกปฏิบัติงานสหกิจศึกษา ในภาคเรียนที่ ๒ ปีการศึกษา {{academicYear}} ระหว่างวันที่ {{startDate}} ถึงวันที่ {{endDate}} หากการปฏิบัติงานสหกิจศึกษาของนักศึกษาสิ้นสุดลง ขอความอนุเคราะห์สถานประกอบการประเมินผลการปฏิบัติงานสหกิจศึกษาของนักศึกษา และนำส่งกลับมายัง {{programName}} {{facultyName}} {{universityName}} โดยปิดผนึกฝากกับนักศึกษา หรือส่งผ่านไปรษณีย์อิเล็กทรอนิกส์ sjariangprasert@gmail.com ภายในเวลา ๗ วันหลังจากนักศึกษาฝึกงานเสร็จสิ้น หากมีข้อสงสัยเกี่ยวข้องกับการฝึกงานในครั้งนี้ สามารถติดต่อประสานงานกับอาจารย์ศิวพร ศิริกมล หมายเลขโทรศัพท์ {{contactPhone}}</p>\n    \n    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;คณะขอขอบคุณที่ท่านได้กรุณารับนักศึกษาเข้าฝึกปฏิบัติงานสหกิจศึกษาในหน่วยงานของท่าน และหวังเป็นอย่างยิ่งว่าจะได้รับความอนุเคราะห์จากท่านอีกในโอกาสต่อไป</p>\n  </div>\n  \n  <div class=\"document-signature\">\n    <div class=\"signature-right\">\n      <div>ขอแสดงความนับถือ</div>\n      <br><br><br>\n      <div>({{deanName}})</div>\n      <div>คณบดี{{facultyName}}</div>\n    </div>\n  </div>\n  \n  <div class=\"document-footer\">\n    <div>{{programName}}</div>\n    <div>โทรศัพท์ {{contactPhone}}</div>\n    <div>({{coordinatorName}} ผู้ประสานงาน)</div>\n  </div>\n  \n  <div class=\"student-list\">\n    <div class=\"list-header\">\n      <div>สถานประกอบการ {{companyName}}</div>\n      <div>{{companyAddress}}</div>\n      <br>\n      <div><strong>รายชื่อนักศึกษาที่เข้ารับการฝึกประสบการณ์ จำนวน ๑ ราย</strong></div>\n      <div>๑. {{studentName}}</div>\n    </div>\n  </div>\n</div>\n          "
      }
    }
  }
};

// CSS ที่ปรับปรุงแล้ว
export const IMPROVED_DOCUMENT_CSS = `
  /* เอากรอบออกจากทุกอย่าง */
  * {
    border: none !important;
    box-shadow: none !important;
  }
  
  .document-page {
    font-family: 'Sarabun', 'TH SarabunPSK', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #000;
    padding: 5mm 20mm 5mm 25mm;
    background: white !important;
    border: none !important;
    border-width: 0 !important;
    border-style: none !important;
    outline: none !important;
    max-width: 210mm;
    min-height: auto;
    margin: 0 auto;
    box-shadow: none !important;
  }
  
  /* University Header Styles */
  .university-header {
    text-align: center;
    margin-bottom: 10px; /* ลดจาก 15px เป็น 10px */
    padding: 5px; /* ลดจาก 10px เป็น 5px */
    background: white;
  }
  
  .university-logo {
    max-height: 80px;
    width: auto;
    margin: 0 auto 15px auto;
    display: block;
  }
  
  .document-title {
    font-size: 18px;
    font-weight: bold;
    margin-top: 20px;
    color: #000;
  }
  
  /* Section Dividers */
  .section-divider {
    text-align: center;
    margin: 15px 0;
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
    margin: 10px 0;
  }
  
  .form-row {
    margin-bottom: 10px;
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .number {
    font-weight: bold;
    min-width: 25px;
    font-size: 14px;
  }
  
  .label {
    font-weight: normal;
    font-size: 14px;
  }
  
  .text {
    font-size: 14px;
    line-height: 1.6;
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
    margin-bottom: 10px;
    font-size: 14px;
  }
  
  .document-recipient {
    margin-bottom: 10px;
    font-size: 14px;
  }
  
  .document-attachment {
    margin-bottom: 12px;
    font-size: 14px;
  }
  
  .document-body p {
    margin-bottom: 10px;
    text-align: justify;
    text-indent: 2em;
    font-size: 14px;
    line-height: 1.6;
  }
  
  /* Signature */
  .document-signature {
    margin-top: 25px;
    text-align: right;
  }
  
  .signature-right {
    display: inline-block;
    text-align: center;
    font-size: 14px;
  }
  
  /* Footer */
  .document-footer {
    margin-top: 15px;
    font-size: 12px;
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
  
  /* Co-op Form Specific Styles */
  .coop-form {
    padding: 15mm 20mm 15mm 25mm;
  }
  
  .form-header {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .university-name {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .form-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;
  }
  
  .section-header-box {
    text-align: center;
    margin: 25px 0 20px 0;
  }
  
  .section-number {
    border: 2px solid #000;
    display: inline-block;
    padding: 8px 30px;
    font-weight: bold;
    font-size: 16px;
    background: white;
  }
  
  .form-content {
    margin: 20px 0;
  }
  
  .form-line {
    margin-bottom: 15px;
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 8px;
    line-height: 1.8;
  }
  
  .item-number {
    font-weight: bold;
    min-width: 25px;
    font-size: 16px;
  }
  
  .field-label {
    font-size: 16px;
    margin-right: 5px;
  }
  
  .static-text {
    font-size: 16px;
    line-height: 1.6;
  }
  
  .dotted-line {
    border-bottom: 1px dotted #000;
    display: inline-block;
    min-height: 20px;
    padding: 2px 5px;
    font-weight: bold;
    margin: 0 5px;
  }
  
  .dotted-line.short {
    min-width: 120px;
  }
  
  .dotted-line.medium {
    min-width: 180px;
  }
  
  .dotted-line.long {
    min-width: 250px;
  }
  
  .dotted-line.extra-long {
    min-width: 350px;
  }
  
  .address-section,
  .job-description-section {
    margin: 15px 0 15px 40px;
  }
  
  .full-dotted-line {
    border-bottom: 1px dotted #000;
    width: 100%;
    min-height: 25px;
    margin: 8px 0;
    padding: 2px 5px;
    font-weight: bold;
  }
  
  .map-area {
    margin: 20px 0;
    text-align: center;
  }
  
  .map-box {
    border: 2px solid #000;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9f9f9;
    color: #666;
    font-style: italic;
    font-size: 14px;
  }
  
  /* Print Styles */
  @media print {
    .document-page {
      box-shadow: none !important;
      border: none !important;
      margin: 0;
      padding: 5mm 20mm 3mm 25mm; /* ลด padding-bottom เพื่อป้องกันหน้าเปล่า */
      font-size: 12px;
      line-height: 1.3; /* ลด line-height เพื่อประหยัดพื้นที่ */
      page-break-inside: avoid;
      page-break-after: avoid; /* ป้องกันการแบ่งหน้าหลังเอกสาร */
      min-height: auto; /* ไม่บังคับความสูงขั้นต่ำ */
    }
    
    .coop-form {
      padding: 5mm 15mm 10mm 20mm; /* ปรับ padding สำหรับแบบฟอร์มสหกิจศึกษา */
    }
    
    body {
      margin: 0 !important;
      padding: 0 !important;
    }
    
    .document-page:last-child {
      page-break-after: avoid;
    }
    
    /* ป้องกันหน้าเปล่า */
    .document-signature {
      page-break-inside: avoid;
      page-break-after: avoid;
    }
    
    .document-footer {
      page-break-inside: avoid;
      page-break-after: avoid;
      margin-top: 10px; /* ลด margin-top */
    }
    
    .student-list {
      page-break-inside: avoid;
      page-break-after: avoid;
      margin-top: 30px; /* ลด margin-top */
    }
    
    .section-box,
    .section-number {
      border: 1px solid #000;
    }
    
    .map-placeholder,
    .map-box {
      border: 1px solid #000;
    }
    
    /* ปรับขนาดฟอนต์สำหรับการปริ้น */
    .university-name {
      font-size: 16px;
    }
    
    .form-title {
      font-size: 14px;
    }
    
    .item-number,
    .field-label,
    .static-text {
      font-size: 12px;
    }
  }
  
  /* Styles for PDF generation (no borders) */
  .document-page.pdf-export {
    border: none !important;
    box-shadow: none !important;
    margin: 0;
    padding: 5mm 20mm 3mm 25mm; /* ลด padding-bottom เพื่อป้องกันหน้าเปล่า */
    font-size: 12px;
    line-height: 1.3; /* ลด line-height เพื่อประหยัดพื้นที่ */
    page-break-inside: avoid;
    page-break-after: avoid; /* ป้องกันการแบ่งหน้าหลังเอกสาร */
    min-height: auto; /* ไม่บังคับความสูงขั้นต่ำ */
  }
  
  .coop-form.pdf-export {
    padding: 5mm 15mm 10mm 20mm; /* ปรับ padding สำหรับแบบฟอร์มสหกิจศึกษา */
  }
  
  /* ซ่อนกรอบทั้งหมดสำหรับ PDF export */
  .pdf-export {
    border: none !important;
    box-shadow: none !important;
  }
  
  .pdf-export .document-page {
    border: none !important;
    box-shadow: none !important;
  }
  
  /* ป้องกันหน้าเปล่าสำหรับ PDF export */
  .pdf-export .document-signature {
    page-break-inside: avoid;
    page-break-after: avoid;
  }
  
  .pdf-export .document-footer {
    page-break-inside: avoid;
    page-break-after: avoid;
    margin-top: 8px; /* ลด margin-top */
  }
  
  .pdf-export .student-list {
    page-break-inside: avoid;
    page-break-after: avoid;
    margin-top: 25px; /* ลด margin-top */
  }
  `;

// ฟังก์ชันแทนที่ตัวแปรใน HTML
export function replaceBetterVariables(
  html: string, 
  variables: Record<string, string>
): string {
  let result = html;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || `[${key}]`);
  });
  
  return result;
}
