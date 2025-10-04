import prisma from '../src/lib/prisma';

async function createFinalCourseInstructors() {
  try {
    console.log('🚀 สร้างข้อมูลอาจารย์ประจำวิชาสุดท้าย...');

    // 1. ตรวจสอบข้อมูลที่มีอยู่
    const existingYear = await prisma.academicYear.findFirst({
      where: { year: '2568' }
    });
    
    const semesters = await prisma.semester.findMany({
      where: { academicYearId: existingYear.id }
    });
    
    const instructorRole = await prisma.educatorRole.findFirst({
      where: { name: 'อาจารย์ประจำวิชา' }
    });

    console.log(`📅 ปีการศึกษา: ${existingYear.year}`);
    console.log(`📚 เทอม: ${semesters.length} เทอม`);
    console.log(`👨‍🏫 บทบาท: ${instructorRole.name}`);

    // 2. สร้างข้อมูลอาจารย์ประจำวิชาใหม่
    const courseInstructorData = [
      {
        id: 'ci_tech_info_68',
        instructorId: 'instructor_001',
        courseId: 'IT101',
        courseName: 'เทคโนโลยีสารสนเทศ'
      },
      {
        id: 'ci_software_dev_68',
        instructorId: 'instructor_002',
        courseId: 'SD201',
        courseName: 'การพัฒนาซอฟต์แวร์'
      },
      {
        id: 'ci_computer_sci_68',
        instructorId: 'instructor_003',
        courseId: 'CS301',
        courseName: 'วิทยาการคอมพิวเตอร์'
      },
      {
        id: 'ci_business_mgmt_68',
        instructorId: 'instructor_004',
        courseId: 'BM401',
        courseName: 'การจัดการธุรกิจ'
      }
    ];

    // 3. สร้างการกำหนดอาจารย์ประจำวิชา
    console.log('🎯 สร้างการกำหนดอาจารย์ประจำวิชา...');
    
    for (const ci of courseInstructorData) {
      // สำหรับเทอมแรก (active)
      const firstSemester = semesters[0];
      try {
        await prisma.courseInstructor.create({
          data: {
            id: `${ci.id}_${firstSemester.id}`,
            instructorId: ci.instructorId,
            roleId: instructorRole.id,
            academicYearId: existingYear.id,
            semesterId: firstSemester.id,
            courseId: ci.courseId,
            isActive: true,
            createdBy: 'admin-001'
          }
        });
        console.log(`✅ กำหนดอาจารย์: ${ci.courseName} - ${firstSemester.name}`);
      } catch (error) {
        console.log(`⚠️  อาจารย์ ${ci.courseName} - ${firstSemester.name} มีอยู่แล้ว`);
      }

      // สำหรับเทอมอื่นๆ (inactive)
      for (let i = 1; i < semesters.length; i++) {
        const semester = semesters[i];
        try {
          await prisma.courseInstructor.create({
            data: {
              id: `${ci.id}_${semester.id}`,
              instructorId: ci.instructorId,
              roleId: instructorRole.id,
              academicYearId: existingYear.id,
              semesterId: semester.id,
              courseId: ci.courseId,
              isActive: false,
              createdBy: 'admin-001'
            }
          });
          console.log(`✅ กำหนดอาจารย์: ${ci.courseName} - ${semester.name}`);
        } catch (error) {
          console.log(`⚠️  อาจารย์ ${ci.courseName} - ${semester.name} มีอยู่แล้ว`);
        }
      }
    }

    // 4. อัปเดต educatorRoleId ให้อาจารย์ใหม่
    console.log('🔗 อัปเดต educatorRoleId ให้อาจารย์ใหม่...');
    const newInstructors = ['instructor_002', 'instructor_003', 'instructor_004'];
    for (const instructorId of newInstructors) {
      try {
        await prisma.user.update({
          where: { id: instructorId },
          data: { educatorRoleId: instructorRole.id }
        });
        console.log(`✅ อัปเดต educatorRoleId: ${instructorId}`);
      } catch (error) {
        console.log(`⚠️  ไม่พบอาจารย์: ${instructorId}`);
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
    console.log(`- วิชา: 4 วิชา`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createFinalCourseInstructors();
