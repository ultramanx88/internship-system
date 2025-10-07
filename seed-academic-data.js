const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAcademicData() {
  try {
    console.log('🌱 Creating academic years and semesters...');

    // Create academic years
    const academicYear2024 = await prisma.academicYear.upsert({
      where: { year: 2024 },
      update: {},
      create: {
        id: 'year_2024',
        year: 2024,
        name: 'ปีการศึกษา 2567',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-05-31'),
        isActive: true
      }
    });

    const academicYear2025 = await prisma.academicYear.upsert({
      where: { year: 2025 },
      update: {},
      create: {
        id: 'year_2025',
        year: 2025,
        name: 'ปีการศึกษา 2568',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2026-05-31'),
        isActive: false
      }
    });

    console.log('✅ Created academic years');

    // Create semesters for 2024
    const semesters2024 = [
      {
        id: 'sem_2024_1',
        name: 'ภาคเรียนที่ 1',
        academicYearId: academicYear2024.id,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-10-31'),
        isActive: true
      },
      {
        id: 'sem_2024_2',
        name: 'ภาคเรียนที่ 2',
        academicYearId: academicYear2024.id,
        startDate: new Date('2024-11-01'),
        endDate: new Date('2025-03-31'),
        isActive: false
      },
      {
        id: 'sem_2024_3',
        name: 'ภาคเรียนฤดูร้อน',
        academicYearId: academicYear2024.id,
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-05-31'),
        isActive: false
      }
    ];

    for (const semester of semesters2024) {
      await prisma.semester.upsert({
        where: { id: semester.id },
        update: {},
        create: semester
      });
    }

    // Create semesters for 2025
    const semesters2025 = [
      {
        id: 'sem_2025_1',
        name: 'ภาคเรียนที่ 1',
        academicYearId: academicYear2025.id,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-10-31'),
        isActive: false
      },
      {
        id: 'sem_2025_2',
        name: 'ภาคเรียนที่ 2',
        academicYearId: academicYear2025.id,
        startDate: new Date('2025-11-01'),
        endDate: new Date('2026-03-31'),
        isActive: false
      },
      {
        id: 'sem_2025_3',
        name: 'ภาคเรียนฤดูร้อน',
        academicYearId: academicYear2025.id,
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-05-31'),
        isActive: false
      }
    ];

    for (const semester of semesters2025) {
      await prisma.semester.upsert({
        where: { id: semester.id },
        update: {},
        create: semester
      });
    }

    console.log('✅ Created semesters');
    console.log('🎉 Academic data created successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAcademicData();
