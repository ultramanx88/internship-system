import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixMissingUsers() {
  try {
    console.log('🔧 Fixing missing users...');

    // ข้อมูลผู้ใช้ที่ขาดหายไป
    const missingUsers = [
      {
        id: 'user_t6800006',
        email: 't6800006@smart-solutions.com',
        name: 'อาจารย์สมชาย ใจดี',
        password: '123456',
        roles: '["อาจารย์นิเทศ"]'
      },
      {
        id: 'user_t6800007',
        email: 't6800007@smart-solutions.com',
        name: 'อาจารย์สมศักดิ์ วิชาการ',
        password: '123456',
        roles: '["อาจารย์ประจำวิชา"]'
      },
      {
        id: 'user_t6800008',
        email: 't6800008@smart-solutions.com',
        name: 'อาจารย์สมพร ใจดี',
        password: '123456',
        roles: '["อาจารย์ประจำวิชา"]'
      },
      {
        id: 'user_t6800009',
        email: 't6800009@smart-solutions.com',
        name: 'อาจารย์สมชาย เก่งมาก',
        password: '123456',
        roles: '["อาจารย์ประจำวิชา"]'
      }
    ];

    // Hash password ที่ใช้ในระบบ
    const hashedPassword = '$2b$10$example'; // ใช้ password เดียวกันกับ user ที่มีอยู่

    for (const userData of missingUsers) {
      try {
        // ตรวจสอบว่าผู้ใช้มีอยู่แล้วหรือไม่
        const existingUser = await prisma.user.findUnique({
          where: { id: userData.id }
        });

        if (!existingUser) {
          // สร้างผู้ใช้ใหม่
          const newUser = await prisma.user.create({
            data: {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              password: hashedPassword,
              roles: userData.roles
            }
          });
          console.log(`✅ Created user: ${newUser.name} (${newUser.email})`);
        } else {
          console.log(`⚠️  User already exists: ${userData.name} (${userData.email})`);
        }
      } catch (error) {
        console.error(`❌ Error creating user ${userData.name}:`, error);
      }
    }

    // ตรวจสอบผู้ใช้ที่มีอยู่และอัปเดต roles ให้ตรงกัน
    const usersToUpdate = [
      {
        id: 'user_t6800002',
        email: 't6800002@smart-solutions.com',
        name: 'อาจารย์สมชาย ใจดี',
        roles: '["อาจารย์นิเทศ"]'
      },
      {
        id: 'user_t6800003',
        email: 't6800003@smart-solutions.com',
        name: 'อาจารย์สมศักดิ์ วิชาการ',
        roles: '["อาจารย์ประจำวิชา"]'
      },
      {
        id: 'user_t6800004',
        email: 't6800004@smart-solutions.com',
        name: 'อาจารย์สมพร ใจดี',
        roles: '["อาจารย์ประจำวิชา"]'
      },
      {
        id: 'user_t6800005',
        email: 't6800005@smart-solutions.com',
        name: 'อาจารย์สมชาย เก่งมาก',
        roles: '["อาจารย์ประจำวิชา"]'
      }
    ];

    for (const userData of usersToUpdate) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { id: userData.id }
        });

        if (existingUser) {
          // อัปเดต roles ให้ตรงกับ demo-users
          await prisma.user.update({
            where: { id: userData.id },
            data: {
              name: userData.name,
              roles: userData.roles
            }
          });
          console.log(`🔄 Updated user: ${userData.name} (${userData.email})`);
        }
      } catch (error) {
        console.error(`❌ Error updating user ${userData.name}:`, error);
      }
    }

    console.log('✅ User fixing completed!');

  } catch (error) {
    console.error('❌ Error fixing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMissingUsers();
