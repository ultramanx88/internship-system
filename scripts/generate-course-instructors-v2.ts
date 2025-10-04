import prisma from '../src/lib/prisma';

// ข้อมูลอาจารย์ประจำวิชาใหม่ 3 คน
const newInstructors = [
  {
    id: 'instructor_002',
    name: 'อาจารย์สมศักดิ์ วิชาการ',
    email: 'somsak.instructor@university.ac.th',
    password: '$2a$12$vEtoEDHE3CnGAhEpuweCZesUr9SCgaO6rp/Ju6OAjHuAEh951q1OO', // password: 123456
    roles: '["instructor"]',
    t_title: 'อาจารย์',
    t_name: 'สมศักดิ์',
    t_surname: 'วิชาการ',
    e_title: 'Dr.',
    e_name: 'Somsak',
    e_surname: 'Wichakan'
  },
  {
    id: 'instructor_003',
    name: 'อาจารย์สมพร ใจดี',
    email: 'somporn.instructor@university.ac.th',
    password: '$2a$12$vEtoEDHE3CnGAhEpuweCZesUr9SCgaO6rp/Ju6OAjHuAEh951q1OO', // password: 123456
    roles: '["instructor"]',
    t_title: 'อาจารย์',
    t_name: 'สมพร',
    t_surname: 'ใจดี',
    e_title: 'Dr.',
    e_name: 'Somporn',
    e_surname: 'Jaidee'
  },
  {
    id: 'instructor_004',
    name: 'อาจารย์สมชาย เก่งมาก',
    email: 'somchai.expert@university.ac.th',
    password: '$2a$12$vEtoEDHE3CnGAhEpuweCZesUr9SCgaO6rp/Ju6OAjHuAEh951q1OO', // password: 123456
    roles: '["instructor"]',
    t_title: 'อาจารย์',
    t_name: 'สมชาย',
    t_surname: 'เก่งมาก',
    e_title: 'Dr.',
    e_name: 'Somchai',
    e_surname: 'Kengmak'
  }
];

// ข้อมูลวิชา (courses)
const courses = [
  { id: 'IT101', name: 'เทคโนโลยีสารสนเทศ', code: 'IT101' },
  { id: 'SD201', name: 'การพัฒนาซอฟต์แวร์', code: 'SD201' },
  { id: 'CS301', name: 'วิทยาการคอมพิวเตอร์', code: 'CS301' },
  { id: 'BM401', name: 'การจัดการธุรกิจ', code: 'BM401' }
];

async function generateCourseInstructors() {
  try {
    console.log('🚀 เริ่มสร้างข้อมูลอาจารย์ประจำวิชา...');

    // 1. ตรวจสอบปีการศึกษา 2568
    console.log('📅 ตรวจสอบปีการศึกษา 2568...');
    const existingYear = await prisma.academicYear.findFirst({
      where: { year: '2568' }
    });
    if (!existingYear) {
      console.log('❌ ไม่พบปีการศึกษา 2568');
      return;
    }
    console.log('✅ พบปีการศึกษา 2568');

    // 2. ตรวจสอบเทอมสำหรับปี 68
    console.log('📚 ตรวจสอบเทอมสำหรับปี 68...');
    const semesters = await prisma.semester.findMany({
      where: { academicYearId: existingYear.id }
    });
    console.log(`✅ พบเทอม: ${semesters.length} เทอม`);

    // 3. ตรวจสอบบทบาทอาจารย์ประจำวิชา
    console.log('👨‍🏫 ตรวจสอบบทบาทอาจารย์ประจำวิชา...');
    const instructorRole = await prisma.educatorRole.findFirst({
      where: { name: 'อาจารย์ประจำวิชา' }
    });
    if (!instructorRole) {
      console.log('❌ ไม่พบบทบาทอาจารย์ประจำวิชา');
      return;
    }
    console.log('✅ พบบทบาทอาจารย์ประจำวิชา');

    // 4. สร้างอาจารย์ใหม่ 3 คน
    console.log('👥 สร้างอาจารย์ใหม่ 3 คน...');
    for (const instructor of newInstructors) {
      try {
        await prisma.user.create({
          data: instructor
        });
        console.log(`✅ สร้างอาจารย์: ${instructor.name}`);
      } catch (error) {
        console.log(`⚠️  อาจารย์ ${instructor.name} มีอยู่แล้ว`);
      }
    }

    // 5. อัปเดต educatorRoleId ให้อาจารย์ใหม่
    console.log('🔗 อัปเดต educatorRoleId ให้อาจารย์ใหม่...');
    for (const instructor of newInstructors) {
      await prisma.user.update({
        where: { id: instructor.id },
        data: { educatorRoleId: instructorRole.id }
      });
    }

    // 6. สร้างการกำหนดอาจารย์ประจำวิชาให้แต่ละวิชา
    console.log('🎯 กำหนดอาจารย์ประจำวิชาให้แต่ละวิชา...');
    
    const courseInstructorData = [
      {
        id: 'ci_tech_info',
        instructorId: 'instructor_001',
        courseId: 'IT101'
      },
      {
        id: 'ci_software_dev',
        instructorId: 'instructor_002',
        courseId: 'SD201'
      },
      {
        id: 'ci_computer_sci',
        instructorId: 'instructor_003',
        courseId: 'CS301'
      },
      {
        id: 'ci_business_mgmt',
        instructorId: 'instructor_004',
        courseId: 'BM401'
      }
    ];

    for (const ci of courseInstructorData) {
      try {
        await prisma.courseInstructor.create({
          data: {
            id: ci.id,
            instructorId: ci.instructorId,
            roleId: instructorRole.id,
            academicYearId: existingYear.id,
            semesterId: semesters[0].id, // ใช้เทอมแรก
            courseId: ci.courseId,
            isActive: true,
            createdBy: 'admin-001'
          }
        });
        console.log(`✅ กำหนดอาจารย์: ${ci.courseId} - ${ci.instructorId}`);
      } catch (error) {
        console.log(`⚠️  อาจารย์ ${ci.courseId} มีอยู่แล้ว`);
      }
    }

    // 7. สร้างการกำหนดสำหรับเทอมอื่นๆ
    console.log('📚 สร้างการกำหนดสำหรับเทอมอื่นๆ...');
    
    for (let i = 1; i < semesters.length; i++) {
      const semester = semesters[i];
      for (const ci of courseInstructorData) {
        const newId = `${ci.id}_${semester.id}`;
        try {
          await prisma.courseInstructor.create({
            data: {
              id: newId,
              instructorId: ci.instructorId,
              roleId: instructorRole.id,
              academicYearId: existingYear.id,
              semesterId: semester.id,
              courseId: ci.courseId,
              isActive: false, // เฉพาะเทอมแรกที่ active
              createdBy: 'admin-001'
            }
          });
          console.log(`✅ กำหนดอาจารย์: ${ci.courseId} - ${semester.name}`);
        } catch (error) {
          console.log(`⚠️  อาจารย์ ${ci.courseId} - ${semester.name} มีอยู่แล้ว`);
        }
      }
    }

    console.log('🎉 สร้างข้อมูลอาจารย์ประจำวิชาเสร็จสิ้น!');
    
    // แสดงสรุปข้อมูล
    const totalInstructors = await prisma.user.count({
      where: { roles: { contains: 'instructor' } }
    });
    
    const totalCourseInstructors = await prisma.courseInstructor.count();

    console.log('\n📊 สรุปข้อมูล:');
    console.log(`- อาจารย์ทั้งหมด: ${totalInstructors} คน`);
    console.log(`- การกำหนดอาจารย์ประจำวิชา: ${totalCourseInstructors} รายการ`);
    console.log(`- ปีการศึกษา: 2568`);
    console.log(`- เทอม: ${semesters.length} เทอม`);
    console.log(`- วิชา: ${courses.length} วิชา`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateCourseInstructors();
