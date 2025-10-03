const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('🔍 Testing login functionality...');
    
    const email = 'admin@smart-solutions.com';
    const password = '123456';
    
    // ค้นหา user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.name, user.email);
    console.log('🔑 Stored password hash:', user.password);
    
    // ตรวจสอบ password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('🔐 Password valid:', isValidPassword);
    
    if (isValidPassword) {
      console.log('✅ Login successful!');
      console.log('👤 User roles:', user.roles);
    } else {
      console.log('❌ Invalid password');
    }
    
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();