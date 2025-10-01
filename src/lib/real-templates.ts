// เทมเพลตจริงจากการอ่านไฟล์ PDF/DOCX
export const REAL_TEMPLATES = {
  co_op: {
    th: {
      application_form: {
        title: 'แบบแจ้งสถานที่ฝึกประสบการณ์สหกิจศึกษา (Co-operative Education)',
        content: `
┌─────────────┐
│   ส่วนที่ ๑   │
└─────────────┘
๑. ชื่อนักศึกษา {{studentName}} รหัส {{studentId}}
๒. ชื่อนักศึกษา {{studentName}} รหัส {{studentId}}
ระดับ : ปริญญาตรี หลักสูตรการจัดการธุรกิจระหว่างประเทศ ชั้นปีที่ {{year}} คณะบริหารธุรกิจและศิลปศาสตร์
เบอร์โทรศัพท์ {{phoneNumber}} อีเมล์ {{studentEmail}}

┌─────────────┐
│   ส่วนที่ ๒   │
└─────────────┘
๑. ชื่อสถานประกอบการ {{companyName}}
๒. ชื่อหัวหน้าหน่วยงาน {{supervisorName}}
๓. ตำแหน่ง {{position}}
๔. ที่อยู่สถานประกอบการ
{{companyAddress}}
๕. เบอร์โทรศัพท์ {{companyPhone}} โทรสาร {{companyFax}}
๖. ประเภทของกิจการ {{businessType}}
๗. แผนกที่นักศึกษาฝึกประสบการณ์ {{department}}
๘. ลักษณะงาน {{jobDescription}}

๗. แผนที่

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                             │
│                                    [แผนที่หรือเส้นทางไปสถานประกอบการ]                                        │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
        `
      },
      request_letter: {
        title: 'หนังสือขอสหกิจศึกษา',
        content: `
ที่ {{documentNumber}}                                                    วันที่ {{documentDate}}

เรื่อง  ขอความอนุเคราะห์รับนักศึกษาปฏิบัติงานสหกิจศึกษา

เรียน  {{recipientTitle}}
       {{companyName}}

สิ่งที่ส่งมาด้วย  หนังสือตอบรับนักศึกษาปฏิบัติงานสหกิจศึกษา จำนวน ๑ ฉบับ

       ด้วย {{facultyName}} {{universityName}} มีความประสงค์ให้นักศึกษาระดับปริญญาตรี 
หลักสูตรการจัดการธุรกิจระหว่างประเทศ ได้มีโอกาสเข้าปฏิบัติงานสหกิจศึกษาในหน่วยงานของท่าน 
ในรายวิชา Co-Operative Education in Business Administration ซึ่งเป็นการจัดให้มีการบูรณาการ
การเรียนของนักศึกษากับการปฏิบัติงานเพื่อหาประสบการณ์จริงจากสถานประกอบการ

       ในการนี้ คณะได้พิจารณาแล้วเห็นว่าการเข้าปฏิบัติงานสหกิจศึกษาในหน่วยงานของท่าน
จะเกิดประโยชน์แก่นักศึกษาเป็นอย่างยิ่ง ดังนั้น คณะจึงขอความอนุเคราะห์ท่านรับนักศึกษา
ปฏิบัติงานสหกิจศึกษาในภาคการศึกษาที่ ๒ ปีการศึกษา {{academicYear}} ตั้งแต่วันที่ {{startDate}} 
ถึงวันที่ {{endDate}} โดยคณะกำหนดให้นักศึกษาออกปฏิบัติงานสหกิจศึกษาในสถานประกอบการ
ในฐานะพนักงานเต็มเวลา และระหว่างการปฏิบัติงานสหกิจศึกษานั้น นักศึกษาต้องจัดทำโครงงาน 
๑ เรื่อง เพื่อให้เป็นไปตามข้อกำหนดของหลักสูตร

       จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ หากผลการพิจารณาเป็นประการใด 
กรุณาส่งหนังสือตอบรับที่แนบมาพร้อมนี้กลับมายัง หลักสูตรการจัดการธุรกิจระหว่างประเทศ 
{{facultyName}} {{universityName}}

                                                    ขอแสดงความนับถือ


                                                    ({{deanName}})
                                                    คณบดี{{facultyName}}

{{programName}}
โทรศัพท์ {{contactPhone}}
({{coordinatorName}} ผู้ประสานงาน)
        `
      }
    },
    en: {
      application_form: {
        title: 'Co-operative Education Form',
        content: `
┌─────────────┐
│   Part 1    │
└─────────────┘
1. Student {{studentName}} Student ID {{studentId}}
2. Student {{studentName}} Student ID {{studentId}}
Bachelor degree, International Business Management {{year}}th Year student, Faculty of 
Business Administration and Liberal Arts.
Mobile phone no. {{phoneNumber}} e-mail {{studentEmail}}

┌─────────────┐
│   Part 2    │
└─────────────┘
1. Name of company {{companyName}}
2. Name of company supervisor {{supervisorName}}
3. Position {{position}}
4. Address {{companyAddress}}
5. Tel. {{companyPhone}} Fax. {{companyFax}}
6. Type of Business {{businessType}}
7. Department which you are located {{department}}
8. Duty {{jobDescription}}

7. Map

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                             │
│                                    [Map or directions to the company]                                       │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
│                                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
        `
      }
    }
  },
  internship: {
    th: {
      request_letter: {
        title: 'หนังสือขอฝึกงาน',
        content: `
ที่ {{documentNumber}}                                                    วันที่ {{documentDate}}

เรื่อง  ขอความอนุเคราะห์รับนักศึกษาฝึกงานในสถานประกอบการ

เรียน  {{recipientTitle}}
       {{companyName}}

สิ่งที่ส่งมาด้วย  หนังสือตอบรับนักศึกษาฝึกงานในสถานประกอบการ จำนวน ๑ ฉบับ

       ด้วย {{facultyName}} {{universityName}} มีความประสงค์ให้นักศึกษาระดับปริญญาตรี 
หลักสูตรการจัดการธุรกิจระหว่างประเทศ ได้มีโอกาสเข้าฝึกงานในหน่วยงานของท่าน 
ในรายวิชา Job Internship in Business Management ซึ่งเป็นการจัดให้มีการบูรณาการ
การเรียนของนักศึกษากับการปฏิบัติงานเพื่อหาประสบการณ์จริงจากสถานประกอบการ

       ในการนี้ {{facultyName}} ได้พิจารณาแล้วเห็นว่าการเข้าฝึกงานในสถานประกอบการของท่าน
จะเกิดประโยชน์แก่นักศึกษาเป็นอย่างมาก จึงใคร่ขอความอนุเคราะห์ท่านรับนักศึกษาเข้าฝึกงาน
ในสถานประกอบการ ภาคการศึกษาที่ ๒ ปีการศึกษา {{academicYear}} ระหว่างวันที่ {{startDate}} 
ถึงวันที่ {{endDate}} โดยคณะฯ กำหนดให้นักศึกษาฝึกงานในสถานประกอบการในฐานะพนักงานเต็มเวลา

       จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ หากผลการพิจารณาเป็นประการใด 
กรุณาส่งหนังสือตอบรับที่แนบมาพร้อมนี้กลับมายัง หลักสูตรการจัดการธุรกิจระหว่างประเทศ 
{{facultyName}} {{universityName}}

                                                    ขอแสดงความนับถือ


                                                    ({{deanName}})
                                                    คณบดี{{facultyName}}

{{programName}}
โทรศัพท์ {{contactPhone}}
({{coordinatorName}} ผู้ประสานงาน)
        `
      }
    }
  }
};

// ฟังก์ชันแทนที่ตัวแปรในเทมเพลต
export function replaceTemplateVariables(
  template: string, 
  variables: Record<string, string>
): string {
  let result = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || `[${key}]`);
  });
  
  return result;
}