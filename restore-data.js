const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function restoreData() {
  try {
    console.log('Loading backup data...');
    const backupData = JSON.parse(fs.readFileSync('./backups/data-backup-2025-10-09_02-22-57.json', 'utf8'));
    
    console.log('Restoring faculties...');
    for (const faculty of backupData.faculties || []) {
      await prisma.faculty.upsert({
        where: { id: faculty.id },
        update: faculty,
        create: faculty
      });
    }
    
    console.log('Restoring departments...');
    for (const department of backupData.departments || []) {
      await prisma.department.upsert({
        where: { id: department.id },
        update: department,
        create: department
      });
    }
    
    console.log('Restoring curriculums...');
    for (const curriculum of backupData.curriculums || []) {
      await prisma.curriculum.upsert({
        where: { id: curriculum.id },
        update: curriculum,
        create: curriculum
      });
    }
    
    console.log('Restoring majors...');
    for (const major of backupData.majors || []) {
      await prisma.major.upsert({
        where: { id: major.id },
        update: major,
        create: major
      });
    }
    
    console.log('Restoring users...');
    for (const user of backupData.users || []) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }
    
    console.log('Restoring companies...');
    for (const company of backupData.companies || []) {
      await prisma.company.upsert({
        where: { id: company.id },
        update: company,
        create: company
      });
    }
    
    console.log('Restoring internships...');
    for (const internship of backupData.internships || []) {
      await prisma.internship.upsert({
        where: { id: internship.id },
        update: internship,
        create: internship
      });
    }
    
    console.log('Restoring applications...');
    for (const application of backupData.applications || []) {
      try {
        await prisma.application.upsert({
          where: { id: application.id },
          update: application,
          create: application
        });
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`Skipping duplicate application: ${application.id}`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('Data restoration completed successfully!');
    
  } catch (error) {
    console.error('Error restoring data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreData();
