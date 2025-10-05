import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createEducatorUser() {
  try {
    console.log('🔐 Creating educator user...');
    
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    // สร้าง user ที่มี role เป็น courseInstructor
    const user = await prisma.user.upsert({
      where: { email: 't6800007@smart-solutions.com' },
      update: {},
      create: {
        id: 'test_instructor_001',
        name: 'อาจารย์ทดสอบ 001',
        email: 't6800007@smart-solutions.com',
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

    console.log('✅ User created successfully:', {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles
    });

    // ทดสอบการ login
    console.log('🧪 Testing login...');
    const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 't6800007@smart-solutions.com',
        password: '123456',
        role: 'courseInstructor'
      })
    });

    const loginData = await loginResponse.json();
    console.log('🔑 Login response:', loginData);

    if (loginResponse.ok) {
      console.log('✅ Login successful!');
      console.log('👤 User data:', loginData.user);
    } else {
      console.log('❌ Login failed:', loginData.message);
    }

  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createEducatorUser();
