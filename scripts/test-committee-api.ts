import prisma from '../src/lib/prisma';

async function testCommitteeAPI() {
  try {
    console.log('🧪 Testing Committee API...');

    // ทดสอบดึงข้อมูลกรรมการ
    const committees = await prisma.committee.findMany({
      where: {
        academicYear: '2567',
        semester: '1',
        isActive: true
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('✅ Committees found:', committees.length);
    committees.forEach(committee => {
      console.log(`- ${committee.name} (${committee.academicYear}/${committee.semester})`);
      console.log(`  Members: ${committee.members.length}`);
      committee.members.forEach(member => {
        console.log(`    - ${member.user.name} (${member.role})`);
      });
    });

    console.log('🎉 Committee API test successful!');

  } catch (error) {
    console.error('❌ Error testing committee API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCommitteeAPI();
