import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSpecificUser() {
  try {
    console.log('🔍 Checking user_t6800008...');
    
    // ดูข้อมูล user_t6800008
    const user = await prisma.user.findUnique({
      where: { id: 'user_t6800008' },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        password: true,
        t_title: true,
        t_name: true,
        t_surname: true,
        e_title: true,
        e_name: true,
        e_surname: true,
        phone: true
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('👤 User data:');
    console.log(JSON.stringify(user, null, 2));

    // ตรวจสอบ roles
    console.log('\n🔍 Roles analysis:');
    console.log('- Raw roles:', user.roles);
    console.log('- Type:', typeof user.roles);
    console.log('- Is array:', Array.isArray(user.roles));

    let parsedRoles;
    try {
      parsedRoles = JSON.parse(user.roles);
      console.log('- Parsed roles:', parsedRoles);
      console.log('- Parsed type:', typeof parsedRoles);
      console.log('- Parsed is array:', Array.isArray(parsedRoles));
    } catch (e) {
      console.log('- Parse error:', e.message);
    }

    // ตรวจสอบการ login ด้วย role ที่ถูกต้อง
    console.log('\n🧪 Testing login with correct role...');
    const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: user.email,
        password: '123456',
        role: 'อาจารย์ประจำวิชา' // ใช้ role ที่ตรงกับ roles ในฐานข้อมูล
      })
    });

    const loginData = await loginResponse.json();
    console.log('🔑 Login response:', {
      status: loginResponse.status,
      success: loginResponse.ok,
      message: loginData.message,
      user: loginData.user
    });

    // ตรวจสอบ API call
    if (loginResponse.ok) {
      console.log('\n🧪 Testing API call...');
      const apiResponse = await fetch(`http://localhost:8080/api/educator/coop-requests?userId=${user.id}&page=1&limit=10`);
      const apiData = await apiResponse.json();
      
      console.log('📊 API response:', {
        status: apiResponse.status,
        success: apiData.success,
        error: apiData.error,
        applicationsCount: apiData.applications?.length || 0
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificUser();
