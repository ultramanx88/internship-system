import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkApplication() {
  try {
    console.log('🔍 Checking applications...');
    
    // ดูข้อมูล applications ทั้งหมด
    const applications = await prisma.application.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        internship: {
          include: {
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        courseInstructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('📋 All applications:');
    applications.forEach(app => {
      console.log(`- ID: ${app.id}`);
      console.log(`  Student: ${app.student.name} (${app.student.email})`);
      console.log(`  Company: ${app.internship.company.name}`);
      console.log(`  Instructor: ${app.courseInstructor?.name || 'None'} (${app.courseInstructor?.id || 'None'})`);
      console.log(`  Status: ${app.status}`);
      console.log('---');
    });

    // ตรวจสอบ application ID ที่ใช้
    const specificApp = await prisma.application.findUnique({
      where: { id: 'cmgcxlfmt0001xpn7ldnsm92q' },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        internship: {
          include: {
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        courseInstructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('\n🎯 Specific application (cmgcxlfmt0001xpn7ldnsm92q):');
    if (specificApp) {
      console.log(JSON.stringify(specificApp, null, 2));
    } else {
      console.log('❌ Application not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkApplication();
