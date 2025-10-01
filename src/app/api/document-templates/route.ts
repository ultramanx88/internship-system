import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';

interface Template {
  id: string;
  name: string;
  type: 'internship' | 'co_op';
  language: 'th' | 'en';
  format: 'pdf' | 'docx';
  path: string;
  displayName: string;
}

export async function GET() {
  try {
    const templates: Template[] = [];
    
    // Define template structure
    const templateStructure = {
      internship: {
        th: [
          { file: '01_หนังสือขอฝึกงาน', name: 'หนังสือขอฝึกงาน' },
          { file: '02_หนังสือส่งตัวฝึกงาน', name: 'หนังสือส่งตัวฝึกงาน' }
        ],
        en: [
          { file: '01_Request_Letter_Internship', name: 'Request Letter' },
          { file: '02_Introduction_Letter_Internship', name: 'Introduction Letter' }
        ]
      },
      co_op: {
        th: [
          { file: '01_แบบฟอร์มขอสหกิจศึกษา', name: 'แบบฟอร์มขอสหกิจศึกษา' },
          { file: '02_หนังสือขอสหกิจศึกษา', name: 'หนังสือขอสหกิจศึกษา' },
          { file: '03_หนังสือส่งตัวสหกิจศึกษา', name: 'หนังสือส่งตัวสหกิจศึกษา' },
          { file: '04_แบบฟอร์มประเมินสหกิจศึกษา', name: 'แบบฟอร์มประเมินสหกิจศึกษา' }
        ],
        en: [
          { file: '01_Application_Form_Cooperative_Education', name: 'Application Form' },
          { file: '02_Request_Letter_Cooperative_Education', name: 'Request Letter' },
          { file: '03_Introduction_Letter_Cooperative_Education', name: 'Introduction Letter' }
        ]
      }
    };

    // Generate template list
    Object.entries(templateStructure).forEach(([type, languages]) => {
      Object.entries(languages).forEach(([lang, files]) => {
        files.forEach((template, index) => {
          ['pdf', 'docx'].forEach(format => {
            templates.push({
              id: `${type}_${lang}_${index}_${format}`,
              name: template.name,
              type: type as 'internship' | 'co_op',
              language: lang as 'th' | 'en',
              format: format as 'pdf' | 'docx',
              path: `/document-templates/${type}/${lang}/${template.file}.${format}`,
              displayName: `${template.name} (${format.toUpperCase()})`
            });
          });
        });
      });
    });

    return NextResponse.json({
      templates: templates
    });

  } catch (error) {
    console.error('Failed to fetch document templates:', error);
    return NextResponse.json(
      { message: 'Failed to fetch document templates' },
      { status: 500 }
    );
  }
}