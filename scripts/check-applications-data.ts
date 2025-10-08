import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkApplicationsData() {
  try {
    console.log('🔍 ตรวจสอบข้อมูล applications...\n');

    // ตรวจสอบจำนวน applications
    const totalApplications = await prisma.application.count();
    console.log(`📊 จำนวน applications ทั้งหมด: ${totalApplications}`);

    if (totalApplications === 0) {
      console.log('❌ ไม่มีข้อมูล applications ในระบบ');
      console.log('🔧 กำลังสร้างข้อมูลตัวอย่าง...');
      
      // หานักศึกษาและบริษัทที่มีอยู่
      const students = await prisma.user.findMany({
        where: {
          roles: {
            contains: 'student'
          }
        },
        take: 5
      });

      const companies = await prisma.company.findMany({
        take: 3
      });

      const internships = await prisma.internship.findMany({
        take: 3
      });

      console.log(`👥 นักศึกษา: ${students.length} คน`);
      console.log(`🏢 บริษัท: ${companies.length} แห่ง`);
      console.log(`💼 งานฝึกงาน: ${internships.length} ตำแหน่ง`);

      if (students.length === 0 || internships.length === 0) {
        console.log('❌ ไม่มีนักศึกษาหรืองานฝึกงานเพียงพอสำหรับสร้าง applications');
        return;
      }

      // สร้าง applications ตัวอย่าง
      const sampleApplications = [];
      for (let i = 0; i < Math.min(10, students.length); i++) {
        const student = students[i];
        const internship = internships[i % internships.length];
        
        sampleApplications.push({
          studentId: student.id,
          internshipId: internship.id,
          studentReason: `เหตุผลในการสมัครฝึกงาน ${i + 1}`,
          expectedSkills: ['JavaScript', 'React', 'Node.js'],
          preferredStartDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 วันจากนี้
          availableDuration: 3,
          projectProposal: `โครงการฝึกงาน ${i + 1}: การพัฒนาระบบจัดการข้อมูล`,
          status: ['pending', 'approved', 'rejected'][i % 3],
          dateApplied: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // วันที่สมัครลดลงทีละวัน
        });
      }

      // บันทึกข้อมูล
      await prisma.application.createMany({
        data: sampleApplications
      });

      console.log(`✅ สร้าง applications ตัวอย่าง ${sampleApplications.length} รายการเรียบร้อย`);
    }

    // แสดงข้อมูล applications
    const applications = await prisma.application.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            major: {
              select: {
                nameTh: true,
                nameEn: true
              }
            }
          }
        },
        internship: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                nameEn: true
              }
            }
          }
        }
      },
      orderBy: {
        dateApplied: 'desc'
      },
      take: 10
    });

    console.log('\n📋 ข้อมูล applications ล่าสุด:');
    applications.forEach((app, index) => {
      console.log(`${index + 1}. ${app.student.name} (${app.student.email})`);
      console.log(`   - บริษัท: ${app.internship.company.name}`);
      console.log(`   - สาขา: ${app.student.major?.nameTh || 'ไม่ระบุ'}`);
      console.log(`   - สถานะ: ${app.status}`);
      console.log(`   - วันที่สมัคร: ${app.dateApplied.toLocaleDateString('th-TH')}`);
      console.log(`   - ระยะเวลา: ${app.availableDuration} เดือน`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkApplicationsData();
