// Test API directly without server
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testDirectLogin() {
  try {
    console.log('🧪 Testing direct login logic...');
    
    const identifier = 'admin@smart-solutions.com';
    const password = '123456';
    const role = 'admin';
    
    console.log('1. Searching for user...');
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { email: identifier }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        roles: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.name, user.email);
    
    console.log('2. Checking password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔐 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return;
    }
    
    console.log('3. Parsing roles...');
    let userRoles;
    try {
      userRoles = JSON.parse(user.roles);
      console.log('👤 User roles:', userRoles);
    } catch (roleError) {
      console.error('❌ Failed to parse roles:', user.roles, roleError);
      return;
    }
    
    console.log('4. Checking role access...');
    if (!userRoles.includes(role)) {
      console.log('❌ Role not allowed:', role, 'not in', userRoles);
      return;
    }
    
    console.log('✅ Login successful!');
    console.log('User data:', {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: userRoles,
      currentRole: role
    });
    
  } catch (error) {
    console.error('❌ Direct login test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDirectLogin();