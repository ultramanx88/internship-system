const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // ลองดึงข้อมูล users
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected successfully! Found ${userCount} users.`);
    
    // ลองดึงข้อมูล faculties
    const facultyCount = await prisma.faculty.count();
    console.log(`📚 Found ${facultyCount} faculties.`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();