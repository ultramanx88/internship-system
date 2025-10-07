const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

async function createSampleData() {
  try {
    console.log('🌱 Creating sample data...');

    // Check if data already exists
    const existingYears = await prisma.academicYear.findMany();
    if (existingYears.length > 0) {
      console.log('✅ Data already exists:', existingYears.length, 'academic years');
      return;
    }

    // Create academic years
    const academicYears = [
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

    console.log('📅 Creating academic years...');
    for (const yearData of academicYears) {
      const academicYear = await prisma.academicYear.create({
        data: yearData
      });
      console.log(`✅ Created: ${academicYear.name}`);

      // Create semesters for each academic year
      const semesters = [
        {
          name: 'ภาคเรียนที่ 1',
          academicYearId: academicYear.id,
          startDate: new Date(`${yearData.year}-06-01`),
          endDate: new Date(`${yearData.year}-10-31`),
          isActive: yearData.isActive
        },
        {
          name: 'ภาคเรียนที่ 2',
          academicYearId: academicYear.id,
          startDate: new Date(`${yearData.year}-11-01`),
          endDate: new Date(`${yearData.year + 1}-03-31`),
          isActive: false
        },
        {
          name: 'ภาคเรียนฤดูร้อน',
          academicYearId: academicYear.id,
          startDate: new Date(`${yearData.year + 1}-04-01`),
          endDate: new Date(`${yearData.year + 1}-05-31`),
          isActive: false
        }
      ];

      for (const semesterData of semesters) {
        const semester = await prisma.semester.create({
          data: semesterData
        });
        console.log(`  ✅ Created semester: ${semester.name}`);
      }
    }

    // Create a sample admin user
    const existingUser = await prisma.user.findFirst({
      where: { email: 'admin@example.com' }
    });

    if (!existingUser) {
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          name: 'Admin User',
          password: 'admin123',
          roles: JSON.stringify(['admin']),
          isActive: true
        }
      });
      console.log('✅ Created admin user:', adminUser.email);
    }

    console.log('🎉 Sample data created successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleData();
