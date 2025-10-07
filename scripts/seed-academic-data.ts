import { prisma } from '../src/lib/prisma';

async function seedAcademicData() {
  try {
    console.log('🌱 เริ่มต้นการสร้างข้อมูลปีการศึกษาและภาคเรียน...');

    // สร้างปีการศึกษา
    const academicYears = [
      {
        year: 2023,
        name: 'ปีการศึกษา 2566',
        startDate: new Date('2023-06-01'),
        endDate: new Date('2024-05-31'),
        isActive: false
      },
      {
        year: 2024,
        name: 'ปีการศึกษา 2567',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-05-31'),
        isActive: true
      },
      {
        year: 2025,
        name: 'ปีการศึกษา 2568',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2026-05-31'),
        isActive: false
      }
    ];

    console.log('📅 สร้างปีการศึกษา...');
    for (const yearData of academicYears) {
      const existingYear = await prisma.academicYear.findUnique({
        where: { year: yearData.year }
      });

      if (!existingYear) {
        const academicYear = await prisma.academicYear.create({
          data: yearData
        });
        console.log(`✅ สร้างปีการศึกษา: ${academicYear.name}`);

        // สร้างภาคเรียนสำหรับปีการศึกษานี้
        const semesters = [
          {
            name: 'ภาคเรียนที่ 1',
            academicYearId: academicYear.id,
            startDate: new Date(yearData.startDate.getFullYear(), 5, 1), // มิถุนายน
            endDate: new Date(yearData.startDate.getFullYear(), 9, 30), // ตุลาคม
            isActive: yearData.isActive
          },
          {
            name: 'ภาคเรียนที่ 2',
            academicYearId: academicYear.id,
            startDate: new Date(yearData.startDate.getFullYear(), 10, 1), // พฤศจิกายน
            endDate: new Date(yearData.startDate.getFullYear() + 1, 2, 31), // มีนาคม
            isActive: false
          },
          {
            name: 'ภาคเรียนฤดูร้อน',
            academicYearId: academicYear.id,
            startDate: new Date(yearData.startDate.getFullYear() + 1, 3, 1), // เมษายน
            endDate: new Date(yearData.startDate.getFullYear() + 1, 4, 31), // พฤษภาคม
            isActive: false
          }
        ];

        console.log(`📚 สร้างภาคเรียนสำหรับ ${academicYear.name}...`);
        for (const semesterData of semesters) {
          const semester = await prisma.semester.create({
            data: semesterData
          });
          console.log(`  ✅ สร้างภาคเรียน: ${semester.name}`);
        }
      } else {
        console.log(`⚠️  ปีการศึกษา ${yearData.name} มีอยู่แล้ว`);
      }
    }

    // สร้างข้อมูลตัวอย่าง Educator Role Assignments
    console.log('👨‍🏫 สร้างข้อมูลตัวอย่างการกำหนดบทบาท Educator...');
    
    // หา educator users
    const educators = await prisma.user.findMany({
      where: {
        OR: [
          { roles: { contains: 'courseInstructor' } },
          { roles: { contains: 'supervisor' } },
          { roles: { contains: 'committee' } },
          { roles: { contains: 'visitor' } }
        ]
      },
      take: 5
    });

    if (educators.length > 0) {
      // หาปีการศึกษาปัจจุบัน
      const currentAcademicYear = await prisma.academicYear.findFirst({
        where: { isActive: true },
        include: { semesters: true }
      });

      if (currentAcademicYear) {
        const semester1 = currentAcademicYear.semesters.find(s => s.name === 'ภาคเรียนที่ 1');
        
        if (semester1) {
          // สร้าง role assignments ตัวอย่าง
          const roleAssignments = [
            {
              educatorId: educators[0].id,
              academicYearId: currentAcademicYear.id,
              semesterId: semester1.id,
              roles: ['courseInstructor', 'supervisor'],
              isActive: true,
              notes: 'อาจารย์ประจำวิชาและอาจารย์นิเทศ'
            },
            {
              educatorId: educators[1]?.id,
              academicYearId: currentAcademicYear.id,
              semesterId: semester1.id,
              roles: ['committee'],
              isActive: true,
              notes: 'กรรมการพิจารณาใบสมัคร'
            },
            {
              educatorId: educators[2]?.id,
              academicYearId: currentAcademicYear.id,
              semesterId: semester1.id,
              roles: ['visitor'],
              isActive: true,
              notes: 'ผู้เยี่ยมชมสถานประกอบการ'
            }
          ];

          for (const assignmentData of roleAssignments) {
            if (assignmentData.educatorId) {
              const existingAssignment = await prisma.educatorRoleAssignment.findFirst({
                where: {
                  educatorId: assignmentData.educatorId,
                  academicYearId: assignmentData.academicYearId,
                  semesterId: assignmentData.semesterId
                }
              });

              if (!existingAssignment) {
                const assignment = await prisma.educatorRoleAssignment.create({
                  data: {
                    ...assignmentData,
                    roles: JSON.stringify(assignmentData.roles)
                  }
                });
                console.log(`✅ สร้างการกำหนดบทบาท: ${assignmentData.roles.join(', ')}`);
              }
            }
          }
        }
      }
    }

    console.log('🎉 สร้างข้อมูลปีการศึกษาและภาคเรียนเสร็จสิ้น!');
    
    // แสดงสรุปข้อมูล
    const totalYears = await prisma.academicYear.count();
    const totalSemesters = await prisma.semester.count();
    const totalAssignments = await prisma.educatorRoleAssignment.count();
    
    console.log('\n📊 สรุปข้อมูลที่สร้าง:');
    console.log(`- ปีการศึกษา: ${totalYears} รายการ`);
    console.log(`- ภาคเรียน: ${totalSemesters} รายการ`);
    console.log(`- การกำหนดบทบาท: ${totalAssignments} รายการ`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการสร้างข้อมูล:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// รันฟังก์ชัน
seedAcademicData()
  .then(() => {
    console.log('✅ การสร้างข้อมูลเสร็จสิ้น');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ เกิดข้อผิดพลาด:', error);
    process.exit(1);
  });
