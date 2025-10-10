import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // สร้างโครงสร้างวิชาการตามที่ระบุ
  // คณะเดียว: บริหารธุรกิจและศิลปศาสตร์ / Business Administration and Liberal Arts
  const faculty1 = await prisma.faculty.upsert({
    where: { id: 'faculty-bala' },
    update: {},
    create: {
      id: 'faculty-bala',
      nameTh: 'บริหารธุรกิจและศิลปศาสตร์',
      nameEn: 'Business Administration and Liberal Arts',
      code: 'BALA',
      isActive: true
    }
  });

  // สาขา
  const deptAccounting = await prisma.department.upsert({
    where: { id: 'dept-acc' },
    update: {},
    create: {
      id: 'dept-acc',
      nameTh: 'สาขาบัญชี',
      nameEn: 'Department of Accounting',
      code: 'ACC',
      facultyId: faculty1.id,
      isActive: true
    }
  });

  const deptManagement = await prisma.department.upsert({
    where: { id: 'dept-mgmt' },
    update: {},
    create: {
      id: 'dept-mgmt',
      nameTh: 'สาขาบริหาร',
      nameEn: 'Department of Management',
      code: 'MGMT',
      facultyId: faculty1.id,
      isActive: true
    }
  });

  const deptLiberalArts = await prisma.department.upsert({
    where: { id: 'dept-libarts' },
    update: {},
    create: {
      id: 'dept-libarts',
      nameTh: 'สาขาศิลปศาสตร์',
      nameEn: 'Department of Liberal Arts',
      code: 'LA',
      facultyId: faculty1.id,
      isActive: true
    }
  });

  // หลักสูตร
  // Accounting: ไม่มีวิชาเอก
  const curriculumAccounting = await prisma.curriculum.upsert({
    where: { id: 'curr-acc-bba' },
    update: {},
    create: {
      id: 'curr-acc-bba',
      nameTh: 'บช.บ.การบัญชี',
      nameEn: 'B.B.A Accounting',
      code: 'BBA-ACC',
      degree: 'B.B.A',
      departmentId: deptAccounting.id,
      isActive: true
    }
  });

  // Management: 3 หลักสูตร (หนึ่งในนั้นมี 4 วิชาเอก)
  const curriculumBA = await prisma.curriculum.upsert({
    where: { id: 'curr-bba-ba' },
    update: {},
    create: {
      id: 'curr-bba-ba',
      nameTh: 'บธ.บ.บริหารธุรกิจ',
      nameEn: 'B.B.A Business Administration',
      code: 'BBA-BA',
      degree: 'B.B.A',
      departmentId: deptManagement.id,
      isActive: true
    }
  });

  const curriculumIBM = await prisma.curriculum.upsert({
    where: { id: 'curr-ibm-int' },
    update: {},
    create: {
      id: 'curr-ibm-int',
      nameTh: 'บธ.บ.การจัดการธุรกิจระหว่างประเทศ(นานาชาติ)',
      nameEn: 'B.B.A International Business Management (International Program)',
      code: 'BBA-IBM-INT',
      degree: 'B.B.A',
      departmentId: deptManagement.id,
      isActive: true
    }
  });

  const curriculumBIS = await prisma.curriculum.upsert({
    where: { id: 'curr-bis' },
    update: {},
    create: {
      id: 'curr-bis',
      nameTh: 'บธ.บ.ระบบสารสนเทศทางธุรกิจ',
      nameEn: 'B.B.A Business Information System',
      code: 'BBA-BIS',
      degree: 'B.B.A',
      departmentId: deptManagement.id,
      isActive: true
    }
  });

  // Liberal Arts: 2 หลักสูตร (ไม่มีวิชาเอก)
  const curriculumTH = await prisma.curriculum.upsert({
    where: { id: 'curr-th' },
    update: {},
    create: {
      id: 'curr-th',
      nameTh: 'ศศ.บ.การท่องเที่ยวและการบริการ',
      nameEn: 'B.A. Tourism and Hospitality',
      code: 'BA-TH',
      degree: 'B.A.',
      departmentId: deptLiberalArts.id,
      isActive: true
    }
  });

  const curriculumEIC = await prisma.curriculum.upsert({
    where: { id: 'curr-eic' },
    update: {},
    create: {
      id: 'curr-eic',
      nameTh: 'ศศ.บ.ภาษาอังกฤษเพื่อการสื่อสารสากล',
      nameEn: 'B.A. English for International Communication',
      code: 'BA-EIC',
      degree: 'B.A.',
      departmentId: deptLiberalArts.id,
      isActive: true
    }
  });

  // วิชาเอกเฉพาะใน บธ.บ.บริหารธุรกิจ (4 วิชาเอก)
  const major1 = await prisma.major.upsert({
    where: { id: 'major-mgmt' },
    update: {},
    create: {
      id: 'major-mgmt',
      nameTh: 'การจัดการธุรกิจ',
      nameEn: 'Management',
      curriculumId: curriculumBA.id,
      area: 'Business Management',
      isActive: true
    }
  });

  await prisma.major.upsert({
    where: { id: 'major-mkt' },
    update: {},
    create: {
      id: 'major-mkt',
      nameTh: 'การตลาดและการตลาดดิจิทัล',
      nameEn: 'Marketing',
      curriculumId: curriculumBA.id,
      area: 'Marketing',
      isActive: true
    }
  });

  await prisma.major.upsert({
    where: { id: 'major-be' },
    update: {},
    create: {
      id: 'major-be',
      nameTh: 'ภาษาอังกฤษธุรกิจ',
      nameEn: 'Business English',
      curriculumId: curriculumBA.id,
      area: 'Business English',
      isActive: true
    }
  });

  await prisma.major.upsert({
    where: { id: 'major-retail' },
    update: {},
    create: {
      id: 'major-retail',
      nameTh: 'ธุรกิจการค้าและบริการ',
      nameEn: 'Retail Business Management',
      curriculumId: curriculumBA.id,
      area: 'Retail Management',
      isActive: true
    }
  });

  // Internal-only: remove company/internship seeding

  // สร้างข้อมูลผู้ใช้ทดสอบ
  const hashedPassword = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // password: 123456

  // Admin Users
  await prisma.user.upsert({
    where: { id: 'user_admin' },
    update: {},
    create: {
      id: 'user_admin',
      name: 'System Administrator',
      email: 'admin@smart-solutions.com',
      password: hashedPassword,
      roles: '["admin"]'
    }
  });

  await prisma.user.upsert({
    where: { id: 'adminPick' },
    update: {},
    create: {
      id: 'adminPick',
      name: 'ธเนศ บุญทัพ',
      email: 'ultramanx88@gmail.com',
      password: hashedPassword,
      roles: '["admin"]'
    }
  });

  await prisma.user.upsert({
    where: { id: 'admin001' },
    update: {},
    create: {
      id: 'admin001',
      name: 'ผู้ดูแลระบบ',
      email: 'admin@university.ac.th',
      password: hashedPassword,
      roles: '["admin"]'
    }
  });

  // Staff Users
  await prisma.user.upsert({
    where: { id: 'user_s6800001' },
    update: {},
    create: {
      id: 'user_s6800001',
      name: 'Staff 001',
      email: 's6800001@smart-solutions.com',
      password: hashedPassword,
      roles: '["staff"]'
    }
  });

  await prisma.user.upsert({
    where: { id: 'user_s6800002' },
    update: {},
    create: {
      id: 'user_s6800002',
      name: 'Staff 002',
      email: 's6800002@smart-solutions.com',
      password: hashedPassword,
      roles: '["staff"]'
    }
  });

  // สุดา ธุรการ - Staff
  await prisma.user.upsert({
    where: { id: 'staff_suda' },
    update: {},
    create: {
      id: 'staff_suda',
      name: 'นางสาวสุดา ธุรการ',
      email: 'suda.admin@university.ac.th',
      password: hashedPassword,
      roles: '["staff"]',
      t_title: 'นางสาว',
      t_name: 'สุดา',
      t_surname: 'ธุรการ',
      e_title: 'Ms.',
      e_name: 'Suda',
      e_surname: 'Thurakar',
      phone: '02-123-4567',
      nationality: 'ไทย',
      campus: 'วิทยาเขตหลัก'
    }
  });

  // Instructor Users
  await prisma.user.upsert({
    where: { id: 'user_t6800001' },
    update: {},
    create: {
      id: 'user_t6800001',
      name: 'Instructor 001',
      email: 't6800001@smart-solutions.com',
      password: hashedPassword,
      roles: '["courseInstructor"]'
    }
  });

  await prisma.user.upsert({
    where: { id: 'user_t6800002' },
    update: {},
    create: {
      id: 'user_t6800002',
      name: 'Instructor 002 (and Visitor)',
      email: 't6800002@smart-solutions.com',
      password: hashedPassword,
      roles: '["courseInstructor","visitor"]'
    }
  });

  await prisma.user.upsert({
    where: { id: 'user_t6800003' },
    update: {},
    create: {
      id: 'user_t6800003',
      name: 'Instructor 003 (and Committee, Visitor)',
      email: 't6800003@smart-solutions.com',
      password: hashedPassword,
      roles: '["courseInstructor","committee","visitor"]'
    }
  });

  await prisma.user.upsert({
    where: { id: 'user_t6800004' },
    update: {},
    create: {
      id: 'user_t6800004',
      name: 'Committee 004',
      email: 't6800004@smart-solutions.com',
      password: hashedPassword,
      roles: '["committee"]'
    }
  });

  await prisma.user.upsert({
    where: { id: 'user_t6800005' },
    update: {},
    create: {
      id: 'user_t6800005',
      name: 'Committee 005 (and Visitor)',
      email: 't6800005@smart-solutions.com',
      password: hashedPassword,
      roles: '["committee","visitor"]'
    }
  });

  // สมศักดิ์ วิชาการ - พี่เลี้ยง/อาจารย์
  await prisma.user.upsert({
    where: { id: 'teacher_somsak' },
    update: {},
    create: {
      id: 'teacher_somsak',
      name: 'นายสมศักดิ์ วิชาการ',
      email: 'somsak.wichakan@university.ac.th',
      password: hashedPassword,
      roles: '["courseInstructor","committee"]',
      t_title: 'นาย',
      t_name: 'สมศักดิ์',
      t_surname: 'วิชาการ',
      e_title: 'Mr.',
      e_name: 'Somsak',
      e_surname: 'Wichakan',
      phone: '02-234-5678',
      nationality: 'ไทย',
      campus: 'วิทยาเขตหลัก'
    }
  });

  // Student Users
  await prisma.user.upsert({
    where: { id: 'test001' },
    update: {},
    create: {
      id: 'test001',
      name: 'Test User',
      email: 'test@test.com',
      password: hashedPassword,
      roles: '["student"]',
      facultyId: faculty1.id,
      departmentId: deptManagement.id,
      curriculumId: curriculumBA.id,
      majorId: major1.id
    }
  });

  await prisma.user.upsert({
    where: { id: '65010001' },
    update: {},
    create: {
      id: '65010001',
      name: 'Student User',
      email: 'student@test.com',
      password: hashedPassword,
      roles: '["student"]',
      facultyId: faculty1.id,
      departmentId: deptManagement.id,
      curriculumId: curriculumBA.id,
      majorId: major1.id
    }
  });

  // สมชาย ใจดี - นักศึกษาตัวอย่าง
  await prisma.user.upsert({
    where: { id: '65010999' },
    update: {},
    create: {
      id: '65010999',
      name: 'นายสมชาย ใจดี',
      email: 'somchai.jaidee@student.university.ac.th',
      password: hashedPassword,
      roles: '["student"]',
      t_title: 'นาย',
      t_name: 'สมชาย',
      t_surname: 'ใจดี',
      e_title: 'Mr.',
      e_name: 'Somchai',
      e_surname: 'Jaidee',
      phone: '081-234-5678',
      nationality: 'ไทย',
      campus: 'วิทยาเขตหลัก',
      gpa: '3.75',
      skills: 'React, TypeScript, Node.js, ใจดีมาก',
      statement: 'นักศึกษาที่มีใจรักในการเรียนรู้และพัฒนาตนเอง พร้อมที่จะนำความรู้ไปใช้ในการทำงานจริง',
      studentYear: 4,
      facultyId: faculty1.id,
      departmentId: deptManagement.id,
      curriculumId: curriculumBA.id,
      majorId: major1.id
    }
  });

  // สมหญิง รักเรียน - นักศึกษาตัวอย่าง
  await prisma.user.upsert({
    where: { id: '65010998' },
    update: {},
    create: {
      id: '65010998',
      name: 'นางสาวสมหญิง รักเรียน',
      email: 'somying.rakrian@student.university.ac.th',
      password: hashedPassword,
      roles: '["student"]',
      t_title: 'นางสาว',
      t_name: 'สมหญิง',
      t_surname: 'รักเรียน',
      e_title: 'Ms.',
      e_name: 'Somying',
      e_surname: 'Rakrian',
      phone: '082-345-6789',
      nationality: 'ไทย',
      campus: 'วิทยาเขตหลัก',
      gpa: '3.85',
      skills: 'UI/UX Design, Figma, Adobe Creative Suite',
      statement: 'นักศึกษาที่หลงใหลในการออกแบบและสร้างสรรค์ผลงานที่สวยงามและใช้งานได้จริง',
      studentYear: 3,
      facultyId: faculty1.id,
      departmentId: deptManagement.id,
      curriculumId: curriculumBA.id,
      majorId: major1.id
    }
  });

  // วิชัย เก่งดี - นักศึกษาตัวอย่าง
  await prisma.user.upsert({
    where: { id: '65010997' },
    update: {},
    create: {
      id: '65010997',
      name: 'นายวิชัย เก่งดี',
      email: 'wichai.kengdee@student.university.ac.th',
      password: hashedPassword,
      roles: '["student"]',
      t_title: 'นาย',
      t_name: 'วิชัย',
      t_surname: 'เก่งดี',
      e_title: 'Mr.',
      e_name: 'Wichai',
      e_surname: 'Kengdee',
      phone: '083-456-7890',
      nationality: 'ไทย',
      campus: 'วิทยาเขตหลัก',
      gpa: '3.95',
      skills: 'Python, Machine Learning, Data Science, AI',
      statement: 'นักศึกษาที่สนใจในด้าน AI และ Machine Learning พร้อมที่จะพัฒนาเทคโนโลยีเพื่อสังคม',
      studentYear: 4,
      facultyId: faculty1.id,
      departmentId: deptManagement.id,
      curriculumId: curriculumBA.id,
      majorId: major1.id
    }
  });

  await prisma.user.upsert({
    where: { id: 'u6800021' },
    update: {},
    create: {
      id: 'u6800021',
      name: 'นาย ไพฑูรย์ นิคม',
      email: 'u6800021@smart-solutions.com',
      password: hashedPassword,
      roles: '["student"]',
      t_title: 'นาย',
      t_name: 'ไพฑูรย์',
      t_surname: 'นิคม',
      e_title: 'Mr.',
      e_name: 'Paitoon',
      e_surname: 'Nikhom',
      phone: '084-567-8901',
      nationality: 'ไทย',
      campus: 'วิทยาเขตหลัก',
      gpa: '3.65',
      skills: 'Java, Spring Boot, Database Design',
      statement: 'นักศึกษาที่มีความสนใจในการพัฒนาระบบ Backend และการจัดการฐานข้อมูล',
      studentYear: 3,
      facultyId: faculty1.id,
      departmentId: deptManagement.id,
      curriculumId: curriculumBA.id,
      majorId: major1.id
    }
  });

  // รักดี จิตดี - นักศึกษาที่ปรากฏใน mock data บ่อย
  await prisma.user.upsert({
    where: { id: '6400112233' },
    update: {},
    create: {
      id: '6400112233',
      name: 'นายรักดี จิตดี',
      email: 'rakdee.jitdee@student.university.ac.th',
      password: hashedPassword,
      roles: '["student"]',
      t_title: 'นาย',
      t_name: 'รักดี',
      t_surname: 'จิตดี',
      e_title: 'Mr.',
      e_name: 'Rakdee',
      e_surname: 'Jitdee',
      phone: '085-678-9012',
      nationality: 'ไทย',
      campus: 'วิทยาเขตหลัก',
      gpa: '3.55',
      skills: 'Java, Spring Boot, MySQL, Software Development',
      statement: 'นักศึกษาที่มีจิตใจดีและรักในการเรียนรู้เทคโนโลยีใหม่ๆ',
      studentYear: 4,
      facultyId: faculty1.id,
      departmentId: deptManagement.id,
      curriculumId: curriculumBA.id,
      majorId: major1.id
    }
  });

  // มาลี สวยงาม - นางสาว
  await prisma.user.upsert({
    where: { id: '6400112234' },
    update: {},
    create: {
      id: '6400112234',
      name: 'นางสาวมาลี สวยงาม',
      email: 'malee.suayngam@student.university.ac.th',
      password: hashedPassword,
      roles: '["student"]',
      t_title: 'นางสาว',
      t_name: 'มาลี',
      t_surname: 'สวยงาม',
      e_title: 'Ms.',
      e_name: 'Malee',
      e_surname: 'Suayngam',
      phone: '086-789-0123',
      nationality: 'ไทย',
      campus: 'วิทยาเขตหลัก',
      gpa: '3.70',
      skills: 'System Analysis, Database Design, Business Analysis',
      statement: 'นักศึกษาที่สนใจในการวิเคราะห์ระบบและการออกแบบฐานข้อมูล',
      studentYear: 3,
      facultyId: faculty1.id,
      departmentId: deptManagement.id,
      curriculumId: curriculumBA.id,
      majorId: major1.id
    }
  });

  // สุดา ขยัน - นางสาว
  await prisma.user.upsert({
    where: { id: '6400112236' },
    update: {},
    create: {
      id: '6400112236',
      name: 'นางสาวสุดา ขยัน',
      email: 'suda.kayan@student.university.ac.th',
      password: hashedPassword,
      roles: '["student"]',
      t_title: 'นางสาว',
      t_name: 'สุดา',
      t_surname: 'ขยัน',
      e_title: 'Ms.',
      e_name: 'Suda',
      e_surname: 'Kayan',
      phone: '087-890-1234',
      nationality: 'ไทย',
      campus: 'วิทยาเขตหลัก',
      gpa: '3.80',
      skills: 'Software Testing, Quality Assurance, Test Automation',
      statement: 'นักศึกษาที่มีความขยันและสนใจในด้านการทดสอบซอฟต์แวร์',
      studentYear: 4,
      facultyId: faculty1.id,
      departmentId: deptAccounting.id,
      curriculumId: curriculumAccounting.id,
      majorId: major1.id
    }
  });

  // Create multiple students
  for (let i = 1; i <= 20; i++) {
    const studentId = `u68000${i.toString().padStart(2, '0')}`;
    await prisma.user.upsert({
      where: { id: studentId },
      update: {},
      create: {
        id: studentId,
        name: `Student ${i.toString().padStart(3, '0')}`,
        email: `${studentId}@smart-solutions.com`,
        password: hashedPassword,
        roles: '["student"]',
        facultyId: faculty1.id,
        departmentId: deptManagement.id,
        curriculumId: curriculumBA.id,
        majorId: major1.id
      }
    });
  }

  console.log('Seed data created successfully!');
  console.log('Created:');
  console.log('- 1 Faculty');
  console.log('- 3 Departments');
  console.log('- 6 Curriculums');
  console.log('- 4 Majors');
  console.log('- 0 Companies (internal-only)');
  console.log('- 0 Internships (internal-only)');
  console.log('- 30+ Users (admins, staff, instructors, students)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });