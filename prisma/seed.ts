import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // สร้างข้อมูลคณะ
  const faculty1 = await prisma.faculty.upsert({
    where: { id: 'faculty-1' },
    update: {},
    create: {
      id: 'faculty-1',
      nameTh: 'คณะวิทยาศาสตร์และเทคโนโลยี',
      nameEn: 'Faculty of Science and Technology',
      code: 'SCI',
      isActive: true
    }
  });

  const faculty2 = await prisma.faculty.upsert({
    where: { id: 'faculty-2' },
    update: {},
    create: {
      id: 'faculty-2',
      nameTh: 'คณะบริหารธุรกิจ',
      nameEn: 'Faculty of Business Administration',
      code: 'BUS',
      isActive: true
    }
  });

  // สร้างข้อมูลภาควิชา
  const dept1 = await prisma.department.upsert({
    where: { id: 'dept-1' },
    update: {},
    create: {
      id: 'dept-1',
      nameTh: 'สาขาวิชาเทคโนโลยีสารสนเทศ',
      nameEn: 'Information Technology',
      code: 'IT',
      facultyId: faculty1.id,
      isActive: true
    }
  });

  const dept2 = await prisma.department.upsert({
    where: { id: 'dept-2' },
    update: {},
    create: {
      id: 'dept-2',
      nameTh: 'สาขาวิชาวิทยาการคอมพิวเตอร์',
      nameEn: 'Computer Science',
      code: 'CS',
      facultyId: faculty1.id,
      isActive: true
    }
  });

  const dept3 = await prisma.department.upsert({
    where: { id: 'dept-3' },
    update: {},
    create: {
      id: 'dept-3',
      nameTh: 'สาขาวิชาการจัดการธุรกิจ',
      nameEn: 'Business Management',
      code: 'BM',
      facultyId: faculty2.id,
      isActive: true
    }
  });

  // สร้างข้อมูลหลักสูตร
  const curriculum1 = await prisma.curriculum.upsert({
    where: { id: 'curr-1' },
    update: {},
    create: {
      id: 'curr-1',
      nameTh: 'เทคโนโลยีสารสนเทศ',
      nameEn: 'Information Technology',
      code: 'IT',
      degree: 'ปริญญาตรี',
      departmentId: dept1.id,
      isActive: true
    }
  });

  const curriculum2 = await prisma.curriculum.upsert({
    where: { id: 'curr-2' },
    update: {},
    create: {
      id: 'curr-2',
      nameTh: 'วิทยาการคอมพิวเตอร์',
      nameEn: 'Computer Science',
      code: 'CS',
      degree: 'ปริญญาตรี',
      departmentId: dept2.id,
      isActive: true
    }
  });

  const curriculum3 = await prisma.curriculum.upsert({
    where: { id: 'curr-3' },
    update: {},
    create: {
      id: 'curr-3',
      nameTh: 'การจัดการธุรกิจ',
      nameEn: 'Business Management',
      code: 'BM',
      degree: 'ปริญญาตรี',
      departmentId: dept3.id,
      isActive: true
    }
  });

  // สร้างข้อมูลวิชาเอก
  const major1 = await prisma.major.upsert({
    where: { id: 'major-1' },
    update: {},
    create: {
      id: 'major-1',
      nameTh: 'เทคโนโลยีสารสนเทศ',
      nameEn: 'Information Technology',
      curriculumId: curriculum1.id,
      area: 'เทคโนโลยี',
      isActive: true
    }
  });

  const major2 = await prisma.major.upsert({
    where: { id: 'major-2' },
    update: {},
    create: {
      id: 'major-2',
      nameTh: 'การพัฒนาซอฟต์แวร์',
      nameEn: 'Software Development',
      curriculumId: curriculum1.id,
      area: 'เทคโนโลยี',
      isActive: true
    }
  });

  const major3 = await prisma.major.upsert({
    where: { id: 'major-3' },
    update: {},
    create: {
      id: 'major-3',
      nameTh: 'วิทยาการคอมพิวเตอร์',
      nameEn: 'Computer Science',
      curriculumId: curriculum2.id,
      area: 'วิทยาศาสตร์',
      isActive: true
    }
  });

  const major4 = await prisma.major.upsert({
    where: { id: 'major-4' },
    update: {},
    create: {
      id: 'major-4',
      nameTh: 'การจัดการธุรกิจ',
      nameEn: 'Business Management',
      curriculumId: curriculum3.id,
      area: 'บริหารธุรกิจ',
      isActive: true
    }
  });

  // สร้างข้อมูลบริษัท
  const company1 = await prisma.company.upsert({
    where: { id: 'comp001' },
    update: {},
    create: {
      id: 'comp001',
      name: 'Tech Innovators Inc.',
      description: 'บริษัทพัฒนาเทคโนโลยีและนวัตกรรม',
      address: '123 ถนนเทคโนโลยี กรุงเทพฯ 10110',
      phone: '02-123-4567',
      email: 'contact@techinnovators.com',
      website: 'https://techinnovators.com',
      industry: 'เทคโนโลยี',
      size: 'medium',
      isActive: true
    }
  });

  const company2 = await prisma.company.upsert({
    where: { id: 'comp002' },
    update: {},
    create: {
      id: 'comp002',
      name: 'Data Systems Ltd.',
      description: 'บริษัทระบบข้อมูลและการวิเคราะห์',
      address: '456 ถนนข้อมูล เชียงใหม่ 50200',
      phone: '053-987-6543',
      email: 'info@datasystems.co.th',
      website: 'https://datasystems.co.th',
      industry: 'เทคโนโลยี',
      size: 'large',
      isActive: true
    }
  });

  const company3 = await prisma.company.upsert({
    where: { id: 'comp003' },
    update: {},
    create: {
      id: 'comp003',
      name: 'Digital Solutions Co.',
      description: 'บริษัทโซลูชันดิจิทัลและการพัฒนาแอปพลิเคชัน',
      address: '789 ถนนดิจิทัล ขอนแก่น 40000',
      phone: '043-555-1234',
      email: 'hello@digitalsolutions.com',
      website: 'https://digitalsolutions.com',
      industry: 'เทคโนโลยี',
      size: 'small',
      isActive: true
    }
  });

  const company4 = await prisma.company.upsert({
    where: { id: 'comp004' },
    update: {},
    create: {
      id: 'comp004',
      name: 'Business Consulting Group',
      description: 'บริษัทที่ปรึกษาธุรกิจและการจัดการ',
      address: '321 ถนนธุรกิจ กรุงเทพฯ 10120',
      phone: '02-777-8888',
      email: 'consult@bcgroup.co.th',
      website: 'https://bcgroup.co.th',
      industry: 'ที่ปรึกษา',
      size: 'medium',
      isActive: true
    }
  });

  // สร้างข้อมูลฝึกงาน
  const internship1 = await prisma.internship.upsert({
    where: { id: 'int001' },
    update: {},
    create: {
      id: 'int001',
      title: 'Frontend Developer',
      companyId: company1.id,
      location: 'กรุงเทพฯ',
      description: 'พัฒนาและดูแลเว็บแอปพลิเคชันโดยใช้ React และ TypeScript สร้างส่วนประกอบที่นำกลับมาใช้ใหม่ได้และไลบรารีส่วนหน้าเพื่อใช้ในอนาคต',
      type: 'internship'
    }
  });

  const internship2 = await prisma.internship.upsert({
    where: { id: 'int002' },
    update: {},
    create: {
      id: 'int002',
      title: 'Backend Developer (Co-op)',
      companyId: company2.id,
      location: 'เชียงใหม่',
      description: 'ออกแบบและใช้งาน API ของฝั่งเซิร์ฟเวอร์ ทำงานกับฐานข้อมูล และรับรองประสิทธิภาพของแอปพลิเคชัน',
      type: 'co_op'
    }
  });

  const internship3 = await prisma.internship.upsert({
    where: { id: 'int003' },
    update: {},
    create: {
      id: 'int003',
      title: 'Mobile App Developer',
      companyId: company3.id,
      location: 'ขอนแก่น',
      description: 'พัฒนาแอปพลิเคชันมือถือสำหรับ iOS และ Android โดยใช้ React Native หรือ Flutter',
      type: 'internship'
    }
  });

  const internship4 = await prisma.internship.upsert({
    where: { id: 'int004' },
    update: {},
    create: {
      id: 'int004',
      title: 'Business Analyst (Co-op)',
      companyId: company4.id,
      location: 'กรุงเทพฯ',
      description: 'วิเคราะห์ความต้องการทางธุรกิจ สร้างรายงานและนำเสนอข้อมูลเชิงลึกเพื่อการตัดสินใจ',
      type: 'co_op'
    }
  });

  const internship5 = await prisma.internship.upsert({
    where: { id: 'int005' },
    update: {},
    create: {
      id: 'int005',
      title: 'Data Analyst',
      companyId: company2.id,
      location: 'เชียงใหม่',
      description: 'วิเคราะห์ข้อมูลขนาดใหญ่ สร้างแดชบอร์ดและรายงาน ใช้เครื่องมือ SQL, Python, และ Power BI',
      type: 'internship'
    }
  });

  const internship6 = await prisma.internship.upsert({
    where: { id: 'int006' },
    update: {},
    create: {
      id: 'int006',
      title: 'UI/UX Designer',
      companyId: company1.id,
      location: 'กรุงเทพฯ',
      description: 'ออกแบบส่วนติดต่อผู้ใช้และประสบการณ์ผู้ใช้ สร้าง wireframe, prototype และ design system',
      type: 'internship'
    }
  });

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
      departmentId: dept1.id,
      curriculumId: curriculum1.id,
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
      departmentId: dept1.id,
      curriculumId: curriculum1.id,
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
      departmentId: dept1.id,
      curriculumId: curriculum1.id,
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
      departmentId: dept1.id,
      curriculumId: curriculum1.id,
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
      departmentId: dept1.id,
      curriculumId: curriculum1.id,
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
      departmentId: dept1.id,
      curriculumId: curriculum1.id,
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
      departmentId: dept1.id,
      curriculumId: curriculum1.id,
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
      departmentId: dept1.id,
      curriculumId: curriculum1.id,
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
      departmentId: dept1.id,
      curriculumId: curriculum1.id,
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
        departmentId: dept1.id,
        curriculumId: curriculum1.id,
        majorId: major1.id
      }
    });
  }

  console.log('Seed data created successfully!');
  console.log('Created:');
  console.log('- 2 Faculties');
  console.log('- 3 Departments');
  console.log('- 3 Curriculums');
  console.log('- 4 Majors');
  console.log('- 4 Companies');
  console.log('- 6 Internships');
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