const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listAllUsers() {
  try {
    console.log('📋 รายชื่อผู้ใช้ทั้งหมดในระบบ');
    console.log('=' .repeat(80));
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        roles: true
      },
      orderBy: {
        roles: 'asc'
      }
    });
    
    console.log(`พบผู้ใช้ทั้งหมด: ${users.length} คน\n`);
    
    // จัดกลุ่มตาม role
    const usersByRole = {};
    
    users.forEach(user => {
      let roles;
      try {
        roles = JSON.parse(user.roles);
      } catch {
        roles = [user.roles];
      }
      
      roles.forEach(role => {
        if (!usersByRole[role]) {
          usersByRole[role] = [];
        }
        usersByRole[role].push(user);
      });
    });
    
    // แสดงผลตาม role
    Object.keys(usersByRole).sort().forEach(role => {
      console.log(`\n🏷️  ${role.toUpperCase()} (${usersByRole[role].length} คน)`);
      console.log('-'.repeat(60));
      
      usersByRole[role].forEach(user => {
        console.log(`ID: ${user.id.padEnd(15)} | Email: ${user.email.padEnd(30)} | Name: ${user.name}`);
      });
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('🔑 รหัสผ่านสำหรับทุกคน: 123456');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAllUsers();