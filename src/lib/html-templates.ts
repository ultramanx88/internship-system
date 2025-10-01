// เทมเพลต HTML ที่ตรงกับเอกสารจริง
export const HTML_TEMPLATES = {
  co_op: {
    th: {
      application_form: `
        <div class="document-page">
          <!-- ส่วนที่ 1 -->
          <div class="section-box">
            <div class="section-header">ส่วนที่ ๑</div>
          </div>
          
          <div class="form-row">
            <span class="number">๑.</span>
            <span class="label">ชื่อนักศึกษา</span>
            <span class="fill-data">{{studentName}}</span>
            <span class="label">รหัส</span>
            <span class="fill-data">{{studentId}}</span>
          </div>
          
          <div class="form-row">
            <span class="number">๒.</span>
            <span class="label">ชื่อนักศึกษา</span>
            <span class="fill-data">{{studentName}}</span>
            <span class="label">รหัส</span>
            <span class="fill-data">{{studentId}}</span>
          </div>
          
          <div class="form-row">
            <span class="label">ระดับ :</span>
            <span class="text">ปริญญาตรี หลักสูตรการจัดการธุรกิจระหว่างประเทศ ชั้นปีที่ {{year}} คณะบริหารธุรกิจและศิลปศาสตร์</span>
          </div>
          
          <div class="form-row">
            <span class="label">เบอร์โทรศัพท์</span>
            <span class="dotted-line">{{phoneNumber}}</span>
            <span class="label">อีเมล์</span>
            <span class="dotted-line">{{studentEmail}}</span>
          </div>
          
          <!-- ส่วนที่ 2 -->
          <div class="section-box">
            <div class="section-header">ส่วนที่ ๒</div>
          </div>
          
          <div class="form-row">
            <span class="number">๑.</span>
            <span class="label">ชื่อสถานประกอบการ</span>
            <span class="fill-data">{{companyName}}</span>
          </div>
          
          <div class="form-row">
            <span class="number">๒.</span>
            <span class="label">ชื่อหัวหน้าหน่วยงาน</span>
            <span class="dotted-line">{{supervisorName}}</span>
          </div>
          
          <div class="form-row">
            <span class="number">๓.</span>
            <span class="label">ตำแหน่ง</span>
            <span class="fill-data">{{position}}</span>
          </div>
          
          <div class="form-row">
            <span class="number">๔.</span>
            <span class="label">ที่อยู่สถานประกอบการ</span>
          </div>
          <div class="address-box">
            <div class="fill-data">{{companyAddress}}</div>
            <div class="dotted-line-full"></div>
          </div>
          
          <div class="form-row">
            <span class="number">๕.</span>
            <span class="label">เบอร์โทรศัพท์</span>
            <span class="dotted-line">{{companyPhone}}</span>
            <span class="label">โทรสาร</span>
            <span class="dotted-line">{{companyFax}}</span>
          </div>
          
          <div class="form-row">
            <span class="number">๖.</span>
            <span class="label">ประเภทของกิจการ</span>
            <span class="dotted-line">{{businessType}}</span>
          </div>
          
          <div class="form-row">
            <span class="number">๗.</span>
            <span class="label">แผนกที่นักศึกษาฝึกประสบการณ์</span>
            <span class="dotted-line">{{department}}</span>
          </div>
          
          <div class="form-row">
            <span class="number">๘.</span>
            <span class="label">ลักษณะงาน</span>
            <span class="fill-data">{{jobDescription}}</span>
          </div>
          <div class="dotted-line-full"></div>
          <div class="dotted-line-full"></div>
          
          <div class="form-row">
            <span class="number">๗.</span>
            <span class="label">แผนที่</span>
          </div>
          
          <div class="map-box">
            [แผนที่หรือเส้นทางไปสถานประกอบการ]
          </div>
        </div>
      `,
      
      request_letter: `
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
            
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ หากผลการพิจารณาเป็นประการใด กรุณาส่งหนังสือตอบรับที่แนบมาพร้อมนี้กลับมายัง หลักสูตรการจัดการธุรกิจระหว่างประเทศ {{facultyName}} {{universityName}}</p>
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
    
    en: {
      application_form: `
        <div class="document-page">
          <!-- Part 1 -->
          <div class="section-box">
            <div class="section-header">Part 1</div>
          </div>
          
          <div class="form-row">
            <span class="number">1.</span>
            <span class="label">Student</span>
            <span class="fill-data">{{studentName}}</span>
            <span class="label">Student ID</span>
            <span class="fill-data">{{studentId}}</span>
          </div>
          
          <div class="form-row">
            <span class="number">2.</span>
            <span class="label">Student</span>
            <span class="fill-data">{{studentName}}</span>
            <span class="label">Student ID</span>
            <span class="fill-data">{{studentId}}</span>
          </div>
          
          <div class="form-row">
            <span class="text">Bachelor degree, International Business Management {{year}}th Year student, Faculty of Business Administration and Liberal Arts.</span>
          </div>
          
          <div class="form-row">
            <span class="label">Mobile phone no.</span>
            <span class="dotted-line">{{phoneNumber}}</span>
            <span class="label">e-mail</span>
            <span class="dotted-line">{{studentEmail}}</span>
          </div>
          
          <!-- Part 2 -->
          <div class="section-box">
            <div class="section-header">Part 2</div>
          </div>
          
          <div class="form-row">
            <span class="number">1.</span>
            <span class="label">Name of company</span>
            <span class="fill-data">{{companyName}}</span>
          </div>
          
          <div class="form-row">
            <span class="number">2.</span>
            <span class="label">Name of company supervisor</span>
            <span class="dotted-line">{{supervisorName}}</span>
          </div>
          
          <div class="form-row">
            <span class="number">3.</span>
            <span class="label">Position</span>
            <span class="fill-data">{{position}}</span>
          </div>
          
          <div class="form-row">
            <span class="number">4.</span>
            <span class="label">Address</span>
            <span class="fill-data">{{companyAddress}}</span>
          </div>
          
          <div class="form-row">
            <span class="number">5.</span>
            <span class="label">Tel.</span>
            <span class="dotted-line">{{companyPhone}}</span>
            <span class="label">Fax.</span>
            <span class="dotted-line">{{companyFax}}</span>
          </div>
          
          <div class="form-row">
            <span class="number">6.</span>
            <span class="label">Type of Business</span>
            <span class="dotted-line">{{businessType}}</span>
          </div>
          
          <div class="form-row">
            <span class="number">7.</span>
            <span class="label">Department which you are located</span>
            <span class="dotted-line">{{department}}</span>
          </div>
          
          <div class="form-row">
            <span class="number">8.</span>
            <span class="label">Duty</span>
            <span class="fill-data">{{jobDescription}}</span>
          </div>
          
          <div class="form-row">
            <span class="number">7.</span>
            <span class="label">Map</span>
          </div>
          
          <div class="map-box">
            [Map or directions to the company]
          </div>
        </div>
      `
    }
  }
};

// CSS สำหรับเอกสาร
export const DOCUMENT_CSS = `
  .document-page {
    font-family: 'Bai Jamjuree', sans-serif;
    font-size: 13px;
    line-height: 1.4;
    color: #000;
    padding: 20px;
    background: white;
    border: 1px solid #ccc;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .section-box {
    border: 1px solid #000;
    width: fit-content;
    margin: 20px auto;
  }
  
  .section-header {
    padding: 8px 20px;
    text-align: center;
    font-weight: bold;
    background: white;
  }
  
  .form-row {
    margin-bottom: 12px;
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .number {
    font-weight: normal;
    min-width: 20px;
  }
  
  .label {
    font-weight: normal;
  }
  
  .fill-data {
    font-weight: bold;
    background: #fffacd;
    padding: 2px 4px;
    border-radius: 2px;
  }
  
  .dotted-line {
    border-bottom: 1px dotted #000;
    min-width: 150px;
    height: 20px;
    display: inline-block;
    position: relative;
  }
  
  .dotted-line-full {
    border-bottom: 1px dotted #000;
    width: 100%;
    height: 20px;
    margin: 5px 0;
  }
  
  .address-box {
    margin-left: 30px;
    margin-bottom: 15px;
  }
  
  .map-box {
    border: 1px solid #000;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9f9f9;
    color: #666;
    margin: 15px 0;
  }
  
  .document-header {
    margin-bottom: 20px;
  }
  
  .doc-number-date {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
  }
  
  .document-subject {
    margin-bottom: 15px;
    font-size: 14px;
  }
  
  .document-recipient {
    margin-bottom: 15px;
  }
  
  .document-attachment {
    margin-bottom: 20px;
  }
  
  .document-body p {
    margin-bottom: 15px;
    text-align: justify;
    text-indent: 0;
  }
  
  .document-signature {
    margin-top: 30px;
    text-align: right;
  }
  
  .signature-right {
    display: inline-block;
    text-align: center;
  }
  
  .document-footer {
    margin-top: 30px;
    font-size: 12px;
  }
  
  .text {
    font-size: 12px;
  }
`;

// ฟังก์ชันแทนที่ตัวแปรใน HTML
export function replaceHtmlVariables(
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