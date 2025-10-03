// Migration script to move from SQLite to PostgreSQL
import { PrismaClient as SQLitePrismaClient } from '@prisma/client';
import { PrismaClient as PostgreSQLPrismaClient } from '@prisma/client';

// SQLite client (old database)
const sqliteClient = new SQLitePrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

// PostgreSQL client (new database)
const postgresClient = new PostgreSQLPrismaClient();

async function migrateData() {
  console.log('🚀 Starting migration from SQLite to PostgreSQL...');
  
  try {
    // 1. Migrate Faculties
    console.log('📚 Migrating Faculties...');
    const faculties = await sqliteClient.faculty.findMany();
    for (const faculty of faculties) {
      await postgresClient.faculty.upsert({
        where: { id: faculty.id },
        update: faculty,
        create: faculty
      });
    }
    console.log(`✅ Migrated ${faculties.length} faculties`);

    // 2. Migrate Departments
    console.log('🏢 Migrating Departments...');
    const departments = await sqliteClient.department.findMany();
    for (const department of departments) {
      await postgresClient.department.upsert({
        where: { id: department.id },
        update: department,
        create: department
      });
    }
    console.log(`✅ Migrated ${departments.length} departments`);

    // 3. Migrate Curriculums
    console.log('📖 Migrating Curriculums...');
    const curriculums = await sqliteClient.curriculum.findMany();
    for (const curriculum of curriculums) {
      await postgresClient.curriculum.upsert({
        where: { id: curriculum.id },
        update: curriculum,
        create: curriculum
      });
    }
    console.log(`✅ Migrated ${curriculums.length} curriculums`);

    // 4. Migrate Majors
    console.log('🎓 Migrating Majors...');
    const majors = await sqliteClient.major.findMany();
    for (const major of majors) {
      await postgresClient.major.upsert({
        where: { id: major.id },
        update: major,
        create: major
      });
    }
    console.log(`✅ Migrated ${majors.length} majors`);

    // 5. Migrate Users
    console.log('👥 Migrating Users...');
    const users = await sqliteClient.user.findMany();
    for (const user of users) {
      await postgresClient.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }
    console.log(`✅ Migrated ${users.length} users`);

    // 6. Migrate Companies
    console.log('🏭 Migrating Companies...');
    const companies = await sqliteClient.company.findMany();
    for (const company of companies) {
      await postgresClient.company.upsert({
        where: { id: company.id },
        update: company,
        create: company
      });
    }
    console.log(`✅ Migrated ${companies.length} companies`);

    // 7. Migrate Internships
    console.log('💼 Migrating Internships...');
    const internships = await sqliteClient.internship.findMany();
    for (const internship of internships) {
      await postgresClient.internship.upsert({
        where: { id: internship.id },
        update: internship,
        create: internship
      });
    }
    console.log(`✅ Migrated ${internships.length} internships`);

    // 8. Migrate Applications
    console.log('📝 Migrating Applications...');
    const applications = await sqliteClient.application.findMany();
    for (const application of applications) {
      await postgresClient.application.upsert({
        where: { id: application.id },
        update: application,
        create: application
      });
    }
    console.log(`✅ Migrated ${applications.length} applications`);

    // 9. Migrate Documents
    console.log('📄 Migrating Documents...');
    const documents = await sqliteClient.document.findMany();
    for (const document of documents) {
      await postgresClient.document.upsert({
        where: { id: document.id },
        update: document,
        create: document
      });
    }
    console.log(`✅ Migrated ${documents.length} documents`);

    // 10. Migrate Print Records
    console.log('🖨️ Migrating Print Records...');
    const printRecords = await sqliteClient.printRecord.findMany();
    for (const printRecord of printRecords) {
      await postgresClient.printRecord.upsert({
        where: { id: printRecord.id },
        update: printRecord,
        create: printRecord
      });
    }
    console.log(`✅ Migrated ${printRecords.length} print records`);

    console.log('🎉 Migration completed successfully!');
    
    // Verify migration
    console.log('\n📊 Verification:');
    const postgresStats = {
      faculties: await postgresClient.faculty.count(),
      departments: await postgresClient.department.count(),
      curriculums: await postgresClient.curriculum.count(),
      majors: await postgresClient.major.count(),
      users: await postgresClient.user.count(),
      companies: await postgresClient.company.count(),
      internships: await postgresClient.internship.count(),
      applications: await postgresClient.application.count(),
      documents: await postgresClient.document.count(),
      printRecords: await postgresClient.printRecord.count()
    };
    
    console.table(postgresStats);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

// Backup function
async function backupSQLiteData() {
  console.log('💾 Creating backup of SQLite data...');
  
  try {
    const allData = {
      faculties: await sqliteClient.faculty.findMany(),
      departments: await sqliteClient.department.findMany(),
      curriculums: await sqliteClient.curriculum.findMany(),
      majors: await sqliteClient.major.findMany(),
      users: await sqliteClient.user.findMany(),
      companies: await sqliteClient.company.findMany(),
      internships: await sqliteClient.internship.findMany(),
      applications: await sqliteClient.application.findMany(),
      documents: await sqliteClient.document.findMany(),
      printRecords: await sqliteClient.printRecord.findMany()
    };
    
    const fs = require('fs');
    const backupPath = `./backup-sqlite-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(backupPath, JSON.stringify(allData, null, 2));
    
    console.log(`✅ Backup created: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'backup':
      await backupSQLiteData();
      break;
    case 'migrate':
      await migrateData();
      break;
    case 'full':
      await backupSQLiteData();
      await migrateData();
      break;
    default:
      console.log('Usage:');
      console.log('  npm run migrate:backup  - Create backup only');
      console.log('  npm run migrate:run     - Run migration only');
      console.log('  npm run migrate:full    - Backup and migrate');
      break;
  }
}

main().catch(console.error);