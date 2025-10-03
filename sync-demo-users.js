const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function syncDemoUsers() {
  try {
    console.log('🔄 Syncing demo users from database...');
    
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
    
    // Convert to demo user format
    const demoUsers = users.map(user => {
      let roles;
      try {
        roles = JSON.parse(user.roles);
      } catch {
        roles = [user.roles];
      }
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        password: "123456",
        roles: roles
      };
    });
    
    // Generate TypeScript code
    const tsCode = `// Auto-generated demo users from database
export const demoUsers = ${JSON.stringify(demoUsers, null, 2)};
`;
    
    fs.writeFileSync('src/lib/demo-users.ts', tsCode);
    console.log('✅ Demo users synced to src/lib/demo-users.ts');
    console.log(`📊 Total users: ${demoUsers.length}`);
    
    // Show summary by role
    const roleCount = {};
    demoUsers.forEach(user => {
      user.roles.forEach(role => {
        roleCount[role] = (roleCount[role] || 0) + 1;
      });
    });
    
    console.log('\n📋 Users by role:');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`  ${role}: ${count} users`);
    });
    
  } catch (error) {
    console.error('❌ Error syncing demo users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncDemoUsers();