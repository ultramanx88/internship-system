const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSomchaiData() {
  try {
    console.log('🔍 ตรวจสอบข้อมูลของสมชายในฐานข้อมูล...');
    
    // ค้นหาข้อมูลของสมชาย
    const somchai = await prisma.user.findUnique({
      where: { id: '65010999' },
      include: {
        faculty: true,
        department: true,
        curriculum: true,
        major: true
      }
    });
    
    if (somchai) {
      console.log('\n✅ ข้อมูลของสมชาย:');
      console.log('- ID:', somchai.id);
      console.log('- Name:', somchai.name);
      console.log('- Thai Title:', somchai.t_title);
      console.log('- Thai Name:', somchai.t_name);
      console.log('- Thai Surname:', somchai.t_surname);
      console.log('- English Title:', somchai.e_title);
      console.log('- English Name:', somchai.e_name);
      console.log('- English Surname:', somchai.e_surname);
      console.log('- Email:', somchai.email);
      console.log('- Phone:', somchai.phone);
      console.log('- Faculty:', somchai.faculty?.nameTh);
      console.log('- Department:', somchai.department?.nameTh);
      console.log('- Curriculum:', somchai.curriculum?.nameTh);
      console.log('- Major:', somchai.major?.nameTh);
      console.log('- Campus:', somchai.campus);
      console.log('- GPA:', somchai.gpa);
      console.log('- Skills:', somchai.skills);
      console.log('- Statement:', somchai.statement);
    } else {
      console.log('\n❌ ไม่พบข้อมูลของสมชายในฐานข้อมูล');
    }
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการตรวจสอบข้อมูล:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSomchaiData();