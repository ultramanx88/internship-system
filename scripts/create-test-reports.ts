import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestReports() {
  try {
    console.log('Creating test reports...');

    // Get existing applications
    const applications = await prisma.application.findMany({
      take: 3,
      include: {
        student: true,
        internship: {
          include: {
            company: true
          }
        }
      }
    });

    if (applications.length === 0) {
      console.log('No applications found. Please create applications first.');
      return;
    }

    // Get a supervisor user
    const supervisor = await prisma.user.findFirst({
      where: {
        roles: {
          contains: 'visitor'
        }
      }
    });

    if (!supervisor) {
      console.log('No supervisor found. Please create a supervisor user first.');
      return;
    }

    // Create test reports
    for (let i = 0; i < applications.length; i++) {
      const app = applications[i];
      
      const report = await prisma.report.create({
        data: {
          applicationId: app.id,
          studentId: app.studentId,
          supervisorId: supervisor.id,
          title: `รายงานการฝึกงาน - ${app.student.name}`,
          content: `รายงานการฝึกงานของ ${app.student.name} ที่ ${app.internship.company.name}`,
          status: i === 0 ? 'submitted' : i === 1 ? 'reviewed' : 'draft',
          submittedAt: i === 0 ? new Date() : null,
          reviewedAt: i === 1 ? new Date() : null,
        }
      });

      console.log(`Created report: ${report.id} for student: ${app.student.name}`);
    }

    console.log('Test reports created successfully!');
  } catch (error) {
    console.error('Error creating test reports:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestReports();
