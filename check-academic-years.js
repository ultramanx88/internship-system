const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
    }
  }
});

async function checkAndSeedAcademicYears() {
  try {
    console.log('Checking academic years...');
    
    // Check existing academic years
    const existingYears = await prisma.academicYear.findMany({
      orderBy: { year: 'desc' }
    });
    
    console.log('Existing academic years:', existingYears);
    
    if (existingYears.length === 0) {
      console.log('No academic years found. Creating sample data...');
      
      // Create sample academic years
      const currentYear = new Date().getFullYear();
      const academicYears = [
        {
          year: currentYear,
          name: `ปีการศึกษา ${currentYear}`,
          isActive: true,
          startDate: new Date(`${currentYear}-06-01`),
          endDate: new Date(`${currentYear + 1}-05-31`)
        },
        {
          year: currentYear - 1,
          name: `ปีการศึกษา ${currentYear - 1}`,
          isActive: false,
          startDate: new Date(`${currentYear - 1}-06-01`),
          endDate: new Date(`${currentYear}-05-31`)
        },
        {
          year: currentYear + 1,
          name: `ปีการศึกษา ${currentYear + 1}`,
          isActive: false,
          startDate: new Date(`${currentYear + 1}-06-01`),
          endDate: new Date(`${currentYear + 2}-05-31`)
        }
      ];
      
      for (const yearData of academicYears) {
        const academicYear = await prisma.academicYear.create({
          data: yearData
        });
        console.log('Created academic year:', academicYear);
        
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
          console.log('Created semester:', semester);
        }
      }
      
      console.log('✅ Sample academic years and semesters created successfully!');
    } else {
      console.log('✅ Academic years already exist.');
    }
    
    // Show final count
    const finalCount = await prisma.academicYear.count();
    const semesterCount = await prisma.semester.count();
    console.log(`Total academic years: ${finalCount}`);
    console.log(`Total semesters: ${semesterCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndSeedAcademicYears();
