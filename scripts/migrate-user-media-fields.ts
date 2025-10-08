#!/usr/bin/env tsx

/**
 * Migration Script: เพิ่มฟิลด์ internshipPhoto1 และ internshipPhoto2
 * สำหรับการเก็บรูปฝึกงาน 2 รูป
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateUserMediaFields() {
  try {
    console.log('🚀 Starting migration: Add internship photo fields...');

    // ตรวจสอบว่าฟิลด์มีอยู่แล้วหรือไม่
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('internshipPhoto1', 'internshipPhoto2')
    ` as any[];

    const existingFields = tableInfo.map((row: any) => row.column_name);
    
    if (existingFields.includes('internshipPhoto1') && existingFields.includes('internshipPhoto2')) {
      console.log('✅ Fields already exist, skipping migration');
      return;
    }

    // เพิ่มฟิลด์ใหม่
    console.log('📝 Adding internship photo fields...');
    
    if (!existingFields.includes('internshipPhoto1')) {
      await prisma.$executeRaw`
        ALTER TABLE users 
        ADD COLUMN "internshipPhoto1" TEXT
      `;
      console.log('✅ Added internshipPhoto1 field');
    }

    if (!existingFields.includes('internshipPhoto2')) {
      await prisma.$executeRaw`
        ALTER TABLE users 
        ADD COLUMN "internshipPhoto2" TEXT
      `;
      console.log('✅ Added internshipPhoto2 field');
    }

    // ตรวจสอบผลลัพธ์
    const updatedTableInfo = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('internshipPhoto1', 'internshipPhoto2')
    ` as any[];

    console.log('📊 Migration completed successfully!');
    console.log('Added fields:', updatedTableInfo.map((row: any) => row.column_name));

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// รัน migration
if (require.main === module) {
  migrateUserMediaFields()
    .then(() => {
      console.log('🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

export { migrateUserMediaFields };
