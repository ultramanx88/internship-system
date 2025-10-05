import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixPasswords() {
  try {
    console.log('🔧 Fixing passwords...');

    // หา password ที่ทำงานได้จาก user ที่มีอยู่
    const workingUser = await prisma.user.findFirst({
      where: {
        email: 't6800001@smart-solutions.com'
      }
    });

    if (!workingUser) {
      console.log('❌ No working user found');
      return;
    }

    console.log(`✅ Found working user: ${workingUser.name}`);
    console.log(`🔑 Using password hash: ${workingUser.password}`);

    // อัปเดต password สำหรับผู้ใช้ใหม่
    const usersToUpdate = [
      'user_t6800006',
      'user_t6800007', 
      'user_t6800008',
      'user_t6800009'
    ];

    for (const userId of usersToUpdate) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: {
            password: workingUser.password
          }
        });
        console.log(`✅ Updated password for user: ${userId}`);
      } catch (error) {
        console.error(`❌ Error updating password for ${userId}:`, error);
      }
    }

    console.log('✅ Password fixing completed!');

  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPasswords();
