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

// ข้อมูลสาขาวิชา (majors)
const majors = [
  { id: 'major-1', name: 'เทคโนโลยีสารสนเทศ' },
  { id: 'major-2', name: 'การพัฒนาซอฟต์แวร์' },
  { id: 'major-3', name: 'วิทยาการคอมพิวเตอร์' },
  { id: 'major-4', name: 'การจัดการธุรกิจ' }
];

// ข้อมูลภาคเรียนปี 68
const academicYear68 = {
  id: 'academic_2568',
  year: '2568',
  isActive: true
};

// ข้อมูลเทอมสำหรับปี 68
const semesters68 = [
  {
    id: 'sem-68-1',
    name: 'ภาคเรียนที่ 1/2568',
    semester: 'ภาคเรียนที่ 1/2568',
    startDate: new Date('2025-08-01'),
    endDate: new Date('2025-12-31'),
    isActive: true,
    academicYearId: 'academic_2568'
  },
  {
    id: 'sem-68-2',
    name: 'ภาคเรียนที่ 2/2568',
    semester: 'ภาคเรียนที่ 2/2568',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-05-31'),
    isActive: false,
    academicYearId: 'academic_2568'
  },
  {
    id: 'sem-68-3',
    name: 'ภาคเรียนฤดูร้อน/2568',
    semester: 'ภาคเรียนฤดูร้อน/2568',
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-07-31'),
    isActive: false,
    academicYearId: 'academic_2568'
  }
];

// ข้อมูลบทบาทอาจารย์ประจำวิชา
const instructorRole = {
  id: 'role_instructor',
  name: 'อาจารย์ประจำวิชา',
  nameEn: 'Course Instructor',
  description: 'อาจารย์ที่รับผิดชอบการสอนวิชาเฉพาะ',
  isActive: true
};

async function generateCourseInstructors() {
  try {
    console.log('🚀 เริ่มสร้างข้อมูลอาจารย์ประจำวิชา...');

    // 1. ตรวจสอบปีการศึกษา 2568
    console.log('📅 ตรวจสอบปีการศึกษา 2568...');
    const existingYear = await prisma.academicYear.findFirst({
      where: { year: '2568' }
    });
    if (!existingYear) {
      await prisma.academicYear.create({
        data: academicYear68
      });
      console.log('✅ สร้างปีการศึกษา 2568');
    } else {
      console.log('✅ พบปีการศึกษา 2568 อยู่แล้ว');
      // อัปเดต ID ให้ตรงกับที่มีอยู่
      academicYear68.id = existingYear.id;
    }

    // 2. ตรวจสอบเทอมสำหรับปี 68
    console.log('📚 ตรวจสอบเทอมสำหรับปี 68...');
    for (const semester of semesters68) {
      // อัปเดต academicYearId ให้ตรงกับที่มีอยู่
      semester.academicYearId = academicYear68.id;
      
      const existingSemester = await prisma.semester.findUnique({
        where: { id: semester.id }
      });
      if (!existingSemester) {
        await prisma.semester.create({
          data: semester
        });
        console.log(`✅ สร้างเทอม: ${semester.semester}`);
      } else {
        console.log(`✅ พบเทอม: ${semester.semester} อยู่แล้ว`);
      }
    }

    // 3. ตรวจสอบบทบาทอาจารย์ประจำวิชา
    console.log('👨‍🏫 ตรวจสอบบทบาทอาจารย์ประจำวิชา...');
    const existingRole = await prisma.educatorRole.findFirst({
      where: { name: 'อาจารย์ประจำวิชา' }
    });
    if (!existingRole) {
      await prisma.educatorRole.create({
        data: instructorRole
      });
      console.log('✅ สร้างบทบาทอาจารย์ประจำวิชา');
    } else {
      console.log('✅ พบบทบาทอาจารย์ประจำวิชาอยู่แล้ว');
      // อัปเดต ID ให้ตรงกับที่มีอยู่
      instructorRole.id = existingRole.id;
    }

    // 4. สร้างอาจารย์ใหม่ 3 คน
    console.log('👥 สร้างอาจารย์ใหม่ 3 คน...');
    for (const instructor of newInstructors) {
      await prisma.user.upsert({
        where: { id: instructor.id },
        update: instructor,
        create: instructor
      });
      console.log(`✅ สร้างอาจารย์: ${instructor.name}`);
    }

    // 5. สร้างการกำหนดอาจารย์ประจำวิชาให้แต่ละสาขาวิชา
    console.log('🎯 กำหนดอาจารย์ประจำวิชาให้แต่ละสาขาวิชา...');
    
    const courseInstructorData = [
      {
        id: 'ci_tech_info',
        instructorId: 'instructor_001',
        course: 'เทคโนโลยีสารสนเทศ',
        courseCode: 'IT101'
      },
      {
        id: 'ci_software_dev',
        instructorId: 'instructor_002',
        course: 'การพัฒนาซอฟต์แวร์',
        courseCode: 'SD201'
      },
      {
        id: 'ci_computer_sci',
        instructorId: 'instructor_003',
        course: 'วิทยาการคอมพิวเตอร์',
        courseCode: 'CS301'
      },
      {
        id: 'ci_business_mgmt',
        instructorId: 'instructor_004',
        course: 'การจัดการธุรกิจ',
        courseCode: 'BM401'
      }
    ];

    for (const ci of courseInstructorData) {
      try {
        await prisma.courseInstructor.create({
          data: {
            id: ci.id,
            instructorId: ci.instructorId,
            roleId: instructorRole.id,
            academicYearId: academicYear68.id,
            semesterId: 'sem-68-1',
            course: ci.course,
            courseCode: ci.courseCode,
            isActive: true,
            createdById: 'admin-001'
          }
        });
        console.log(`✅ กำหนดอาจารย์: ${ci.course} - ${ci.instructorId}`);
      } catch (error) {
        console.log(`⚠️  อาจารย์ ${ci.course} มีอยู่แล้ว`);
      }
    }

    // 6. สร้างการกำหนดสำหรับเทอมที่ 2 และ 3
    console.log('📚 สร้างการกำหนดสำหรับเทอมที่ 2 และ 3...');
    
    const semesters = ['sem-68-2', 'sem-68-3'];
    const courseInstructors = [
      { id: 'ci_tech_info_2', instructorId: 'instructor_001', course: 'เทคโนโลยีสารสนเทศ', courseCode: 'IT102' },
      { id: 'ci_software_dev_2', instructorId: 'instructor_002', course: 'การพัฒนาซอฟต์แวร์', courseCode: 'SD202' },
      { id: 'ci_computer_sci_2', instructorId: 'instructor_003', course: 'วิทยาการคอมพิวเตอร์', courseCode: 'CS302' },
      { id: 'ci_business_mgmt_2', instructorId: 'instructor_004', course: 'การจัดการธุรกิจ', courseCode: 'BM402' }
    ];

    for (const semesterId of semesters) {
      for (const ci of courseInstructors) {
        const newId = `${ci.id}_${semesterId.split('-')[2]}`;
        await prisma.courseInstructor.upsert({
          where: { id: newId },
          update: {},
          create: {
            id: newId,
            instructorId: ci.instructorId,
            roleId: 'role_instructor',
            academicYearId: 'academic_2568',
            semesterId: semesterId,
            course: ci.course,
            courseCode: ci.courseCode,
            isActive: semesterId === 'sem-68-1', // เฉพาะเทอม 1 ที่ active
            createdById: 'admin-001'
          }
        });
      }
    }

    // 7. อัปเดต educatorRoleId ให้อาจารย์ใหม่
    console.log('🔗 อัปเดต educatorRoleId ให้อาจารย์ใหม่...');
    for (const instructor of newInstructors) {
      await prisma.user.update({
        where: { id: instructor.id },
        data: { educatorRoleId: 'role_instructor' }
      });
    }

    console.log('🎉 สร้างข้อมูลอาจารย์ประจำวิชาเสร็จสิ้น!');
    
    // แสดงสรุปข้อมูล
    const totalInstructors = await prisma.user.count({
      where: { roles: { contains: 'instructor' } }
    });
    
    const totalCourseInstructors = await prisma.courseInstructor.count({
      where: { roleId: 'role_instructor' }
    });

    console.log('\n📊 สรุปข้อมูล:');
    console.log(`- อาจารย์ทั้งหมด: ${totalInstructors} คน`);
    console.log(`- การกำหนดอาจารย์ประจำวิชา: ${totalCourseInstructors} รายการ`);
    console.log(`- ปีการศึกษา: 2568`);
    console.log(`- เทอม: 3 เทอม (1, 2, ฤดูร้อน)`);
    console.log(`- สาขาวิชา: 4 สาขา`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateCourseInstructors();
