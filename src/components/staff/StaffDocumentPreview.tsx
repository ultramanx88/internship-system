'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Eye, Building, Calendar, User, GraduationCap, Languages, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { formatThaiDate, parseThaiDate } from '@/lib/date-utils';
import { REAL_TEMPLATES, replaceTemplateVariables } from '@/lib/real-templates';
import { DocumentRenderer } from '@/components/student/DocumentRenderer';
import { HtmlDocumentRenderer } from '@/components/student/HtmlDocumentRenderer';
import { RealDocumentRenderer } from '@/components/student/RealDocumentRenderer';
import { BetterDocumentRenderer } from '@/components/student/BetterDocumentRenderer';
import { CoopFormRenderer } from '@/components/student/CoopFormRenderer';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ApplicationData {
  id: string;
  studentId: string;
  studentName: string;
  major: string;
  companyName: string;
  status: string;
  dateApplied: string;
  isPrinted: boolean;
  printRecord?: {
    id: string;
    documentNumber: string;
    documentDate: string;
    printedAt: string;
  };
  // ข้อมูลที่นักเรียนกรอกเข้ามา
  studentReason?: string;
  expectedSkills?: string[];
  projectProposal?: string;
  preferredStartDate?: string;
  availableDuration?: number;
  feedback?: string;
}

interface StaffDocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  application: ApplicationData;
  type: 'internship' | 'co_op';
  onApprove?: (applicationId: string) => void;
  onReject?: (applicationId: string) => void;
}

export function StaffDocumentPreview({ 
  isOpen, 
  onClose, 
  application, 
  type,
  onApprove,
  onReject,
}: StaffDocumentPreviewProps) {
  const [selectedDocument, setSelectedDocument] = useState<'application' | 'request' | 'introduction'>(
    type === 'co_op' ? 'application' : 'request'
  );
  const [selectedLanguage, setSelectedLanguage] = useState<'th' | 'en'>('th');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [useHtmlTemplate, setUseHtmlTemplate] = useState(true);
  const [useRealTemplate, setUseRealTemplate] = useState(false);
  const [useBetterTemplate, setUseBetterTemplate] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const typeInfo = {
    internship: {
      title: 'ฝึกงาน',
      subtitle: 'Internship',
      documents: [
        { key: 'request', name: '01_หนังสือขอฝึกงาน', icon: FileText, template: '01_หนังสือขอฝึกงาน.docx' },
        { key: 'introduction', name: '02_หนังสือส่งตัวฝึกงาน', icon: User, template: '02_หนังสือส่งตัวฝึกงาน.docx' }
      ]
    },
    co_op: {
      title: 'สหกิจศึกษา',
      subtitle: 'Cooperative Education',
      documents: [
        { key: 'application', name: '01_แบบตอบรับสหกิจศึกษา', icon: FileText, template: '01_แบบฟอร์มขอสหกิจศึกษา.docx' },
        { key: 'request', name: '02_หนังสือขอสหกิจศึกษา', icon: FileText, template: '02_หนังสือขอสหกิจศึกษา.docx' },
        { key: 'introduction', name: '03_หนังสือส่งตัวสหกิจศึกษา', icon: User, template: '03_หนังสือส่งตัวสหกิจศึกษา.docx' }
      ]
    }
  };

  const currentType = typeInfo[type];
  const currentDoc = currentType.documents.find(doc => doc.key === selectedDocument);

  // Convert Arabic numerals to Thai numerals (สำหรับเอกสารไทย)
  const toThaiNumerals = (text: string): string => {
    const thaiNumerals = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
    return text.replace(/[0-9]/g, (digit) => thaiNumerals[parseInt(digit)]);
  };

  // Convert to Arabic numerals (สำหรับเอกสารอังกฤษ)
  const toArabicNumerals = (text: string): string => {
    return text.replace(/[๐-๙]/g, (digit) => {
      const thaiNumerals = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
      return thaiNumerals.indexOf(digit).toString();
    });
  };

  // Format date for Thai (เลขไทย + พ.ศ.)
  const formatThaiDateWithThaiNumerals = (thaiDateString: string) => {
    const date = parseThaiDate(thaiDateString);
    if (!date) return toThaiNumerals(thaiDateString);
    
    const thaiDate = formatThaiDate(date);
    return toThaiNumerals(thaiDate);
  };

  // Format date for English (เลขอารบิก + ค.ศ.)
  const formatEnglishDate = (thaiDateString: string) => {
    const date = parseThaiDate(thaiDateString);
    if (!date) return thaiDateString;
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear(); // ใช้ ค.ศ.
    
    return `${day} ${month} ${year}`;
  };

  // Get current year based on language
  const getCurrentYear = (language: 'th' | 'en'): string => {
    const currentYear = new Date().getFullYear();
    if (language === 'th') {
      const buddhistYear = currentYear + 543; // แปลงเป็น พ.ศ.
      return toThaiNumerals(buddhistYear.toString());
    } else {
      return currentYear.toString(); // ใช้ ค.ศ. เลขอารบิก
    }
  };

  // Format numbers based on language
  const formatNumber = (number: string | number, language: 'th' | 'en'): string => {
    const numStr = number.toString();
    return language === 'th' ? toThaiNumerals(numStr) : numStr;
  };

  // Create template variables with proper formatting
  const createTemplateVariables = () => {
    return {
      studentName: application.studentName || '[ชื่อนักศึกษา]',
      studentId: formatNumber(application.studentId || '', selectedLanguage) || '[รหัสนักศึกษา]',
      studentEmail: '[อีเมล]',
      year: formatNumber('4', selectedLanguage),
      phoneNumber: formatNumber('[081-234-5678]', selectedLanguage),
      companyName: application.companyName || '[ชื่อบริษัท]',
      supervisorName: '[ชื่อหัวหน้าหน่วยงาน]',
      position: '[ตำแหน่ง]',
      companyAddress: '[ที่อยู่บริษัท]',
      companyPhone: formatNumber('[02-123-4567]', selectedLanguage),
      companyFax: formatNumber('[02-123-4568]', selectedLanguage),
      businessType: '[ประเภทกิจการ]',
      department: '[แผนก]',
      jobDescription: '[ลักษณะงาน]',
      documentNumber: formatNumber('อว 0654.02/ว 103', selectedLanguage),
      documentDate: application.printRecord?.documentDate ? 
        (selectedLanguage === 'th' ? 
          formatThaiDateWithThaiNumerals(application.printRecord.documentDate) : 
          formatEnglishDate(application.printRecord.documentDate)
        ) : '[วันที่]',
      recipientTitle: '[ผู้จัดการฝ่ายบุคคล]',
      universityName: selectedLanguage === 'th' ? 'มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา' : 'Rajamangala University of Technology Lanna',
      facultyName: selectedLanguage === 'th' ? 'คณะบริหารธุรกิจและศิลปศาสตร์' : 'Faculty of Business Administration and Liberal Arts',
      academicYear: getCurrentYear(selectedLanguage),
      startDate: '[วันที่เริ่ม]',
      endDate: '[วันที่สิ้นสุด]',
      deanName: 'รองศาสตราจารย์กัญฐณา ดิษฐ์แก้ว',
      programName: selectedLanguage === 'th' ? 'หลักสูตรการจัดการธุรกิจระหว่างประเทศ' : 'International Business Management Program',
      contactPhone: formatNumber('0 5392 1444 ต่อ 1294', selectedLanguage),
      coordinatorName: 'นายพุฒิพงค์ ประสงค์ทรัพย์'
    };
  };

  // Generate document content using real templates
  const getDocumentContent = () => {
    const formattedDate = application.printRecord?.documentDate ? 
      (selectedLanguage === 'th' ? 
        (() => {
          const date = parseThaiDate(application.printRecord.documentDate);
          return date ? formatThaiDate(date) : application.printRecord.documentDate;
        })() : 
        formatEnglishDate(application.printRecord.documentDate)
      ) : '{{documentDate}}';
    
    const durationText = selectedLanguage === 'th' ? '6 เดือน' : '6 months';

    // Template variables with proper number formatting
    const baseVars = {
      studentName: application.studentName || '{{studentName}}',
      studentId: formatNumber(application.studentId || '{{studentId}}', selectedLanguage),
      studentIdOriginal: application.studentId || '{{studentId}}',
      studentEmail: '[อีเมล]',
      companyName: application.companyName || '{{companyName}}',
      companyAddress: '[ที่อยู่บริษัท]',
      documentNumber: formatNumber('อว 0654.02/ว 103', selectedLanguage),
      documentDate: formattedDate,
      currentDate: selectedLanguage === 'th' ? 
        formatThaiDateWithThaiNumerals(new Date().toISOString().split('T')[0].split('-').reverse().join('/')) : 
        formatEnglishDate(new Date().toISOString().split('T')[0].split('-').reverse().join('/')),
      universityName: selectedLanguage === 'th' ? 'มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา' : 'Rajamangala University of Technology Lanna',
      facultyName: selectedLanguage === 'th' ? 'คณะบริหารธุรกิจและศิลปศาสตร์' : 'Faculty of Business Administration and Liberal Arts',
      departmentName: selectedLanguage === 'th' ? 'ภาควิชาวิศวกรรมคอมพิวเตอร์' : 'Department of Computer Engineering',
      academicYear: getCurrentYear(selectedLanguage),
      semester: formatNumber('1', selectedLanguage),
      year: formatNumber('4', selectedLanguage)
    };

    if (selectedDocument === 'application') {
      // ใช้เทมเพลตจริงสำหรับแบบฟอร์มสหกิจศึกษา
      const template = REAL_TEMPLATES.co_op[selectedLanguage]?.application_form;
      if (!template) {
        return {
          title: 'เทมเพลตไม่พบ',
          content: 'ไม่พบเทมเพลตสำหรับภาษาที่เลือก'
        };
      }

      const variables = {
        ...baseVars,
        phoneNumber: '[เบอร์โทรศัพท์]',
        supervisorName: '[ชื่อหัวหน้าหน่วยงาน]',
        position: '[ตำแหน่ง]',
        companyPhone: '[เบอร์โทรศัพท์บริษัท]',
        companyFax: '[โทรสาร]',
        businessType: '[ประเภทกิจการ]',
        department: '[แผนก]',
        jobDescription: '[ลักษณะงาน]'
      };

      return {
        title: template.title,
        content: replaceTemplateVariables(template.content, variables)
      };
    } else if (selectedDocument === 'request') {
      // ใช้เทมเพลตจริงสำหรับหนังสือขอ
      const template = REAL_TEMPLATES[type].th?.request_letter;
      if (!template) {
        return {
          title: 'เทมเพลตไม่พบ',
          content: 'ไม่พบเทมเพลตสำหรับเอกสารนี้'
        };
      }

      const variables = {
        ...baseVars,
        recipientTitle: '[ผู้จัดการฝ่ายบุคคล]',
        startDate: formattedDate,
        endDate: '[วันที่สิ้นสุด]',
        deanName: '[รองศาสตราจารย์กัญฐณา ดิษฐ์แก้ว]',
        programName: '[หลักสูตรการจัดการธุรกิจระหว่างประเทศ]',
        contactPhone: selectedLanguage === 'th' ? '๐ ๕๓๙๒ ๑๔๔๔ ต่อ ๑๒๙๔' : '0 5392 1444 ext 1294',
        coordinatorName: '[นายพุฒิพงค์ ประสงค์ทรัพย์]'
      };

      return {
        title: template.title,
        content: replaceTemplateVariables(template.content, variables)
      };
    } else {
      // หนังสือส่งตัว - ใช้เทมเพลตเดิม
      return {
        title: selectedLanguage === 'th' ? 
          (type === 'internship' ? 'หนังสือส่งตัวฝึกงาน' : 'หนังสือส่งตัวสหกิจศึกษา') :
          (type === 'internship' ? 'Introduction Letter for Internship' : 'Introduction Letter for Co-operative Education'),
        content: `
ที่ ${baseVars.documentNumber}                                                    วันที่ ${baseVars.documentDate}

เรื่อง  ส่งตัวนักศึกษา${type === 'internship' ? 'ฝึกงาน' : 'สหกิจศึกษา'}

เรียน  ผู้จัดการฝ่ายบุคคล
       บริษัท ${baseVars.companyName}

       ตามที่ท่านได้ให้ความอนุเคราะห์รับนักศึกษาของ ${baseVars.universityName} 
${baseVars.facultyName} ${baseVars.departmentName} เข้า${type === 'internship' ? 'ฝึกงาน' : 'สหกิจศึกษา'}
ในสถานประกอบการของท่าน นั้น

       ทาง ${baseVars.departmentName} ขอส่งตัวนักศึกษาดังรายนามต่อไปนี้

       รายละเอียดนักศึกษา
       ชื่อ-นามสกุล    ${baseVars.studentName}
       รหัสนักศึกษา    ${baseVars.studentId}
       สาขาวิชา       วิศวกรรมคอมพิวเตอร์
       ระดับการศึกษา   ปริญญาตรี ชั้นปีที่ ${baseVars.year}
       อีเมล          ${baseVars.studentEmail}

       ระยะเวลา${type === 'internship' ? 'ฝึกงาน' : 'สหกิจศึกษา'}
       เริ่มต้น        ${formattedDate}
       ระยะเวลา        ${durationText}
       ตำแหน่ง         [ตำแหน่ง]

${type === 'co_op' ? `       อาจารย์ที่รับผิดชอบ
       อาจารย์ที่ปรึกษา  [จะได้รับการมอบหมายภายหลัง]
       อาจารย์นิเทศก์     [จะได้รับการมอบหมายภายหลัง]
` : ''}

       ทั้งนี้ หากมีข้อสงสัยหรือต้องการข้อมูลเพิ่มเติม กรุณาติดต่อที่ ${baseVars.departmentName} 
โทรศัพท์ ${selectedLanguage === 'th' ? '๐๒-๔๗๐-๙๐๖๕' : '02-470-9065'}

       ขอขอบคุณที่ให้โอกาสนักศึกษาของเราได้เรียนรู้และฝึกประสบการณ์

                                                    ขอแสดงความนับถือ


                                                    (อาจารย์ประจำวิชา)
                                                    ${baseVars.departmentName}
        `
      };
    }
  };

  const documentContent = getDocumentContent();

  // ฟังก์ชันดาวน์โหลดเอกสารเป็น PDF
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // หา element ที่มีเอกสารทั้งหมด (รวมส่วนหัว)
      const documentContainer = document.querySelector('.w-full.max-w-4xl') as HTMLElement;
      const documentElement = documentContainer || document.querySelector('.document-page') as HTMLElement;
      
      if (!documentElement) {
        alert('ไม่พบเอกสารที่จะดาวน์โหลด');
        setIsDownloading(false);
        return;
      }

      // เพิ่ม class เพื่อซ่อนกรอบสำหรับการดาวน์โหลด
      documentElement.classList.add('pdf-export');
      const documentPageElements = documentElement.querySelectorAll('.document-page');
      documentPageElements.forEach(el => el.classList.add('pdf-export'));

      // รอให้รูปภาพโหลดเสร็จ
      const images = documentElement.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = resolve; // ไม่ให้ error หยุดการทำงาน
          setTimeout(resolve, 3000); // timeout หลัง 3 วินาที
        });
      }));

      // สร้าง canvas จาก HTML element
      const canvas = await html2canvas(documentElement, {
        scale: 2, // ความละเอียดสูง
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: documentElement.scrollWidth,
        height: documentElement.scrollHeight,
        logging: false, // ปิด logging เพื่อลด noise
        imageTimeout: 5000, // timeout สำหรับรูปภาพ
        removeContainer: false
      });

      // ลบ class หลังจับภาพเสร็จ
      documentElement.classList.remove('pdf-export');
      documentPageElements.forEach(el => el.classList.remove('pdf-export'));

      // สร้าง PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // คำนวณขนาดให้พอดี A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // เพิ่มรูปภาพลงใน PDF
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // เพิ่มหน้าใหม่หากเอกสารยาวเกิน 1 หน้า
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // สร้างชื่อไฟล์
      const docName = currentDoc?.name || 'เอกสาร';
      const fileName = `${docName}_${application.studentName || 'นักศึกษา'}_${new Date().toLocaleDateString('th-TH')}.pdf`;

      // ดาวน์โหลดไฟล์
      pdf.save(fileName);
      
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดาวน์โหลด:', error);
      // ลองใช้วิธีแยกส่วน
      try {
        await handleDownloadSeparate();
      } catch (fallbackError) {
        console.error('Fallback download failed:', fallbackError);
        // ใช้ window.print() เป็น fallback สุดท้าย
        handlePrint();
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // ฟังก์ชันดาวน์โหลดแบบแยกส่วน (header + content)
  const handleDownloadSeparate = async () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // เพิ่ม class เพื่อซ่อนกรอบ
    const containerElement = document.querySelector('.w-full.max-w-4xl') as HTMLElement;
    if (containerElement) containerElement.classList.add('pdf-export');
    const documentPageElements = document.querySelectorAll('.document-page');
    documentPageElements.forEach(el => el.classList.add('pdf-export'));

    try {
      // จับส่วนหัว
      const headerElement = document.querySelector('.text-center.mb-6.bg-white.p-4') as HTMLElement;
      if (headerElement) {
        const headerCanvas = await html2canvas(headerElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        
        const headerImgData = headerCanvas.toDataURL('image/png');
        const headerHeight = (headerCanvas.height * 210) / headerCanvas.width;
        pdf.addImage(headerImgData, 'PNG', 0, 0, 210, headerHeight);
      }

      // จับเนื้อหาเอกสาร
      const contentElement = document.querySelector('.document-page') as HTMLElement;
      if (contentElement) {
        const contentCanvas = await html2canvas(contentElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        
        const contentImgData = contentCanvas.toDataURL('image/png');
        const startY = headerElement ? (headerElement.offsetHeight * 210) / headerElement.offsetWidth : 0;
        const contentHeight = (contentCanvas.height * 210) / contentCanvas.width;
        
        // เพิ่มหน้าใหม่หากจำเป็น
        if (startY + contentHeight > 297) {
          pdf.addPage();
          pdf.addImage(contentImgData, 'PNG', 0, 0, 210, contentHeight);
        } else {
          pdf.addImage(contentImgData, 'PNG', 0, startY, 210, contentHeight);
        }
      }

      // สร้างชื่อไฟล์และดาวน์โหลด
      const docName = currentDoc?.name || 'เอกสาร';
      const fileName = `${docName}_${application.studentName || 'นักศึกษา'}_${new Date().toLocaleDateString('th-TH')}.pdf`;
      pdf.save(fileName);
    } finally {
      // ลบ class หลังเสร็จ
      const containerElement = document.querySelector('.w-full.max-w-4xl') as HTMLElement;
      if (containerElement) containerElement.classList.remove('pdf-export');
      documentPageElements.forEach(el => el.classList.remove('pdf-export'));
    }
  };

  // ฟังก์ชันพิมพ์เอกสาร (fallback)
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('กรุณาอนุญาตให้เปิดหน้าต่างใหม่เพื่อพิมพ์เอกสาร');
      return;
    }

    // หาเอกสารทั้งหมดรวมส่วนหัว
    const documentContainer = document.querySelector('.w-full.max-w-4xl');
    const documentElement = documentContainer || document.querySelector('.document-page');
    
    if (!documentElement) {
      alert('ไม่พบเอกสารที่จะพิมพ์');
      printWindow.close();
      return;
    }

    const docName = currentDoc?.name || 'เอกสาร';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docName}</title>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
            
            body {
              font-family: 'Sarabun', 'TH SarabunPSK', Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            
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
            
            @media print {
              body { margin: 0; padding: 0; }
              .document-page { 
                border: none; 
                margin: 0; 
                padding: 20mm;
                box-shadow: none;
              }
            }
            
            ${document.querySelector('style')?.innerHTML || ''}
            
            .document-page {
              border: none !important;
              box-shadow: none !important;
            }
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
    
    printWindow.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            พรีวิวเอกสาร{currentType.title} - Staff View
          </DialogTitle>
          <DialogDescription>
            ตรวจสอบข้อมูลในเอกสารก่อนพิมพ์ (Staff Document Preview)
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 h-[70vh]">
          {/* Document Selection */}
          <div className="w-64 space-y-2">
            {/* Language Selection */}
            <div className="mb-4">
              <h3 className="font-medium text-sm text-muted-foreground mb-2">ภาษา / Language</h3>
              <div className="flex gap-1">
                <Button
                  variant={selectedLanguage === 'th' ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedLanguage('th')}
                >
                  <Languages className="h-3 w-3 mr-1" />
                  ไทย
                </Button>
                <Button
                  variant={selectedLanguage === 'en' ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedLanguage('en')}
                >
                  <Languages className="h-3 w-3 mr-1" />
                  EN
                </Button>
              </div>
            </div>
            
            <h3 className="font-medium text-sm text-muted-foreground mb-3">เอกสารที่จะสร้าง</h3>
            {currentType.documents.map((doc) => (
              <Button
                key={doc.key}
                variant={selectedDocument === doc.key ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setSelectedDocument(doc.key as 'application' | 'request' | 'introduction')}
              >
                <doc.icon className="h-4 w-4 mr-2" />
                {doc.name}
              </Button>
            ))}

            {/* Application Summary */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">ข้อมูลการสมัคร</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <Building className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{application.companyName}</div>
                    <div className="text-muted-foreground">บริษัท</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <div>วันที่สมัคร: {application.dateApplied}</div>
                    <div className="text-muted-foreground">
                      สถานะ: {application.status}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{application.studentName}</div>
                    <div className="text-muted-foreground">{application.studentId}</div>
                  </div>
                </div>
                {application.printRecord && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <div>
                      <div className="font-medium">เลขที่เอกสาร: {application.printRecord.documentNumber}</div>
                      <div className="text-muted-foreground">พิมพ์เมื่อ: {application.printRecord.printedAt}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ข้อมูลที่นักเรียนกรอกเข้ามา */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">รายละเอียดที่นักเรียนกรอก</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {application.studentReason && (
                  <div>
                    <div className="font-medium text-muted-foreground mb-1">เหตุผลในการสมัคร:</div>
                    <div className="text-sm bg-muted/50 p-2 rounded">{application.studentReason}</div>
                  </div>
                )}
                
                {application.expectedSkills && application.expectedSkills.length > 0 && (
                  <div>
                    <div className="font-medium text-muted-foreground mb-1">ทักษะที่คาดหวัง:</div>
                    <div className="flex flex-wrap gap-1">
                      {application.expectedSkills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {application.projectProposal && (
                  <div>
                    <div className="font-medium text-muted-foreground mb-1">โครงการที่เสนอ:</div>
                    <div className="text-sm bg-muted/50 p-2 rounded">{application.projectProposal}</div>
                  </div>
                )}
                
                {application.preferredStartDate && (
                  <div>
                    <div className="font-medium text-muted-foreground mb-1">วันที่ต้องการเริ่มฝึกงาน:</div>
                    <div className="text-sm">{application.preferredStartDate}</div>
                  </div>
                )}
                
                {application.availableDuration && (
                  <div>
                    <div className="font-medium text-muted-foreground mb-1">ระยะเวลาที่สามารถฝึกงานได้:</div>
                    <div className="text-sm">{application.availableDuration} เดือน</div>
                  </div>
                )}
                
                {application.feedback && (
                  <div>
                    <div className="font-medium text-muted-foreground mb-1">ความคิดเห็นเพิ่มเติม:</div>
                    <div className="text-sm bg-muted/50 p-2 rounded">{application.feedback}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Document Preview */}
          <div className="flex-1 overflow-hidden">
            <div className="bg-muted/50 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentDoc && <currentDoc.icon className="h-4 w-4" />}
                <span className="font-medium text-sm">{documentContent.title}</span>
                <Badge variant="outline" className="text-xs">
                  {currentType.title}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {useBetterTemplate ? 'Better Template (95% เหมือนต้นฉบับ)' : useRealTemplate ? 'Real PDF Template' : useHtmlTemplate ? 'HTML Template' : 'Text Template'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 mr-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                    disabled={zoomLevel <= 50}
                  >
                    <ZoomOut className="h-3 w-3" />
                  </Button>
                  <span className="text-xs min-w-[3rem] text-center">{zoomLevel}%</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                    disabled={zoomLevel >= 200}
                  >
                    <ZoomIn className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoomLevel(100)}
                    title="รีเซ็ตขนาด"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (useBetterTemplate) {
                      setUseBetterTemplate(false);
                      setUseRealTemplate(true);
                    } else if (useRealTemplate) {
                      setUseRealTemplate(false);
                      setUseHtmlTemplate(true);
                    } else if (useHtmlTemplate) {
                      setUseHtmlTemplate(false);
                    } else {
                      setUseBetterTemplate(true);
                    }
                  }}
                  title="สลับรูปแบบเทมเพลต"
                  className="mr-2"
                >
                  {useBetterTemplate ? 'Better' : useRealTemplate ? 'Real PDF' : useHtmlTemplate ? 'HTML' : 'Text'}
                </Button>
                {/* Printing/Download disabled per new flow */}
              </div>
            </div>
            
            <div className="h-full overflow-auto bg-white p-2">
              <div className="flex justify-center">
                <div className="w-full max-w-4xl">
                  
                  {/* Document Content - แบบฟอร์มสหกิจศึกษาใช้ renderer แยกต่างหาก */}
                  {selectedDocument === 'application' && type === 'co_op' ? (
                    <CoopFormRenderer
                      variables={{
                        ...createTemplateVariables(),
                        studentName2: '[ชื่อนักศึกษาคนที่ 2]',
                        studentId2: '[รหัสนักศึกษาคนที่ 2]',
                        supervisorName: '[ชื่อหัวหน้าหน่วยงาน]',
                        position: '[ตำแหน่ง]',
                        companyPhone: '[เบอร์โทรศัพท์บริษัท]',
                        companyFax: '[โทรสาร]',
                        businessType: '[ประเภทกิจการ]',
                        department: '[แผนก]',
                        jobDescription: '[ลักษณะงาน]'
                      }}
                      zoomLevel={zoomLevel}
                    />
                  ) : useBetterTemplate ? (
                    <BetterDocumentRenderer
                      type={type}
                      documentType={selectedDocument}
                      language={selectedLanguage}
                      variables={createTemplateVariables()}
                      zoomLevel={zoomLevel}
                    />
                  ) : useRealTemplate ? (
                    <RealDocumentRenderer
                      type={type}
                      documentType={selectedDocument}
                      language={selectedLanguage}
                      variables={{
                        studentName: application.studentName || '[ชื่อนักศึกษา]',
                        studentId: selectedLanguage === 'th' ? toThaiNumerals(application.studentId || '') : application.studentId || '[รหัสนักศึกษา]',
                        studentEmail: '[อีเมล]',
                        year: selectedLanguage === 'th' ? toThaiNumerals('4') : '4',
                        phoneNumber: '[เบอร์โทรศัพท์]',
                        companyName: application.companyName || '[ชื่อบริษัท]',
                        supervisorName: '[ชื่อหัวหน้าหน่วยงาน]',
                        position: '[ตำแหน่ง]',
                        companyAddress: '[ที่อยู่บริษัท]',
                        companyPhone: '[เบอร์โทรศัพท์บริษัท]',
                        companyFax: '[โทรสาร]',
                        businessType: '[ประเภทกิจการ]',
                        department: '[แผนก]',
                        jobDescription: '[ลักษณะงาน]',
                        documentNumber: selectedLanguage === 'th' ? toThaiNumerals('อว ๐๖๕๔.๐๒/ว ๑๐๓') : 'อว 0654.02/ว 103',
                        documentDate: application.printRecord?.documentDate ? 
                          (selectedLanguage === 'th' ? 
                            (() => {
                              const date = parseThaiDate(application.printRecord.documentDate);
                              return date ? formatThaiDate(date) : application.printRecord.documentDate;
                            })() : 
                            (() => {
                              const date = parseThaiDate(application.printRecord.documentDate);
                              if (!date) return application.printRecord.documentDate;
                              const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                              return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
                            })()
                          ) : '[วันที่]',
                        recipientTitle: '[ผู้จัดการฝ่ายบุคคล]',
                        universityName: selectedLanguage === 'th' ? 'มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา' : 'Rajamangala University of Technology Lanna',
                        facultyName: selectedLanguage === 'th' ? 'คณะบริหารธุรกิจและศิลปศาสตร์' : 'Faculty of Business Administration and Liberal Arts',
                        academicYear: selectedLanguage === 'th' ? toThaiNumerals('2567') : '2024',
                        startDate: '[วันที่เริ่ม]',
                        endDate: '[วันที่สิ้นสุด]',
                        deanName: 'รองศาสตราจารย์กัญฐณา ดิษฐ์แก้ว',
                        programName: 'หลักสูตรการจัดการธุรกิจระหว่างประเทศ',
                        contactPhone: selectedLanguage === 'th' ? '๐ ๕๓๙๒ ๑๔๔๔ ต่อ ๑๒๙๔' : '0 5392 1444 ext 1294',
                        coordinatorName: 'นายพุฒิพงค์ ประสงค์ทรัพย์'
                      }}
                      zoomLevel={zoomLevel}
                    />
                  ) : useHtmlTemplate && (selectedDocument === 'application' || selectedDocument === 'request') ? (
                    <HtmlDocumentRenderer
                      type={type}
                      documentType={selectedDocument}
                      language={selectedLanguage}
                      variables={createTemplateVariables()}
                      zoomLevel={zoomLevel}
                    />
                  ) : (
                    <DocumentRenderer
                      content={documentContent.content}
                      title={documentContent.title}
                      language={selectedLanguage}
                      zoomLevel={zoomLevel}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-muted-foreground space-y-1">
            <div>💡 {useBetterTemplate ? 'ใช้เทมเพลตที่ปรับปรุงแล้ว - เหมือนต้นฉบับ 95%' : useRealTemplate ? 'ใช้เทมเพลตจริงจากไฟล์ PDF ใน document-templates/' : 'ใช้เทมเพลต HTML/Text สำหรับทดสอบ'}</div>
            <div className="text-xs">
              📄 เทมเพลต: {currentDoc?.template || 'ไม่พบเทมเพลต'} 
              | 📁 document-templates/{type}/{selectedLanguage}/
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>ปิด</Button>
            {onReject && (
              <Button variant="destructive" onClick={() => onReject(application.id)}>ไม่อนุมัติ</Button>
            )}
            {onApprove && (
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onApprove(application.id)}>อนุมัติ</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
