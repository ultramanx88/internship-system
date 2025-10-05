import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createApprovedApplications() {
  try {
    console.log('🚀 Creating approved applications...');

    // สร้าง applications ที่มี status approved
    const applications = [
      {
        id: 'approved_app_001',
        studentId: 'student_for_instructor_001',
        internshipId: 'int_for_instructor_001',
        courseInstructorId: 'instructor_test_001',
        status: 'approved',
        dateApplied: new Date('2025-10-05'),
        feedback: null
      },
      {
        id: 'approved_app_002',
        studentId: 'student_for_instructor_001',
        internshipId: 'int_for_instructor_001',
        courseInstructorId: 'instructor_test_001',
        status: 'approved',
        dateApplied: new Date('2025-10-04'),
        feedback: null
      },
      {
        id: 'approved_app_003',
        studentId: 'student_for_instructor_001',
        internshipId: 'int_for_instructor_001',
        courseInstructorId: 'instructor_test_001',
        status: 'approved',
        dateApplied: new Date('2025-10-03'),
        feedback: null
      }
    ];

    for (const app of applications) {
      try {
        await prisma.application.create({
          data: app
        });
        console.log(`✅ Created approved application: ${app.id}`);
      } catch (error) {
        console.log(`⚠️ Application ${app.id} might already exist`);
      }
    }

    console.log('🎉 All approved applications created successfully!');

  } catch (error) {
    console.error('❌ Error creating approved applications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createApprovedApplications();
