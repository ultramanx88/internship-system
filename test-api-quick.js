// Quick API Test
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAPI() {
  console.log('🧪 Testing API Functions...');
  
  try {
    // Test User Settings API
    console.log('📖 Testing User Settings...');
    const user = await prisma.user.findFirst();
    if (user) {
      console.log('✅ Found user:', user.name, '(ID:', user.id + ')');
      
      // Test update
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { phone: '081-999-8888' }
      });
      console.log('✅ Updated user phone:', updated.phone);
    } else {
      console.log('⚠️ No users found');
    }
    
    // Test Academic Data
    console.log('📚 Testing Academic Data...');
    const faculties = await prisma.faculty.findMany({
      include: {
        departments: {
          include: {
            curriculums: {
              include: {
                majors: true
              }
            }
          }
        }
      }
    });
    console.log('✅ Found faculties:', faculties.length);
    
    faculties.forEach(faculty => {
      console.log(`  📋 ${faculty.nameTh} (${faculty.departments.length} departments)`);
    });
    
    console.log('🎉 API Test completed successfully!');
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();