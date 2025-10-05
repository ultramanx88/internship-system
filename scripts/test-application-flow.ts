import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testApplicationFlow() {
  try {
    console.log('🧪 Testing Application Flow...');

    // 1. สร้างข้อมูลบริษัททดสอบ
    const company = await prisma.company.upsert({
      where: { id: 'test_company_001' },
      update: {},
      create: {
        id: 'test_company_001',
        name: 'บริษัท เทคโนโลยี จำกัด',
        address: '123 ถนนเทคโนโลยี แขวงเทคโนโลยี เขตเทคโนโลยี กรุงเทพฯ 10110',
        phone: '02-123-4567',
        email: 'hr@techcompany.com',
        website: 'https://techcompany.com',
        description: 'บริษัทเทคโนโลยีชั้นนำ',
        isActive: true
      }
    });

    // 2. สร้างข้อมูลการฝึกงานทดสอบ
    const internship = await prisma.internship.upsert({
      where: { id: 'test_internship_001' },
      update: {},
      create: {
        id: 'test_internship_001',
        title: 'การฝึกงานด้านการพัฒนาซอฟต์แวร์',
        companyId: company.id,
        location: 'กรุงเทพฯ',
        description: 'ฝึกงานด้านการพัฒนาซอฟต์แวร์และเทคโนโลยี',
        type: 'internship'
      }
    });

    // 3. สร้างข้อมูลนักศึกษาทดสอบ
    const student = await prisma.user.upsert({
      where: { id: 'test_student_001' },
      update: {},
      create: {
        id: 'test_student_001',
        email: 'test.student.flow@university.ac.th',
        name: 'นายทดสอบ ใจดี',
        password: '$2b$10$example', // hashed password
        roles: '["student"]',
        phone: '081-234-5678'
      }
    });

    // 4. สร้างข้อมูลอาจารย์ประจำวิชาทดสอบ
    const instructor = await prisma.user.upsert({
      where: { id: 'test_instructor_001' },
      update: {},
      create: {
        id: 'test_instructor_001',
        email: 'test.instructor.flow@university.ac.th',
        name: 'อาจารย์ทดสอบ ใจดี',
        password: '$2b$10$example', // hashed password
        roles: '["courseInstructor"]'
      }
    });

    // 5. สร้างข้อมูลใบสมัครทดสอบ
    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        internshipId: internship.id,
        courseInstructorId: instructor.id, // กำหนดให้อาจารย์ประจำวิชา
        status: 'pending',
        dateApplied: new Date(),
        feedback: null,
        projectTopic: 'โครงการพัฒนาระบบจัดการข้อมูล'
      },
      include: {
        student: true,
        internship: {
          include: {
            company: true
          }
        },
        courseInstructor: true
      }
    });

    console.log('✅ Test data created successfully:');
    console.log('📝 Application ID:', application.id);
    console.log('👨‍🎓 Student:', application.student.name);
    console.log('🏢 Company:', application.internship.company.name);
    console.log('👨‍🏫 Course Instructor:', application.courseInstructor?.name);
    console.log('📊 Status:', application.status);

    // 6. ทดสอบการดึงข้อมูลสำหรับอาจารย์ประจำวิชา
    const instructorApplications = await prisma.application.findMany({
      where: {
        courseInstructorId: instructor.id
      },
      include: {
        student: true,
        internship: {
          include: {
            company: true
          }
        }
      }
    });

    console.log('\n📋 Applications assigned to instructor:');
    console.log('👨‍🏫 Instructor:', instructor.name);
    console.log('📊 Total applications:', instructorApplications.length);
    instructorApplications.forEach((app, index) => {
      console.log(`  ${index + 1}. ${app.student.name} - ${app.internship.company.name} (${app.status})`);
    });

  } catch (error) {
    console.error('❌ Error testing application flow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testApplicationFlow();
