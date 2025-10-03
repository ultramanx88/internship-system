const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUserNames() {
  try {
    console.log('🔧 Fixing user names in database...');
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        t_name: true,
        t_surname: true,
        e_name: true,
        e_surname: true
      }
    });
    
    console.log(`Found ${users.length} users to update`);
    
    for (const user of users) {
      // Split name into parts
      const nameParts = user.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Update user with proper name fields
      await prisma.user.update({
        where: { id: user.id },
        data: {
          t_name: user.t_name || firstName,
          t_surname: user.t_surname || lastName,
          e_name: user.e_name || firstName,
          e_surname: user.e_surname || lastName,
          t_title: user.t_title || (user.name.includes('นาย') ? 'นาย' : user.name.includes('นาง') ? 'นาง' : 'นาย'),
          e_title: user.e_title || 'Mr.'
        }
      });
      
      console.log(`✅ Updated: ${user.id} - ${user.name}`);
    }
    
    console.log('\n🎉 All users updated successfully!');
    
    // Show sample of updated data
    console.log('\n📋 Sample updated users:');
    const updatedUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        t_name: true,
        t_surname: true,
        e_name: true,
        e_surname: true
      },
      take: 5
    });
    
    updatedUsers.forEach(user => {
      console.log(`- ${user.id}: Thai: ${user.t_name} ${user.t_surname}, English: ${user.e_name} ${user.e_surname}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing user names:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserNames();