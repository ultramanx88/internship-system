const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserData() {
  try {
    console.log('🔍 Checking user data after fix...');
    
    // Check test user
    const testUser = await prisma.user.findUnique({
      where: { id: 'test001' },
      include: {
        faculty: true,
        department: true,
        curriculum: true,
        major: true
      }
    });
    
    if (testUser) {
      console.log('\n✅ Test User (test001) data:');
      console.log('- Name:', testUser.name);
      console.log('- Thai Title:', testUser.t_title);
      console.log('- Thai Name:', testUser.t_name);
      console.log('- Thai Surname:', testUser.t_surname);
      console.log('- English Title:', testUser.e_title);
      console.log('- English Name:', testUser.e_name);
      console.log('- English Surname:', testUser.e_surname);
      console.log('- Email:', testUser.email);
      console.log('- Phone:', testUser.phone);
      console.log('- Faculty:', testUser.faculty?.nameTh);
      console.log('- Department:', testUser.department?.nameTh);
      console.log('- Curriculum:', testUser.curriculum?.nameTh);
      console.log('- Major:', testUser.major?.nameTh);
    }
    
    // Check admin user
    const adminUser = await prisma.user.findUnique({
      where: { id: 'adminPick' }
    });
    
    if (adminUser) {
      console.log('\n✅ Admin User (adminPick) data:');
      console.log('- Name:', adminUser.name);
      console.log('- Thai Name:', adminUser.t_name);
      console.log('- Thai Surname:', adminUser.t_surname);
      console.log('- English Name:', adminUser.e_name);
      console.log('- English Surname:', adminUser.e_surname);
    }
    
  } catch (error) {
    console.error('❌ Error checking user data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserData();