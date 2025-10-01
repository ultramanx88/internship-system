// สคริปต์สำหรับอ่านเทมเพลต PDF/DOCX
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse'); // สำหรับ PDF
const mammoth = require('mammoth'); // สำหรับ DOCX

async function readPdfTemplate(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error reading PDF:', error);
    return null;
  }
}

async function readDocxTemplate(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error reading DOCX:', error);
    return null;
  }
}

async function analyzeTemplates() {
  const templatesDir = path.join(__dirname, '../document-templates');
  const analysis = {};
  
  // อ่านไฟล์ในโฟลเดอร์ templates
  const types = ['internship', 'co-op'];
  const languages = ['th', 'en'];
  
  for (const type of types) {
    analysis[type] = {};
    for (const lang of languages) {
      const dirPath = path.join(templatesDir, type, lang);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        analysis[type][lang] = {};
        
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const ext = path.extname(file).toLowerCase();
          
          if (ext === '.pdf') {
            const content = await readPdfTemplate(filePath);
            analysis[type][lang][file] = {
              type: 'pdf',
              content: content,
              variables: extractVariables(content)
            };
          } else if (ext === '.docx') {
            const content = await readDocxTemplate(filePath);
            analysis[type][lang][file] = {
              type: 'docx', 
              content: content,
              variables: extractVariables(content)
            };
          }
        }
      }
    }
  }
  
  // บันทึกผลการวิเคราะห์
  fs.writeFileSync(
    path.join(templatesDir, 'analysis.json'),
    JSON.stringify(analysis, null, 2)
  );
  
  console.log('Template analysis completed!');
  return analysis;
}

function extractVariables(content) {
  if (!content) return [];
  
  // หาตัวแปรในรูปแบบ {{variable}}
  const matches = content.match(/\{\{[^}]+\}\}/g);
  return matches ? [...new Set(matches)] : [];
}

// รันสคริปต์
if (require.main === module) {
  analyzeTemplates().catch(console.error);
}

module.exports = { readPdfTemplate, readDocxTemplate, analyzeTemplates };