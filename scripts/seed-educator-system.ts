import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedEducatorSystem() {
  try {
    console.log('🌱 เริ่มต้นการ seed ระบบบุคลากรทางการศึกษา...');

    // 1. สร้าง Educator Roles
    console.log('📚 สร้างบทบาทบุคลากรทางการศึกษา...');
    const educatorRoles = [
      {
        name: 'อาจารย์ประจำวิชา',
        nameEn: 'Course Instructor',
        description: 'อาจารย์ที่รับผิดชอบการสอนวิชาเฉพาะ'
      },
      {
        name: 'อาจารย์นิเทศ',
        nameEn: 'Academic Advisor',
        description: 'อาจารย์ที่ดูแลและให้คำแนะนำนักศึกษาในการฝึกงาน'
      },
      {
        name: 'กรรมการ',
        nameEn: 'Committee Member',
        description: 'กรรมการที่เกี่ยวข้องกับการประเมินและตัดสินใจ'
      }
    ];

    for (const role of educatorRoles) {
      await prisma.educatorRole.upsert({
        where: { name: role.name },
        update: role,
        create: role
      });
    }

    // 2. สร้าง Academic Years
    console.log('📅 สร้างปีการศึกษา...');
    const currentYear = new Date().getFullYear() + 543; // พ.ศ.
    const academicYears = [
      {
        year: (currentYear - 1).toString(),
        isActive: false
      },
      {
        year: currentYear.toString(),
        isActive: true
      },
      {
        year: (currentYear + 1).toString(),
        isActive: false
      }
    ];

    for (const year of academicYears) {
      await prisma.academicYear.upsert({
        where: { year: year.year },
        update: year,
        create: year
      });
    }

    // 3. สร้าง Semesters สำหรับปีปัจจุบัน
    console.log('📚 สร้างภาคการศึกษา...');
    const currentAcademicYear = await prisma.academicYear.findFirst({
      where: { isActive: true }
    });

    if (currentAcademicYear) {
      const semesters = [
        {
          academicYearId: currentAcademicYear.id,
          semester: '1',
          name: `ภาคเรียนที่ 1/${currentAcademicYear.year}`,
          startDate: new Date(2024, 5, 1), // มิถุนายน
          endDate: new Date(2024, 9, 30), // ตุลาคม
          isActive: true
        },
        {
          academicYearId: currentAcademicYear.id,
          semester: '2',
          name: `ภาคเรียนที่ 2/${currentAcademicYear.year}`,
          startDate: new Date(2024, 10, 1), // พฤศจิกายน
          endDate: new Date(2025, 2, 31), // มีนาคม
          isActive: false
        },
        {
          academicYearId: currentAcademicYear.id,
          semester: '3',
          name: `ภาคเรียนฤดูร้อน/${currentAcademicYear.year}`,
          startDate: new Date(2025, 3, 1), // เมษายน
          endDate: new Date(2025, 4, 31), // พฤษภาคม
          isActive: false
        }
      ];

      for (const semester of semesters) {
        await prisma.semester.upsert({
          where: {
            academicYearId_semester: {
              academicYearId: semester.academicYearId,
              semester: semester.semester
            }
          },
          update: semester,
          create: semester
        });
      }
    }

    // 4. สร้างตัวอย่างอาจารย์ (ถ้ายังไม่มี)
    console.log('👨‍🏫 สร้างตัวอย่างอาจารย์...');
    const instructorRole = await prisma.educatorRole.findFirst({
      where: { name: 'อาจารย์ประจำวิชา' }
    });

    if (instructorRole) {
      // ตรวจสอบว่ามีอาจารย์อยู่แล้วหรือไม่
      const existingInstructor = await prisma.user.findFirst({
        where: { roles: 'instructor' }
      });

      if (!existingInstructor) {
        await prisma.user.create({
          data: {
            name: 'อาจารย์สมชาย ใจดี',
            email: 'somchai.instructor@university.ac.th',
            password: 'password123',
            roles: 'instructor',
            educatorRoleId: instructorRole.id,
            t_title: 'อาจารย์',
            t_name: 'สมชาย',
            t_surname: 'ใจดี',
            e_title: 'Dr.',
            e_name: 'Somchai',
            e_surname: 'Jaidee',
            phone: '02-123-4567'
          }
        });
      }
    }

    // 5. สร้างตัวอย่าง Course Instructors
    console.log('🎓 สร้างตัวอย่างการกำหนดอาจารย์ประจำวิชา...');
    const activeSemester = await prisma.semester.findFirst({
      where: { isActive: true },
      include: { academicYear: true }
    });

    const instructor = await prisma.user.findFirst({
      where: { roles: 'instructor' }
    });

    if (activeSemester && instructor) {
      const courseInstructor = await prisma.courseInstructor.upsert({
        where: {
          academicYearId_semesterId_courseId_instructorId_roleId: {
            academicYearId: activeSemester.academicYearId,
            semesterId: activeSemester.id,
            courseId: 'CS101',
            instructorId: instructor.id,
            roleId: instructorRole!.id
          }
        },
        update: {},
        create: {
          academicYearId: activeSemester.academicYearId,
          semesterId: activeSemester.id,
          courseId: 'CS101',
          instructorId: instructor.id,
          roleId: instructorRole!.id,
          createdBy: instructor.id // ใช้ instructor เป็นคนสร้างเอง
        }
      });

      console.log('✅ สร้าง Course Instructor สำเร็จ:', courseInstructor.id);
    }

    console.log('🎉 การ seed ระบบบุคลากรทางการศึกษาเสร็จสิ้น!');
    
    // แสดงข้อมูลสรุป
    const roleCount = await prisma.educatorRole.count();
    const yearCount = await prisma.academicYear.count();
    const semesterCount = await prisma.semester.count();
    const instructorCount = await prisma.courseInstructor.count();

    console.log('\n📊 สรุปข้อมูลที่สร้าง:');
    console.log(`- บทบาทบุคลากร: ${roleCount} รายการ`);
    console.log(`- ปีการศึกษา: ${yearCount} รายการ`);
    console.log(`- ภาคการศึกษา: ${semesterCount} รายการ`);
    console.log(`- การกำหนดอาจารย์: ${instructorCount} รายการ`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการ seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// รัน seed function
seedEducatorSystem()
  .then(() => {
    console.log('✅ Seed เสร็จสิ้น');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed ล้มเหลว:', error);
    process.exit(1);
  });
