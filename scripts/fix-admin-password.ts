import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixAdminPassword() {
  try {
    console.log('🔧 Fixing admin password...');
    
    // Hash the correct password
    const correctPassword = '123456';
    const hashedPassword = await bcrypt.hash(correctPassword, 10);
    
    // Update admin user password
    const adminUser = await prisma.user.update({
      where: {
        email: 'ultramanx88@gmail.com'
      },
      data: {
        password: hashedPassword
      }
    });
    
    console.log(`✅ Updated password for: ${adminUser.name}`);
    
    // Test the new password
    const isValid = await bcrypt.compare(correctPassword, hashedPassword);
    console.log(`🔐 Password test: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    
    // Also fix other common admin accounts if they exist
    const commonAdminEmails = [
      'admin@example.com',
      'admin@test.com',
      'admin@smart-solutions.com'
    ];
    
    for (const email of commonAdminEmails) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.user.update({
          where: { email },
          data: { password: hashedPassword }
        });
        console.log(`✅ Updated password for: ${user.name} (${email})`);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to fix password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminPassword();