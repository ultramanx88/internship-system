import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSupervisor() {
  try {
    console.log('🚀 Creating supervisor...');

    // สร้างอาจารย์นิเทศ
    const supervisor = await prisma.user.create({
      data: {
        id: 'supervisor_test_001',
        name: 'อาจารย์นิเทศ ใจดี',
        email: 'supervisor.test@university.ac.th',
        phone: '080-123-4567',
        password: await bcrypt.hash('password123', 10),
        roles: '["อาจารย์นิเทศ"]'
      }
    });

    console.log('✅ Supervisor created:', supervisor);

    // สร้างอาจารย์นิเทศเพิ่มเติม
    const supervisor2 = await prisma.user.create({
      data: {
        id: 'supervisor_test_002',
        name: 'อาจารย์นิเทศ เก่งมาก',
        email: 'supervisor2.test@university.ac.th',
        phone: '080-234-5678',
        password: await bcrypt.hash('password123', 10),
        roles: '["อาจารย์นิเทศ"]'
      }
    });

    console.log('✅ Supervisor 2 created:', supervisor2);

    console.log('🎉 All supervisors created successfully!');

  } catch (error) {
    console.error('❌ Error creating supervisor:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSupervisor();
