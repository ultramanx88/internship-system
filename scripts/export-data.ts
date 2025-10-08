#!/usr/bin/env tsx
// Export all data from PostgreSQL database to JSON
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportData() {
  console.log(' Exporting data from database...');
  
  try {
    const data = {
      faculties: await prisma.faculty.findMany(),
      departments: await prisma.department.findMany(),
      curriculums: await prisma.curriculum.findMany(),
      majors: await prisma.major.findMany(),
      users: await prisma.user.findMany(),
      companies: await prisma.company.findMany(),
      internships: await prisma.internship.findMany(),
      applications: await prisma.application.findMany(),
      documents: await prisma.document.findMany(),
      printRecords: await prisma.printRecord.findMany(),
    };

    // Create backup directory if not exists
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_').substring(0, 19);
    const filename = `data-backup-${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    // Write to file
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

    console.log('Data exported successfully!');
    console.log(`File: ${filepath}`);
    console.log('\nExport Summary:');
    console.log(`   Faculties: ${data.faculties.length}`);
    console.log(`   Departments: ${data.departments.length}`);
    console.log(`   Curriculums: ${data.curriculums.length}`);
    console.log(`   Majors: ${data.majors.length}`);
    console.log(`   Users: ${data.users.length}`);
    console.log(`   Companies: ${data.companies.length}`);
    console.log(`   Internships: ${data.internships.length}`);
    console.log(`   Applications: ${data.applications.length}`);
    console.log(`   Documents: ${data.documents.length}`);
    console.log(`   Print Records: ${data.printRecords.length}`);

    return filepath;
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  exportData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { exportData };
