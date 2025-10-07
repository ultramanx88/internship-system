const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAcademicYears() {
  try {
    console.log('🌱 Creating academic years...');

    // Check if academic years already exist
    const existingYears = await prisma.academicYear.findMany();
    if (existingYears.length > 0) {
      console.log('✅ Academic years already exist:', existingYears.length);
      return;
    }

    // Create academic years
    const academicYears = [
      {
        id: 'year_2024',
        year: 2024,
        name: 'ปีการศึกษา 2567',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-05-31'),
        isActive: true
      },
      {
        id: 'year_2025',
        year: 2025,
        name: 'ปีการศึกษา 2568',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2026-05-31'),
        isActive: false
      }
    ];

    for (const yearData of academicYears) {
      const academicYear = await prisma.academicYear.create({
        data: yearData
      });
      console.log(`✅ Created: ${academicYear.name}`);

      // Create semesters for each academic year
      const semesters = [
        {
          id: `sem_${yearData.year}_1`,
          name: 'ภาคเรียนที่ 1',
          academicYearId: academicYear.id,
          startDate: new Date(`${yearData.year}-06-01`),
          endDate: new Date(`${yearData.year}-10-31`),
          isActive: yearData.isActive
        },
        {
          id: `sem_${yearData.year}_2`,
          name: 'ภาคเรียนที่ 2',
          academicYearId: academicYear.id,
          startDate: new Date(`${yearData.year}-11-01`),
          endDate: new Date(`${yearData.year + 1}-03-31`),
          isActive: false
        },
        {
          id: `sem_${yearData.year}_3`,
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

    console.log('🎉 Academic years and semesters created successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAcademicYears();
