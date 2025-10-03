const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSettingsAPI() {
  try {
    console.log('🧪 Testing Settings API...');
    
    // Test with a known user ID
    const testUserId = 'test001'; // Test User
    
    console.log(`\n1. Testing database query for user: ${testUserId}`);
    
    const user = await prisma.user.findUnique({
      where: { id: testUserId },
      include: {
        faculty: true,
        department: true,
        curriculum: true,
        major: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found in database');
      return;
    }
    
    console.log('✅ User found in database:');
    console.log('- ID:', user.id);
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Thai Name:', user.t_name);
    console.log('- Thai Surname:', user.t_surname);
    console.log('- English Name:', user.e_name);
    console.log('- English Surname:', user.e_surname);
    console.log('- Phone:', user.phone);
    console.log('- Faculty:', user.faculty?.nameTh);
    console.log('- Department:', user.department?.nameTh);
    
    console.log('\n2. Testing API endpoint...');
    
    // Test API endpoint
    const response = await fetch('http://localhost:3000/api/user/settings', {
      headers: {
        'x-user-id': testUserId
      }
    });
    
    console.log('API Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response Success:');
      console.log('- Success:', data.success);
      console.log('- Thai Name:', data.settings?.thaiName);
      console.log('- Thai Surname:', data.settings?.thaiSurname);
      console.log('- Email:', data.settings?.email);
      console.log('- Phone:', data.settings?.phone);
    } else {
      const errorData = await response.json();
      console.log('❌ API Response Error:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSettingsAPI();