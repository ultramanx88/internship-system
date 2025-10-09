import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAcademicData() {
  try {
    console.log('Seeding academic years and semesters...');

    // Clear existing data first
    await prisma.semester.deleteMany({});
    await prisma.academicYear.deleteMany({});

    // Create academic years and semesters
    const academicYears = [
      {
        year: 2567,
        name: 'ปีการศึกษา 2567',
        startDate: new Date('2024-08-01'),
        endDate: new Date('2025-07-31'),
        isActive: true,
        semesters: [
          {
            name: 'ภาคเรียนที่ 1',
            startDate: new Date('2024-08-05'),
            endDate: new Date('2024-12-06'),
            isActive: true,
          },
          {
            name: 'ภาคเรียนที่ 2',
            startDate: new Date('2025-01-06'),
            endDate: new Date('2025-05-09'),
            isActive: true,
          }
        ]
      },
      {
        year: 2568,
        name: 'ปีการศึกษา 2568',
        startDate: new Date('2025-08-01'),
        endDate: new Date('2026-07-31'),
        isActive: false,
        semesters: [
          {
            name: 'ภาคเรียนที่ 1',
            startDate: new Date('2025-08-05'),
            endDate: new Date('2025-12-06'),
            isActive: false,
          },
          {
            name: 'ภาคเรียนที่ 2',
            startDate: new Date('2026-01-06'),
            endDate: new Date('2026-05-09'),
            isActive: false,
          }
        ]
      }
    ];

    for (const yearData of academicYears) {
      const { semesters, ...yearFields } = yearData;
      
      const academicYear = await prisma.academicYear.create({
        data: yearFields,
      });

      for (const semesterData of semesters) {
        await prisma.semester.create({
          data: {
            ...semesterData,
            academicYearId: academicYear.id,
          },
        });
      }
    }

    console.log('Academic years and semesters seeded successfully!');
  } catch (error) {
    console.error('Error seeding academic data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAcademicData();