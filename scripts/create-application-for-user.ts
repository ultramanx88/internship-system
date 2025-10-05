import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createApplicationForUser() {
  try {
    console.log('🔧 Creating application for user_t6800008...');
    
    // หา user_t6800008
    const instructor = await prisma.user.findUnique({
      where: { id: 'user_t6800008' }
    });

    if (!instructor) {
      console.log('❌ Instructor not found');
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

    // สร้าง application ที่มอบหมายให้ user_t6800008
    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        internshipId: internship.id,
        courseInstructorId: instructor.id, // มอบหมายให้ user_t6800008
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
    const response = await fetch(`http://localhost:8080/api/educator/applications/${application.id}?userId=${instructor.id}`);
    const data = await response.json();
    
    console.log('📊 API Response:', {
      status: response.status,
      success: data.success,
      error: data.error,
      applicationId: data.application?.id
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createApplicationForUser();
