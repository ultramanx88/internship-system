'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Eye, Building, Calendar, User, GraduationCap, Languages } from 'lucide-react';
import { formatThaiDate, parseThaiDate } from '@/lib/date-utils';
import { REAL_TEMPLATES, replaceTemplateVariables } from '@/lib/real-templates';

interface ApplicationFormData {
  internshipId: string;
  studentReason: string;
  expectedSkills: string;
  preferredStartDate: string;
  availableDuration: string;
  projectProposal?: string;
}

interface InternshipData {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'internship' | 'co_op';
  description: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  studentId: string;
  faculty?: string;
  department?: string;
  year?: string;
}

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ApplicationFormData;
  internship: InternshipData;
  user: UserData;
  type: 'internship' | 'co_op';
}

export function DocumentPreview({ 
  isOpen, 
  onClose, 
  formData, 
  internship, 
  user, 
  type 
}: DocumentPreviewProps) {
  const [selectedDocument, setSelectedDocument] = useState<'application' | 'request' | 'introduction'>(
    type === 'co_op' ? 'application' : 'request'
  );
  const [selectedLanguage, setSelectedLanguage] = useState<'th' | 'en'>('th');

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
        { key: 'application', name: '01_แบบฟอร์มขอสหกิจศึกษา', icon: FileText, template: '01_แบบฟอร์มขอสหกิจศึกษา.docx' },
        { key: 'request', name: '02_หนังสือขอสหกิจศึกษา', icon: FileText, template: '02_หนังสือขอสหกิจศึกษา.docx' },
        { key: 'introduction', name: '03_หนังสือส่งตัวสหกิจศึกษา', icon: User, template: '03_หนังสือส่งตัวสหกิจศึกษา.docx' }
      ]
    }
  };

  const currentType = typeInfo[type];
  const currentDoc = currentType.documents.find(doc => doc.key === selectedDocument);

  // Convert Arabic numerals to Thai numerals
  const toThaiNumerals = (text: string): string => {
    const thaiNumerals = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
    return text.replace(/[0-9]/g, (digit) => thaiNumerals[parseInt(digit)]);
  };

  // Format date for English
  const formatEnglishDate = (thaiDateString: string) => {
    const date = parseThaiDate(thaiDateString);
    if (!date) return thaiDateString;
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  };

  // Generate document content based on actual template structure
  const getDocumentContent = () => {
    const formattedDate = formData.preferredStartDate ? 
      (selectedLanguage === 'th' ? 
        (() => {
          const date = parseThaiDate(formData.preferredStartDate);
          return date ? formatThaiDate(date) : formData.preferredStartDate;
        })() : 
        formatEnglishDate(formData.preferredStartDate)
      ) : '{{documentDate}}';
    
    const durationText = selectedLanguage === 'th' ? {
      '2months': '2 เดือน',
      '3months': '3 เดือน', 
      '4months': '4 เดือน',
      '5months': '5 เดือน',
      '6months': '6 เดือน'
    }[formData.availableDuration] || formData.availableDuration || '[ระบุระยะเวลา]' : {
      '2months': '2 months',
      '3months': '3 months', 
      '4months': '4 months',
      '5months': '5 months',
      '6months': '6 months'
    }[formData.availableDuration] || formData.availableDuration || '[Specify duration]';

    // Template variables based on document-utils.ts
    const templateVars = selectedLanguage === 'th' ? {
      studentName: user.name || '{{studentName}}',
      studentId: toThaiNumerals(user.studentId || '{{studentId}}'),
      studentIdOriginal: user.studentId || '{{studentId}}',
      studentEmail: user.email || '{{studentEmail}}',
      companyName: internship.company || '{{companyName}}',
      companyAddress: '{{companyAddress}}',
      documentNumber: toThaiNumerals('{{documentNumber}}'),
      documentDate: formattedDate,
      currentDate: formatThaiDate(new Date()),
      universityName: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี',
      facultyName: 'คณะวิศวกรรมศาสตร์',
      departmentName: 'ภาควิชาวิศวกรรมคอมพิวเตอร์',
      academicYear: toThaiNumerals((new Date().getFullYear() + 543).toString()),
      semester: toThaiNumerals('1'),
      year: toThaiNumerals(user.year || '4')
    } : {
      studentName: user.name || '{{studentName}}',
      studentId: user.studentId || '{{studentId}}',
      studentIdOriginal: user.studentId || '{{studentId}}',
      studentEmail: user.email || '{{studentEmail}}',
      companyName: internship.company || '{{companyName}}',
      companyAddress: '{{companyAddress}}',
      documentNumber: '{{documentNumber}}',
      documentDate: formattedDate,
      currentDate: formatEnglishDate(new Date().toISOString().split('T')[0].split('-').reverse().join('/')),
      universityName: 'Rajamangala University of Technology Lanna',
      facultyName: 'Faculty of Engineering',
      departmentName: 'Department of Computer Engineering',
      academicYear: new Date().getFullYear().toString(),
      semester: '1',
      year: user.year || '4'
    };

    if (selectedDocument === 'application') {
      // ใช้เทมเพลตจริงจากไฟล์ PDF/DOCX
      const template = REAL_TEMPLATES.co_op[selectedLanguage]?.application_form;
      if (!template) {
        return {
          title: 'เทมเพลตไม่พบ',
          content: 'ไม่พบเทมเพลตสำหรับภาษาที่เลือก'
        };
      }

      // ตัวแปรสำหรับแทนที่ในเทมเพลต
      const variables = {
        studentName: templateVars.studentName,
        studentId: selectedLanguage === 'th' ? templateVars.studentId : templateVars.studentIdOriginal,
        studentEmail: templateVars.studentEmail,
        year: templateVars.year,
        phoneNumber: '[เบอร์โทรศัพท์]',
        companyName: templateVars.companyName,
        supervisorName: '[ชื่อหัวหน้าหน่วยงาน]',
        position: internship.title,
        companyAddress: internship.location,
        companyPhone: '[เบอร์โทรศัพท์บริษัท]',
        companyFax: '[โทรสาร]',
        businessType: '[ประเภทกิจการ]',
        department: '[แผนก]',
        jobDescription: formData.studentReason || '[ลักษณะงาน]'
      };

      return {
        title: template.title,
        content: replaceTemplateVariables(template.content, variables)
      };
    } else if (selectedDocument === 'request') {
      // ใช้เทมเพลตจริงจากไฟล์ PDF/DOCX
      const template = selectedLanguage === 'th' ? 
        REAL_TEMPLATES[type].th?.request_letter :
        null; // ยังไม่มีเทมเพลตอังกฤษสำหรับหนังสือขอ
      
      if (!template) {
        // ใช้เทมเพลตเดิมถ้าไม่มีเทมเพลตจริง
        return {
          title: selectedLanguage === 'th' ? 
            (type === 'internship' ? 'หนังสือขอฝึกงาน' : 'หนังสือขอสหกิจศึกษา') :
            (type === 'internship' ? 'Request Letter for Internship' : 'Request Letter for Co-operative Education'),
          content: selectedLanguage === 'th' ? `
ที่ ${templateVars.documentNumber}                                                    วันที่ ${templateVars.documentDate}

เรื่อง  ขอความอนุเคราะห์รับนักศึกษา${type === 'internship' ? 'ฝึกงาน' : 'สหกิจศึกษา'}

เรียน  ผู้จัดการฝ่ายบุคคล
       บริษัท ${templateVars.companyName}

       ด้วย ${templateVars.universityName} ${templateVars.facultyName} ${templateVars.departmentName} 
มีความประสงค์จะส่งนักศึกษาเข้า${type === 'internship' ? 'ฝึกงาน' : 'สหกิจศึกษา'}ในสถานประกอบการของท่าน 
เพื่อให้นักศึกษาได้รับประสบการณ์ตรงจากการปฏิบัติงานจริง และเป็นการเตรียมความพร้อม
ก่อนเข้าสู่ตลาดแรงงาน

       รายละเอียดนักศึกษา
       ชื่อ-นามสกุล    ${templateVars.studentName}
       รหัสนักศึกษา    ${templateVars.studentId}
       สาขาวิชา       วิศวกรรมคอมพิวเตอร์
       ระดับการศึกษา   ปริญญาตรี
       อีเมล          ${templateVars.studentEmail}

       ระยะเวลา${type === 'internship' ? 'ฝึกงาน' : 'สหกิจศึกษา'}
       เริ่มต้น        ${formattedDate}
       ระยะเวลา        ${durationText}
       ตำแหน่งที่สนใจ   ${internship.title}

${formData.studentReason ? `       เหตุผลในการสมัคร
       ${formData.studentReason}
` : ''}
${formData.expectedSkills ? `       ทักษะที่คาดหวังจะได้รับ
       ${formData.expectedSkills}
` : ''}
${type === 'co_op' && formData.projectProposal ? `       หัวข้อโครงการเบื้องต้น
       ${formData.projectProposal}
` : ''}

       จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ และหากท่านต้องการข้อมูลเพิ่มเติม
กรุณาติดต่อที่ ${templateVars.departmentName} โทรศัพท์ ๐๒-๔๗๐-๙๐๖๕

       ขอขอบคุณมา ณ โอกาสนี้

                                                    ขอแสดงความนับถือ


                                                    (อาจารย์ประจำวิชา)
                                                    ${templateVars.departmentName}
        ` : `
No. ${templateVars.documentNumber}                                                    Date ${templateVars.documentDate}

Subject: Request for ${type === 'internship' ? 'Internship' : 'Co-operative Education'} Student Placement

To: Human Resources Manager
    ${templateVars.companyName}

       ${templateVars.universityName} ${templateVars.facultyName} ${templateVars.departmentName} 
would like to request your kind consideration to accept our student for ${type === 'internship' ? 'internship' : 'co-operative education'} 
training at your organization to provide practical experience and prepare them for their future career.

       Student Details
       Name             ${templateVars.studentName}
       Student ID       ${templateVars.studentIdOriginal}
       Major            Computer Engineering
       Level            Bachelor's Degree
       Email            ${templateVars.studentEmail}

       ${type === 'internship' ? 'Internship' : 'Co-operative Education'} Period
       Start Date       ${formattedDate}
       Duration         ${durationText}
       Position         ${internship.title}

${formData.studentReason ? `       Reason for Application
       ${formData.studentReason}
` : ''}
${formData.expectedSkills ? `       Expected Skills
       ${formData.expectedSkills}
` : ''}
${type === 'co_op' && formData.projectProposal ? `       Project Proposal
       ${formData.projectProposal}
` : ''}

       We would be grateful for your kind consideration. Should you require any additional information,
please contact ${templateVars.departmentName} at Tel. 02-470-9065

       Thank you for your consideration.

                                                    Sincerely yours,


                                                    (Course Instructor)
                                                    ${templateVars.departmentName}
        `
      };
    } else {
      // Template: หนังสือส่งตัวฝึกงาน/สหกิจศึกษา
      return {
        title: selectedLanguage === 'th' ? 
          (type === 'internship' ? 'หนังสือส่งตัวฝึกงาน' : 'หนังสือส่งตัวสหกิจศึกษา') :
          (type === 'internship' ? 'Introduction Letter for Internship' : 'Introduction Letter for Co-operative Education'),
        content: selectedLanguage === 'th' ? `
ที่ ${templateVars.documentNumber}                                                    วันที่ ${templateVars.documentDate}

เรื่อง  ส่งตัวนักศึกษา${type === 'internship' ? 'ฝึกงาน' : 'สหกิจศึกษา'}

เรียน  ผู้จัดการฝ่ายบุคคล
       บริษัท ${templateVars.companyName}

       ตามที่ท่านได้ให้ความอนุเคราะห์รับนักศึกษาของ ${templateVars.universityName} 
${templateVars.facultyName} ${templateVars.departmentName} เข้า${type === 'internship' ? 'ฝึกงาน' : 'สหกิจศึกษา'}
ในสถานประกอบการของท่าน นั้น

       ทาง ${templateVars.departmentName} ขอส่งตัวนักศึกษาดังรายนามต่อไปนี้

       รายละเอียดนักศึกษา
       ชื่อ-นามสกุล    ${templateVars.studentName}
       รหัสนักศึกษา    ${templateVars.studentId}
       สาขาวิชา       วิศวกรรมคอมพิวเตอร์
       ระดับการศึกษา   ปริญญาตรี ชั้นปีที่ ${templateVars.year}
       อีเมล          ${templateVars.studentEmail}

       ระยะเวลา${type === 'internship' ? 'ฝึกงาน' : 'สหกิจศึกษา'}
       เริ่มต้น        ${formattedDate}
       ระยะเวลา        ${durationText}
       ตำแหน่ง         ${internship.title}

${type === 'co_op' ? `       อาจารย์ที่รับผิดชอบ
       อาจารย์ที่ปรึกษา  [จะได้รับการมอบหมายภายหลัง]
       อาจารย์นิเทศก์     [จะได้รับการมอบหมายภายหลัง]
` : ''}

       ทั้งนี้ หากมีข้อสงสัยหรือต้องการข้อมูลเพิ่มเติม กรุณาติดต่อที่ ${templateVars.departmentName} 
โทรศัพท์ ๐๒-๔๗๐-๙๐๖๕

       ขอขอบคุณที่ให้โอกาสนักศึกษาของเราได้เรียนรู้และฝึกประสบการณ์

                                                    ขอแสดงความนับถือ


                                                    (อาจารย์ประจำวิชา)
                                                    ${templateVars.departmentName}
        ` : `
No. ${templateVars.documentNumber}                                                    Date ${templateVars.documentDate}

Subject: Student Introduction for ${type === 'internship' ? 'Internship' : 'Co-operative Education'}

To: Human Resources Manager
    ${templateVars.companyName}

       Following your kind acceptance of our student from ${templateVars.universityName} 
${templateVars.facultyName} ${templateVars.departmentName} for ${type === 'internship' ? 'internship' : 'co-operative education'} 
training at your organization.

       We would like to introduce the following student:

       Student Details
       Name             ${templateVars.studentName}
       Student ID       ${templateVars.studentIdOriginal}
       Major            Computer Engineering
       Level            Bachelor's Degree Year ${templateVars.year}
       Email            ${templateVars.studentEmail}

       ${type === 'internship' ? 'Internship' : 'Co-operative Education'} Period
       Start Date       ${formattedDate}
       Duration         ${durationText}
       Position         ${internship.title}

${type === 'co_op' ? `       Supervising Faculty
       Advisor          [To be assigned]
       Supervisor       [To be assigned]
` : ''}

       Should you have any questions or require additional information, please contact 
${templateVars.departmentName} at Tel. 02-470-9065

       Thank you for providing this learning opportunity for our student.

                                                    Sincerely yours,


                                                    (Course Instructor)
                                                    ${templateVars.departmentName}
        `
      };
    }
  };

  const documentContent = getDocumentContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            พรีวิวเอกสาร{currentType.title}
          </DialogTitle>
          <DialogDescription>
            ตรวจสอบข้อมูลในเอกสารก่อนส่งใบสมัคร
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
                    <div className="font-medium">{internship.title}</div>
                    <div className="text-muted-foreground">{internship.company}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <div>เริ่ม: {formData.preferredStartDate ? 
                      (() => {
                        const date = parseThaiDate(formData.preferredStartDate);
                        return date ? formatThaiDate(date) : formData.preferredStartDate;
                      })() : '-'
                    }</div>
                    <div className="text-muted-foreground">
                      ระยะเวลา: {formData.availableDuration ? 
                        {
                          '2months': '2 เดือน',
                          '3months': '3 เดือน', 
                          '4months': '4 เดือน',
                          '5months': '5 เดือน',
                          '6months': '6 เดือน'
                        }[formData.availableDuration] || formData.availableDuration
                        : '-'
                      }
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-muted-foreground">{user.studentId}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Document Preview */}
          <div className="flex-1 border rounded-lg overflow-hidden">
            <div className="bg-muted/50 p-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentDoc && <currentDoc.icon className="h-4 w-4" />}
                <span className="font-medium text-sm">{documentContent.title}</span>
                <Badge variant="outline" className="text-xs">
                  {currentType.title}
                </Badge>
              </div>
              <Button variant="outline" size="sm" className="text-xs">
                <Download className="h-3 w-3 mr-1" />
                ดาวน์โหลด
              </Button>
            </div>
            
            <div className="p-6 h-full overflow-y-auto bg-white">
              {/* Document Header with Logo */}
              <div className="text-center mb-8 border-b pb-6">
                <img 
                  src="/assets/images/garuda-logo.png" 
                  alt="ตราครุฑ" 
                  className="mx-auto mb-4 h-16 w-auto"
                />
                <div className="text-lg font-bold mb-2">
                  {selectedLanguage === 'th' ? 
                    'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี' : 
                    'Rajamangala University of Technology Lanna'
                  }
                </div>
                {selectedDocument === 'application' && type === 'co_op' ? (
                  <div className="text-base font-medium">
                    {selectedLanguage === 'th' ? 
                      `แบบแจ้งสถานที่ฝึกประสบการณ์วิชาชีพวิศวกรรม (Co-operative Education) พ.ศ.${toThaiNumerals((new Date().getFullYear() + 543).toString())}` :
                      `(Co-operative Education) ${new Date().getFullYear()}`
                    }
                  </div>
                ) : (
                  <>
                    <div className="text-base">
                      {selectedLanguage === 'th' ? 'คณะวิศวกรรมศาสตร์' : 'Faculty of Engineering'}
                    </div>
                    <div className="text-base">
                      {selectedLanguage === 'th' ? 'ภาควิชาวิศวกรรมคอมพิวเตอร์' : 'Department of Computer Engineering'}
                    </div>
                  </>
                )}
              </div>
              
              {/* Document Content */}
              <div className="max-w-none prose prose-sm">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-['Bai_Jamjuree']">
                  {documentContent.content}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground space-y-1">
            <div>💡 ข้อมูลในเอกสารจะถูกสร้างจากข้อมูลที่คุณกรอกในฟอร์ม</div>
            <div className="text-xs">
              📄 เทมเพลต: {currentDoc?.template || 'ไม่พบเทมเพลต'} 
              | 📁 document-templates/{type}/{selectedLanguage}/
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              ปิด
            </Button>
            <Button onClick={onClose}>
              ตกลง ส่งใบสมัคร
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}}
