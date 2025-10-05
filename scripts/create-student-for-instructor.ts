import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createStudentForInstructor() {
  try {
    console.log('🔧 Creating student data for instructor_test_001...');

    // 1. สร้าง/อัปเดต student ใหม่
    console.log('👨‍🎓 Creating new student...');
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    const newStudent = await prisma.user.upsert({
      where: { id: 'student_for_instructor_001' },
      update: {},
      create: {
        id: 'student_for_instructor_001',
        name: 'นางสาวสมใจ เรียนดี',
        email: 'student.instructor.test@university.ac.th',
        password: hashedPassword,
        roles: '["student"]',
        t_title: 'นางสาว',
        t_name: 'สมใจ',
        t_surname: 'เรียนดี',
        e_title: 'Ms.',
        e_name: 'Somjai',
        e_surname: 'Riandee',
        phone: '080-999-8888',
        nationality: 'ไทย',
        campus: 'วิทยาเขตหลัก',
        gpa: '3.75'
      }
    });

    console.log('✅ New student created:', newStudent.name);

    // 2. ตรวจสอบ instructor_test_001
    console.log('👨‍🏫 Checking instructor_test_001...');
    const instructor = await prisma.user.findUnique({
      where: { id: 'instructor_test_001' }
    });

    if (!instructor) {
      console.log('❌ Instructor not found, creating...');
      const instructorPassword = await bcrypt.hash('123456', 12);
      
      const newInstructor = await prisma.user.upsert({
        where: { id: 'instructor_test_001' },
        update: {},
        create: {
          id: 'instructor_test_001',
          name: 'อาจารย์ทดสอบ 001',
          email: 'instructor.test@smart-solutions.com',
          password: instructorPassword,
          roles: '["courseInstructor"]',
          t_title: 'อาจารย์',
          t_name: 'ทดสอบ',
          t_surname: '001',
          e_title: 'Mr.',
          e_name: 'Test',
          e_surname: '001',
          phone: '080-111-2222',
          nationality: 'ไทย',
          campus: 'วิทยาเขตหลัก'
        }
      });
      console.log('✅ Instructor created:', newInstructor.name);
    } else {
      console.log('✅ Instructor found:', instructor.name);
    }

    // 3. สร้าง/อัปเดต company ใหม่
    console.log('🏢 Creating new company...');
    const newCompany = await prisma.company.upsert({
      where: { id: 'comp_for_instructor_001' },
      update: {},
      create: {
        id: 'comp_for_instructor_001',
        name: 'บริษัท นวัตกรรมดิจิทัล จำกัด',
        nameEn: 'Digital Innovation Co., Ltd.',
        address: '456 ถนนดิจิทัล เขตสาทร กรุงเทพฯ 10120',
        phone: '02-987-6543',
        email: 'info@digitalinnovation.co.th',
        website: 'https://digitalinnovation.co.th',
        description: 'บริษัทผู้เชี่ยวชาญด้านการพัฒนาซอฟต์แวร์และระบบดิจิทัล',
        industry: 'เทคโนโลยีดิจิทัล',
        size: 'large',
        isActive: true
      }
    });

    console.log('✅ New company created:', newCompany.name);

    // 4. สร้าง/อัปเดต internship ใหม่
    console.log('💼 Creating new internship...');
    const newInternship = await prisma.internship.upsert({
      where: { id: 'int_for_instructor_001' },
      update: {},
      create: {
        id: 'int_for_instructor_001',
        title: 'นักพัฒนาซอฟต์แวร์',
        companyId: newCompany.id,
        location: 'กรุงเทพฯ',
        description: 'พัฒนาและดูแลระบบซอฟต์แวร์โดยใช้เทคโนโลยีสมัยใหม่ เช่น Node.js, React, และ Cloud Computing',
        type: 'internship'
      }
    });

    console.log('✅ New internship created:', newInternship.title);

    // 5. สร้าง application ที่มอบหมายให้ instructor_test_001
    console.log('📋 Creating application for instructor_test_001...');
    const newApplication = await prisma.application.upsert({
      where: { id: 'app_for_instructor_001' },
      update: {},
      create: {
        id: 'app_for_instructor_001',
        studentId: newStudent.id,
        internshipId: newInternship.id,
        courseInstructorId: 'instructor_test_001', // มอบหมายให้ instructor_test_001
        status: 'pending',
        dateApplied: new Date(),
        feedback: null,
        projectTopic: 'การพัฒนาระบบจัดการข้อมูลด้วย Node.js และ React'
      }
    });

    console.log('✅ Application created:', {
      id: newApplication.id,
      student: newStudent.name,
      instructor: 'instructor_test_001',
      internship: newInternship.title,
      status: newApplication.status
    });

    // 6. ทดสอบ API
    console.log('\n🧪 Testing API for instructor_test_001...');
    try {
      const response = await fetch(`http://localhost:8080/api/educator/coop-requests?userId=instructor_test_001&page=1&limit=10`);
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
        const detailsResponse = await fetch(`http://localhost:8080/api/educator/applications/${app.id}?userId=instructor_test_001`);
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

    console.log('\n🎉 Student data for instructor_test_001 created successfully!');
    console.log('📝 Test credentials:');
    console.log('  Student: student.instructor.test@university.ac.th / 123456');
    console.log('  Instructor: instructor.test@smart-solutions.com / 123456');

  } catch (error) {
    console.error('❌ Error creating student data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createStudentForInstructor();
