#!/usr/bin/env tsx
// Import data from JSON backup to PostgreSQL database
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function importData(backupFile?: string) {
  console.log('Importing data to database...');

  try {
    let filepath: string;

    if (backupFile) {
      filepath = backupFile;
    } else {
      // Find the latest backup file
      const backupDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) {
        throw new Error('Backup directory not found');
      }

      const backupFiles = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('data-backup-') && file.endsWith('.json'))
        .sort()
        .reverse();

      if (backupFiles.length === 0) {
        throw new Error('No backup files found');
      }

      filepath = path.join(backupDir, backupFiles[0]);
    }

    console.log(`Reading backup: ${filepath}`);

    if (!fs.existsSync(filepath)) {
      throw new Error(`Backup file not found: ${filepath}`);
    }

    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));

    // Import in order (respecting foreign key constraints)
    console.log('Importing Faculties...');
    for (const faculty of data.faculties || []) {
      await prisma.faculty.upsert({
        where: { id: faculty.id },
        update: faculty,
        create: faculty
      });
    }
    console.log(`Imported ${(data.faculties || []).length} faculties}`);

    console.log('Importing Departments...');
    for (const department of data.departments || []) {
      await prisma.department.upsert({
        where: { id: department.id },
        update: department,
        create: department
      });
    }
    console.log(`Imported ${(data.departments || []).length} departments`);

    console.log('Importing Curriculums...');
    for (const curriculum of data.curriculums || []) {
      await prisma.curriculum.upsert({
        where: { id: curriculum.id },
        update: curriculum,
        create: curriculum
      });
    }
    console.log(`Imported ${(data.curriculums || []).length} curriculums`);

    console.log('Importing Majors...');
    for (const major of data.majors || []) {
      await prisma.major.upsert({
        where: { id: major.id },
        update: major,
        create: major
      });
    }
    console.log(`Imported ${(data.majors || []).length} majors}`);

    console.log('Importing Users...');
    for (const user of data.users || []) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }
    console.log(`Imported ${(data.users || []).length} users}`);

    console.log('Importing Companies...');
    for (const company of data.companies || []) {
      await prisma.company.upsert({
        where: { id: company.id },
        update: company,
        create: company
      });
    }
    console.log(`Imported ${(data.companies || []).length} companies}`);

    console.log('Importing Internships...');
    for (const internship of data.internships || []) {
      await prisma.internship.upsert({
        where: { id: internship.id },
        update: internship,
        create: internship
      });
    }
    console.log(`Imported ${(data.internships || []).length} internships}`);

    console.log('Importing Applications...');
    for (const application of data.applications || []) {
      await prisma.application.upsert({
        where: { id: application.id },
        update: application,
        create: application
      });
    }
    console.log(`Imported ${(data.applications || []).length} applications}`);

    console.log('Importing Documents...');
    for (const document of data.documents || []) {
      await prisma.document.upsert({
        where: { id: document.id },
        update: document,
        create: document
      });
    }
    console.log(`Imported ${(data.documents || []).length} documents`);

    console.log('Importing Print Records...');
    for (const printRecord of data.printRecords || []) {
      await prisma.printRecord.upsert({
        where: { id: printRecord.id },
        update: printRecord,
        create: printRecord
      });
    }
    console.log(`Imported ${(data.printRecords || []).length} print records`);

    console.log('Import completed successfully!');

  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  const backupFile = process.argv[2];
  importData(backupFile)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { importData };
