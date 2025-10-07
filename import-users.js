const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function importUsers() {
  try {
    const users = JSON.parse(fs.readFileSync('users-export.json', 'utf8'));
    
    console.log('📥 Importing', users.length, 'users...');
    
    for (const user of users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }
    
    console.log('✅ Successfully imported', users.length, 'users');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importUsers();
