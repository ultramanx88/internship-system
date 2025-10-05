import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserRoles() {
  try {
    console.log('🔍 Checking user roles...');
    
    // ดูข้อมูล user ทั้งหมดที่มี courseInstructor
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { roles: { contains: 'courseInstructor' } },
          { roles: { contains: 'อาจารย์ประจำวิชา' } },
          { roles: { contains: 'instructor' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true
      }
    });

    console.log('👥 Users with instructor roles:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}): ${user.roles}`);
    });

    // ดูข้อมูล user ที่มี email t6800001@smart-solutions.com
    const specificUser = await prisma.user.findUnique({
      where: { email: 't6800001@smart-solutions.com' },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true
      }
    });

    console.log('\n🎯 Specific user (t6800001@smart-solutions.com):');
    if (specificUser) {
      console.log(JSON.stringify(specificUser, null, 2));
    } else {
      console.log('❌ User not found');
    }

    // สร้าง user ใหม่ที่มี role ถูกต้อง
    console.log('\n🔧 Creating new user with correct role...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    const newUser = await prisma.user.upsert({
      where: { email: 'instructor.test@smart-solutions.com' },
      update: {
        roles: '["courseInstructor"]'
      },
      create: {
        id: 'instructor_test_001',
        name: 'อาจารย์ทดสอบ 001',
        email: 'instructor.test@smart-solutions.com',
        password: hashedPassword,
        roles: '["courseInstructor"]',
        t_title: 'อาจารย์',
        t_name: 'ทดสอบ',
        t_surname: '001',
        e_title: 'Dr.',
        e_name: 'Test',
        e_surname: 'Instructor',
        phone: '02-123-4567'
      }
    });

    console.log('✅ New user created:', {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      roles: newUser.roles
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRoles();
