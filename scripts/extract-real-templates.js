const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

// ฟังก์ชันอ่านไฟล์ PDF
async function extractPdfContent(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return {
      text: data.text,
      pages: data.numpages,
      info: data.info
    };
  } catch (error) {
    console.error(`Error reading PDF ${filePath}:`, error.message);
    return null;
  }
}

// ฟังก์ชันอ่านไฟล์ DOCX
async function extractDocxContent(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return {
      text: result.value,
      messages: result.messages
    };
  } catch (error) {
    console.error(`Error reading DOCX ${filePath}:`, error.message);
    return null;
  }
}

// ฟังก์ชันแปลงข้อความเป็น HTML template
function convertToHtmlTemplate(text, templateType) {
  let html = text;
  
  // แทนที่ข้อมูลจริงด้วยตัวแปร template
  const replacements = {
    // ข้อมูลนักศึกษา
    'นายสมชาย ใจดี': '{{studentName}}',
    'Miss Somchai Jaidee': '{{studentName}}',
    '64114540001': '{{studentId}}',
    '๖๔๑๑๔๕๔๐๐๐๑': '{{studentId}}',
    'somchai.j@rmutl.ac.th': '{{studentEmail}}',
    '081-234-5678': '{{phoneNumber}}',
    '๐๘๑-๒๓๔-๕๖๗๘': '{{phoneNumber}}',
    
    // ข้อมูลบริษัท
    'บริษัท เทคโนโลยี จำกัด': '{{companyName}}',
    'Technology Company Limited': '{{companyName}}',
    'นายสมศักดิ์ ผู้จัดการ': '{{supervisorName}}',
    'Mr. Somsak Manager': '{{supervisorName}}',
    'โปรแกรมเมอร์': '{{position}}',
    'Programmer': '{{position}}',
    '123 ถนนเทคโนโลยี': '{{companyAddress}}',
    '123 Technology Road': '{{companyAddress}}',
    '02-123-4567': '{{companyPhone}}',
    '๐๒-๑๒๓-๔๕๖๗': '{{companyPhone}}',
    '02-123-4568': '{{companyFax}}',
    '๐๒-๑๒๓-๔๕๖๘': '{{companyFax}}',
    
    // วันที่และเลขที่เอกสาร
    '15 มกราคม 2567': '{{documentDate}}',
    '15 January 2024': '{{documentDate}}',
    'อว 0654.02/ว 103': '{{documentNumber}}',
    'อว ๐๖๕๔.๐๒/ว ๑๐๓': '{{documentNumber}}',
    
    // ข้อมูลมหาวิทยาลัย
    'รองศาสตราจารย์กัญฐณา ดิษฐ์แก้ว': '{{deanName}}',
    'Assoc. Prof. Kanthana Ditkaew': '{{deanName}}',
    'นายพุฒิพงค์ ประสงค์ทรัพย์': '{{coordinatorName}}',
    'Mr. Puttipong Prasongthap': '{{coordinatorName}}',
    '0 5392 1444 ต่อ 1294': '{{contactPhone}}',
    '๐ ๕๓๙๒ ๑๔๔๔ ต่อ ๑๒๙๔': '{{contactPhone}}',
    
    // ปีการศึกษา
    '2567': '{{academicYear}}',
    '๒๕๖๗': '{{academicYear}}',
    '2024': '{{academicYear}}',
    
    // ชั้นปี
    'ชั้นปีที่ 4': 'ชั้นปีที่ {{year}}',
    'ชั้นปีที่ ๔': 'ชั้นปีที่ {{year}}',
    '4th Year': '{{year}}th Year'
  };
  
  // แทนที่ข้อความ
  Object.entries(replacements).forEach(([search, replace]) => {
    html = html.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
  });
  
  // แปลงเป็น HTML structure
  if (templateType === 'application_form') {
    html = convertToApplicationFormHtml(html);
  } else if (templateType === 'request_letter') {
    html = convertToRequestLetterHtml(html);
  } else if (templateType === 'introduction_letter') {
    html = convertToIntroductionLetterHtml(html);
  }
  
  return html;
}

// แปลงเป็น HTML สำหรับแบบฟอร์มสหกิจศึกษา
function convertToApplicationFormHtml(text) {
  const lines = text.split('\n').filter(line => line.trim());
  let html = '<div class="document-page">\n';
  
  let inSection1 = false;
  let inSection2 = false;
  
  lines.forEach(line => {
    const trimmed = line.trim();
    
    if (trimmed.includes('ส่วนที่ ๑') || trimmed.includes('Part 1')) {
      html += '  <div class="section-box">\n';
      html += '    <div class="section-header">ส่วนที่ ๑</div>\n';
      html += '  </div>\n';
      inSection1 = true;
      return;
    }
    
    if (trimmed.includes('ส่วนที่ ๒') || trimmed.includes('Part 2')) {
      html += '  <div class="section-box">\n';
      html += '    <div class="section-header">ส่วนที่ ๒</div>\n';
      html += '  </div>\n';
      inSection1 = false;
      inSection2 = true;
      return;
    }
    
    if (trimmed.match(/^[๑-๙1-9]\./)) {
      html += `  <div class="form-row">\n`;
      html += `    <span class="number">${trimmed.charAt(0)}.</span>\n`;
      html += `    <span class="label">${trimmed.substring(2)}</span>\n`;
      html += `  </div>\n`;
    } else if (trimmed.includes('{{') && trimmed.includes('}}')) {
      html += `  <div class="form-row">\n`;
      html += `    <span class="fill-data">${trimmed}</span>\n`;
      html += `  </div>\n`;
    } else if (trimmed.length > 0) {
      html += `  <div class="form-row">\n`;
      html += `    <span class="text">${trimmed}</span>\n`;
      html += `  </div>\n`;
    }
  });
  
  html += '</div>';
  return html;
}

// แปลงเป็น HTML สำหรับหนังสือขอ
function convertToRequestLetterHtml(text) {
  const lines = text.split('\n').filter(line => line.trim());
  let html = '<div class="document-page">\n';
  
  let inHeader = true;
  let inBody = false;
  let inSignature = false;
  
  lines.forEach(line => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('ที่') && trimmed.includes('วันที่')) {
      html += '  <div class="document-header">\n';
      html += '    <div class="doc-number-date">\n';
      const parts = trimmed.split(/\s+วันที่\s+/);
      html += `      <span class="doc-number">${parts[0]}</span>\n`;
      html += `      <span class="doc-date">วันที่ ${parts[1] || '{{documentDate}}'}</span>\n`;
      html += '    </div>\n';
      html += '  </div>\n';
      inHeader = false;
      return;
    }
    
    if (trimmed.startsWith('เรื่อง')) {
      html += `  <div class="document-subject">\n`;
      html += `    <strong>เรื่อง</strong> ${trimmed.substring(4).trim()}\n`;
      html += `  </div>\n`;
      return;
    }
    
    if (trimmed.startsWith('เรียน')) {
      html += `  <div class="document-recipient">\n`;
      html += `    <strong>เรียน</strong> ${trimmed.substring(4).trim()}\n`;
      html += `  </div>\n`;
      return;
    }
    
    if (trimmed.startsWith('สิ่งที่ส่งมาด้วย')) {
      html += `  <div class="document-attachment">\n`;
      html += `    <strong>สิ่งที่ส่งมาด้วย</strong> ${trimmed.substring(13).trim()}\n`;
      html += `  </div>\n`;
      inBody = true;
      return;
    }
    
    if (trimmed.includes('ขอแสดงความนับถือ')) {
      inBody = false;
      inSignature = true;
      html += '  <div class="document-signature">\n';
      html += '    <div class="signature-right">\n';
      html += '      <div>ขอแสดงความนับถือ</div>\n';
      html += '      <br><br><br>\n';
      return;
    }
    
    if (inSignature && trimmed.startsWith('(') && trimmed.endsWith(')')) {
      html += `      <div>${trimmed}</div>\n`;
      return;
    }
    
    if (inSignature && trimmed.includes('คณบดี')) {
      html += `      <div>${trimmed}</div>\n`;
      html += '    </div>\n';
      html += '  </div>\n';
      inSignature = false;
      return;
    }
    
    if (inBody && trimmed.length > 0) {
      if (!html.includes('<div class="document-body">')) {
        html += '  <div class="document-body">\n';
      }
      html += `    <p>${trimmed}</p>\n`;
    }
  });
  
  if (html.includes('<div class="document-body">') && !html.includes('</div>\n  <div class="document-signature">')) {
    html += '  </div>\n';
  }
  
  html += '</div>';
  return html;
}

// แปลงเป็น HTML สำหรับหนังสือส่งตัว
function convertToIntroductionLetterHtml(text) {
  return convertToRequestLetterHtml(text); // ใช้รูปแบบเดียวกัน
}

// ฟังก์ชันหลัก
async function extractAllTemplates() {
  const templatesDir = path.join(__dirname, '..', 'document-templates');
  const outputFile = path.join(__dirname, '..', 'src', 'lib', 'extracted-templates.ts');
  
  const templates = {
    internship: {
      th: {},
      en: {}
    },
    co_op: {
      th: {},
      en: {}
    }
  };
  
  // อ่านไฟล์เทมเพลต
  const templateFiles = [
    // สหกิจศึกษา ไทย
    { type: 'co_op', lang: 'th', key: 'application_form', file: 'co-op/th/01_แบบฟอร์มขอสหกิจศึกษา.pdf' },
    { type: 'co_op', lang: 'th', key: 'request_letter', file: 'co-op/th/02_หนังสือขอสหกิจศึกษา.pdf' },
    { type: 'co_op', lang: 'th', key: 'introduction_letter', file: 'co-op/th/03_หนังสือส่งตัวสหกิจศึกษา.pdf' },
    
    // ฝึกงาน ไทย
    { type: 'internship', lang: 'th', key: 'request_letter', file: 'internship/th/01_หนังสือขอฝึกงาน.pdf' },
    { type: 'internship', lang: 'th', key: 'introduction_letter', file: 'internship/th/02_หนังสือส่งตัวฝึกงาน.pdf' }
  ];
  
  console.log('🔍 กำลังอ่านเทมเพลตจากไฟล์ PDF...');
  
  for (const template of templateFiles) {
    const filePath = path.join(templatesDir, template.file);
    
    if (fs.existsSync(filePath)) {
      console.log(`📄 อ่าน: ${template.file}`);
      
      let content = null;
      if (filePath.endsWith('.pdf')) {
        content = await extractPdfContent(filePath);
      } else if (filePath.endsWith('.docx')) {
        content = await extractDocxContent(filePath);
      }
      
      if (content && content.text) {
        const htmlTemplate = convertToHtmlTemplate(content.text, template.key);
        
        if (!templates[template.type][template.lang]) {
          templates[template.type][template.lang] = {};
        }
        
        templates[template.type][template.lang][template.key] = {
          title: getTemplateTitle(template.key, template.lang),
          content: htmlTemplate,
          originalText: content.text
        };
        
        console.log(`✅ สำเร็จ: ${template.key} (${template.lang})`);
      } else {
        console.log(`❌ ไม่สามารถอ่านไฟล์: ${template.file}`);
      }
    } else {
      console.log(`⚠️  ไม่พบไฟล์: ${template.file}`);
    }
  }
  
  // สร้างไฟล์ TypeScript
  const tsContent = `// เทมเพลต HTML ที่แปลงจากไฟล์ PDF/DOCX จริง
// สร้างโดย scripts/extract-real-templates.js

export const EXTRACTED_TEMPLATES = ${JSON.stringify(templates, null, 2)};

// CSS สำหรับเอกสาร
export const DOCUMENT_CSS = \`
  .document-page {
    font-family: 'Sarabun', 'TH SarabunPSK', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #000;
    padding: 40px;
    background: white;
    border: 1px solid #000;
    max-width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    box-shadow: none;
  }
  
  .section-box {
    border: 2px solid #000;
    width: fit-content;
    margin: 20px auto;
  }
  
  .section-header {
    padding: 8px 30px;
    text-align: center;
    font-weight: bold;
    font-size: 16px;
  }
  
  .form-row {
    margin-bottom: 15px;
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .number {
    font-weight: bold;
    min-width: 25px;
  }
  
  .label {
    font-weight: normal;
  }
  
  .fill-data {
    font-weight: bold;
    text-decoration: underline;
    min-width: 100px;
    display: inline-block;
  }
  
  .text {
    font-size: 14px;
    line-height: 1.6;
  }
  
  .document-header {
    margin-bottom: 30px;
  }
  
  .doc-number-date {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    font-size: 14px;
  }
  
  .document-subject {
    margin-bottom: 20px;
    font-size: 14px;
  }
  
  .document-recipient {
    margin-bottom: 20px;
    font-size: 14px;
  }
  
  .document-attachment {
    margin-bottom: 30px;
    font-size: 14px;
  }
  
  .document-body p {
    margin-bottom: 20px;
    text-align: justify;
    text-indent: 2em;
    font-size: 14px;
    line-height: 1.8;
  }
  
  .document-signature {
    margin-top: 50px;
    text-align: right;
  }
  
  .signature-right {
    display: inline-block;
    text-align: center;
    font-size: 14px;
  }
  
  .document-footer {
    margin-top: 30px;
    font-size: 12px;
  }
  
  @media print {
    .document-page {
      box-shadow: none;
      border: none;
      margin: 0;
      padding: 20mm;
    }
  }
\`;

// ฟังก์ชันแทนที่ตัวแปรใน HTML
export function replaceExtractedVariables(
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
  
  fs.writeFileSync(outputFile, tsContent, 'utf8');
  console.log(`\n✅ สร้างไฟล์เทมเพลตสำเร็จ: ${outputFile}`);
  console.log(`📊 จำนวนเทมเพลต: ${Object.keys(templates.co_op.th).length + Object.keys(templates.internship.th).length}`);
}

// ฟังก์ชันสร้างชื่อเทมเพลต
function getTemplateTitle(key, lang) {
  const titles = {
    th: {
      application_form: 'แบบฟอร์มขอสหกิจศึกษา',
      request_letter: 'หนังสือขอความอนุเคราะห์',
      introduction_letter: 'หนังสือส่งตัว'
    },
    en: {
      application_form: 'Co-operative Education Application Form',
      request_letter: 'Request Letter',
      introduction_letter: 'Introduction Letter'
    }
  };
  
  return titles[lang]?.[key] || key;
}

// เรียกใช้งาน
extractAllTemplates().catch(console.error);