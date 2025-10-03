const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixPasswords() {
  try {
    console.log('🔧 Fixing user passwords...');
    
    // สร้าง hash ใหม่สำหรับ password "123456"
    const newHashedPassword = await bcrypt.hash('123456', 10);
    console.log('🔑 New password hash:', newHashedPassword);
    
    // อัพเดท password สำหรับ admin users
    const adminEmails = [
      'admin@smart-solutions.com',
      'ultramanx88@gmail.com', 
      'admin@university.ac.th'
    ];
    
    for (const email of adminEmails) {
      await prisma.user.update({
        where: { email },
        data: { password: newHashedPassword }
      });
      console.log(`✅ Updated password for ${email}`);
    }
    
    // ทดสอบ login
    const testUser = await prisma.user.findUnique({
      where: { email: 'admin@smart-solutions.com' }
    });
    
    const isValid = await bcrypt.compare('123456', testUser.password);
    console.log('🔐 Password test result:', isValid);
    
    console.log('✅ All passwords fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing passwords:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixPasswords();