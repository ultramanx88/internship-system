import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestApplication() {
  try {
    console.log('🔧 Creating test application...');
    
    // หา user ที่เป็น courseInstructor
    const instructor = await prisma.user.findFirst({
      where: { roles: { contains: 'courseInstructor' } }
    });

    if (!instructor) {
      console.log('❌ No instructor found');
      return;
    }

    console.log('👨‍🏫 Found instructor:', instructor.name);

    // หา student
    const student = await prisma.user.findFirst({
      where: { roles: { contains: 'student' } }
    });

    if (!student) {
      console.log('❌ No student found');
      return;
    }

    console.log('👨‍🎓 Found student:', student.name);

    // หา internship
    const internship = await prisma.internship.findFirst();

    if (!internship) {
      console.log('❌ No internship found');
      return;
    }

    console.log('🏢 Found internship:', internship.title);

    // สร้าง application
    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        internshipId: internship.id,
        courseInstructorId: instructor.id,
        status: 'pending',
        dateApplied: new Date(),
        feedback: null
      }
    });

    console.log('✅ Application created:', {
      id: application.id,
      student: student.name,
      instructor: instructor.name,
      internship: internship.title,
      status: application.status
    });

    // ทดสอบ API call
    console.log('\n🧪 Testing API call...');
    const response = await fetch(`http://localhost:8080/api/educator/coop-requests?userId=${instructor.id}&page=1&limit=10`);
    const data = await response.json();
    
    console.log('📊 API Response:', {
      success: data.success,
      applicationsCount: data.applications?.length || 0,
      total: data.pagination?.total || 0
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestApplication();
