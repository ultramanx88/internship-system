import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createCompleteTestData() {
  try {
    console.log('🔧 Creating complete test data...');

    // 1. สร้าง/อัปเดต test_student_001
    console.log('👨‍🎓 Creating test_student_001...');
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    const testStudent = await prisma.user.upsert({
      where: { id: 'test_student_001' },
      update: {},
      create: {
        id: 'test_student_001',
        name: 'นายทดสอบ ใจดี',
        email: 'test.student.flow@university.ac.th',
        password: hashedPassword,
        roles: '["student"]',
        t_title: 'นาย',
        t_name: 'ทดสอบ',
        t_surname: 'ใจดี',
        e_title: 'Mr.',
        e_name: 'Test',
        e_surname: 'Student',
        phone: '080-123-4567',
        nationality: 'ไทย',
        campus: 'วิทยาเขตหลัก',
        gpa: '3.25'
      }
    });

    console.log('✅ Test student created:', testStudent.name);

    // 2. สร้าง/อัปเดต user_t6800008 (อาจารย์ประจำวิชา)
    console.log('👨‍🏫 Creating user_t6800008...');
    const instructorPassword = await bcrypt.hash('123456', 12);
    
    const instructor = await prisma.user.upsert({
      where: { id: 'user_t6800008' },
      update: {},
      create: {
        id: 'user_t6800008',
        name: 'อาจารย์สมพร ใจดี',
        email: 't6800008@smart-solutions.com',
        password: instructorPassword,
        roles: '["อาจารย์ประจำวิชา"]',
        t_title: 'อาจารย์',
        t_name: 'สมพร',
        t_surname: 'ใจดี',
        e_title: 'Mr.',
        e_name: 'Somporn',
        e_surname: 'Jaidee',
        phone: '081-234-5678',
        nationality: 'ไทย',
        campus: 'วิทยาเขตหลัก'
      }
    });

    console.log('✅ Instructor created:', instructor.name);

    // 3. สร้าง/อัปเดต company
    console.log('🏢 Creating company...');
    const company = await prisma.company.upsert({
      where: { id: 'comp_test_001' },
      update: {},
      create: {
        id: 'comp_test_001',
        name: 'บริษัท เทคโนโลยี จำกัด',
        nameEn: 'Tech Solutions Co., Ltd.',
        address: '123 ถนนเทคโนโลยี เขตบางรัก กรุงเทพฯ 10500',
        phone: '02-123-4567',
        email: 'info@techsolutions.co.th',
        website: 'https://techsolutions.co.th',
        description: 'บริษัทเทคโนโลยีชั้นนำที่ให้บริการด้านการพัฒนาซอฟต์แวร์',
        industry: 'เทคโนโลยี',
        size: 'medium',
        isActive: true
      }
    });

    console.log('✅ Company created:', company.name);

    // 4. สร้าง/อัปเดต internship
    console.log('💼 Creating internship...');
    const internship = await prisma.internship.upsert({
      where: { id: 'int_test_001' },
      update: {},
      create: {
        id: 'int_test_001',
        title: 'นักพัฒนาเว็บแอปพลิเคชัน',
        companyId: company.id,
        location: 'กรุงเทพฯ',
        description: 'พัฒนาและดูแลเว็บแอปพลิเคชันโดยใช้ React และ TypeScript สร้างส่วนประกอบที่นำกลับมาใช้ใหม่ได้และไลบรารีส่วนหน้าเพื่อใช้ในอนาคต',
        type: 'internship'
      }
    });

    console.log('✅ Internship created:', internship.title);

    // 5. สร้าง application ที่มอบหมายให้ user_t6800008
    console.log('📋 Creating application...');
    const application = await prisma.application.upsert({
      where: { id: 'app_test_001' },
      update: {},
      create: {
        id: 'app_test_001',
        studentId: testStudent.id,
        internshipId: internship.id,
        courseInstructorId: instructor.id, // มอบหมายให้ user_t6800008
        status: 'pending',
        dateApplied: new Date(),
        feedback: null,
        projectTopic: 'การพัฒนาเว็บแอปพลิเคชันด้วย React และ TypeScript'
      }
    });

    console.log('✅ Application created:', {
      id: application.id,
      student: testStudent.name,
      instructor: instructor.name,
      internship: internship.title,
      status: application.status
    });

    // 6. ทดสอบ API
    console.log('\n🧪 Testing API...');
    try {
      const response = await fetch(`http://localhost:8080/api/educator/coop-requests?userId=${instructor.id}&page=1&limit=10`);
      const data = await response.json();
      
      console.log('📊 Coop-requests API:', {
        status: response.status,
        success: data.success,
        applicationsCount: data.applications?.length,
        total: data.pagination?.total
      });

      if (data.applications && data.applications.length > 0) {
        const app = data.applications[0];
        console.log('📋 First application:', {
          id: app.id,
          studentName: app.studentName,
          companyName: app.companyName,
          status: app.status
        });

        // ทดสอบ application details API
        const detailsResponse = await fetch(`http://localhost:8080/api/educator/applications/${app.id}?userId=${instructor.id}`);
        const detailsData = await detailsResponse.json();
        
        console.log('📄 Application details API:', {
          status: detailsResponse.status,
          success: detailsData.success,
          error: detailsData.error
        });
      }
    } catch (error) {
      console.error('❌ API test error:', error);
    }

    console.log('\n🎉 Complete test data created successfully!');
    console.log('📝 Test credentials:');
    console.log('  Student: test.student.flow@university.ac.th / 123456');
    console.log('  Instructor: t6800008@smart-solutions.com / 123456');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCompleteTestData();
