import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncEducatorData() {
  try {
    console.log('🔄 เริ่มต้นการ sync ข้อมูลบุคลากรทางการศึกษา...');

    // 1. สร้าง Academic Years
    console.log('📅 สร้างปีการศึกษา...');
    const academicYear = await prisma.academicYear.upsert({
      where: { year: '2567' },
      update: {},
      create: {
        year: '2567',
        isActive: true
      }
    });

    // 2. สร้าง Semesters
    console.log('📚 สร้างภาคเรียน...');
    const semester = await prisma.semester.upsert({
      where: {
        academicYearId_semester: {
          academicYearId: academicYear.id,
          semester: '1'
        }
      },
      update: {},
      create: {
        academicYearId: academicYear.id,
        semester: '1',
        name: 'ภาคเรียนที่ 1/2567',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-10-31'),
        isActive: true
      }
    });

    // 3. สร้าง Educator Roles
    console.log('👨‍🏫 สร้างบทบาทบุคลากร...');
    const instructorRole = await prisma.educatorRole.upsert({
      where: { name: 'อาจารย์ประจำวิชา' },
      update: {},
      create: {
        name: 'อาจารย์ประจำวิชา',
        nameEn: 'Course Instructor',
        description: 'อาจารย์ที่รับผิดชอบการสอนวิชาเฉพาะ'
      }
    });

    const advisorRole = await prisma.educatorRole.upsert({
      where: { name: 'อาจารย์นิเทศก์' },
      update: {},
      create: {
        name: 'อาจารย์นิเทศก์',
        nameEn: 'Academic Advisor',
        description: 'อาจารย์ที่ดูแลและให้คำแนะนำนักศึกษาในการฝึกงาน'
      }
    });

    // 4. สร้าง Instructor User
    console.log('👨‍🏫 สร้างอาจารย์...');
    const instructor = await prisma.user.upsert({
      where: { email: 'somchai.instructor@university.ac.th' },
      update: {},
      create: {
        name: 'อาจารย์สมชาย ใจดี',
        email: 'somchai.instructor@university.ac.th',
        password: 'password123',
        roles: 'instructor',
        educatorRoleId: advisorRole.id,
        t_title: 'อาจารย์',
        t_name: 'สมชาย',
        t_surname: 'ใจดี',
        e_title: 'Dr.',
        e_name: 'Somchai',
        e_surname: 'Jaidee',
        phone: '02-123-4567'
      }
    });

    // 5. สร้าง Course Instructor
    console.log('🎓 สร้างการกำหนดอาจารย์...');
    const courseInstructor = await prisma.courseInstructor.upsert({
      where: {
        academicYearId_semesterId_courseId_instructorId_roleId: {
          academicYearId: academicYear.id,
          semesterId: semester.id,
          courseId: 'CS101',
          instructorId: instructor.id,
          roleId: advisorRole.id
        }
      },
      update: {},
      create: {
        academicYearId: academicYear.id,
        semesterId: semester.id,
        courseId: 'CS101',
        instructorId: instructor.id,
        roleId: advisorRole.id,
        createdBy: instructor.id
      }
    });

    console.log('✅ การ sync ข้อมูลเสร็จสิ้น!');
    console.log('📊 สรุปข้อมูล:');
    console.log(`- ปีการศึกษา: ${academicYear.year}`);
    console.log(`- ภาคเรียน: ${semester.name}`);
    console.log(`- อาจารย์: ${instructor.name}`);
    console.log(`- บทบาท: ${advisorRole.name}`);
    console.log(`- Course Instructor ID: ${courseInstructor.id}`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// รัน sync function
syncEducatorData()
  .then(() => {
    console.log('✅ Sync เสร็จสิ้น');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Sync ล้มเหลว:', error);
    process.exit(1);
  });
