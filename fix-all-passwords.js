const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixAllPasswords() {
  try {
    console.log('🔧 Fixing ALL user passwords...');
    
    // สร้าง hash ใหม่สำหรับ password "123456"
    const newHashedPassword = await bcrypt.hash('123456', 10);
    console.log('🔑 New password hash created');
    
    // อัพเดท password สำหรับ users ทั้งหมด
    const result = await prisma.user.updateMany({
      data: {
        password: newHashedPassword
      }
    });
    
    console.log(`✅ Updated passwords for ${result.count} users`);
    
    // ทดสอบ login กับ user ตัวอย่าง
    console.log('\n🧪 Testing login with sample users...');
    
    const testUsers = ['u6800001', 'test001', 'admin@smart-solutions.com'];
    
    for (const identifier of testUsers) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { id: identifier },
            { email: identifier }
          ]
        }
      });
      
      if (user) {
        const isValid = await bcrypt.compare('123456', user.password);
        console.log(`${isValid ? '✅' : '❌'} ${user.id} (${user.email}): ${isValid ? 'Password OK' : 'Password FAILED'}`);
      }
    }
    
    console.log('\n🎉 All passwords fixed! Everyone can now login with password: 123456');
    
  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllPasswords();