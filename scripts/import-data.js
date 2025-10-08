#!/usr/bin/env node
// Import data from JSON backup to PostgreSQL database (no dev deps required)
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const argPath = process.argv[2];
    let filepath;

    if (argPath) {
      filepath = argPath;
    } else {
      const backupDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) {
        throw new Error('Backup directory not found');
      }
      const backupFiles = fs
        .readdirSync(backupDir)
        .filter((f) => f.startsWith('data-backup-') && f.endsWith('.json'))
        .sort()
        .reverse();
      if (backupFiles.length === 0) {
        throw new Error('No backup files found');
      }
      filepath = path.join(backupDir, backupFiles[0]);
    }

    if (!fs.existsSync(filepath)) {
      throw new Error(`Backup file not found: ${filepath}`);
    }

    console.log(`Reading backup: ${filepath}`);
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));

    const upsertAll = async (items, model) => {
      for (const item of items || []) {
        // Remove Prisma read-only fields if necessary
        const { createdAt, updatedAt, ...rest } = item;
        await prisma[model].upsert({
          where: { id: item.id },
          update: rest,
          create: rest,
        });
      }
    };

    console.log('Importing Faculties...');
    await upsertAll(data.faculties, 'faculty');

    console.log('Importing Departments...');
    await upsertAll(data.departments, 'department');

    console.log('Importing Curriculums...');
    await upsertAll(data.curriculums, 'curriculum');

    console.log('Importing Majors...');
    await upsertAll(data.majors, 'major');

    console.log('Importing Users...');
    await upsertAll(data.users, 'user');

    console.log('Importing Companies...');
    await upsertAll(data.companies, 'company');

    console.log('Importing Internships...');
    await upsertAll(data.internships, 'internship');

    console.log('Importing Applications...');
    await upsertAll(data.applications, 'application');

    console.log('Importing Documents...');
    await upsertAll(data.documents, 'document');

    console.log('Importing Print Records...');
    await upsertAll(data.printRecords, 'printRecord');

    console.log('Import completed successfully!');
  } catch (err) {
    console.error('Import failed:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();


