const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addSomchai() {
  try {
    console.log('😊 Adding สมชาย ใจดี to the system...');
    
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const somchai = await prisma.user.upsert({
      where: { id: '65010999' },
      update: {},
      create: {
        id: '65010999',
        name: 'นายสมชาย ใจดี',
        email: 'somchai.jaidee@student.university.ac.th',
        password: hashedPassword,
        roles: '["student"]',
        t_title: 'นาย',
        t_name: 'สมชาย',
        t_surname: 'ใจดี',
        e_title: 'Mr.',
        e_name: 'Somchai',
        e_surname: 'Jaidee',
        phone: '081-234-5678',
        facultyId: 'faculty-1',
        departmentId: 'dept-1',
        curriculumId: 'curr-1',
        majorId: 'major-1',
        studentYear: 4,
        skills: 'React, TypeScript, Node.js, ใจดีมาก',
        statement: 'นักศึกษาที่มีใจรักในการเรียนรู้และพัฒนาตนเอง พร้อมที่จะนำความรู้ไปใช้ในการทำงานจริง',
        nationality: 'ไทย',
        campus: 'วิทยาเขตหลัก',
        gpa: '3.75'
      }
    });
    
    console.log('✅ สมชาย ใจดี has been added to the system!');
    console.log('📋 Details:');
    console.log('- ID:', somchai.id);
    console.log('- Name:', somchai.name);
    console.log('- Email:', somchai.email);
    console.log('- Thai Name:', somchai.t_name, somchai.t_surname);
    console.log('- English Name:', somchai.e_name, somchai.e_surname);
    console.log('- Phone:', somchai.phone);
    console.log('- Skills:', somchai.skills);
    
    console.log('\n🔑 Login credentials:');
    console.log('- Email: somchai.jaidee@student.university.ac.th');
    console.log('- Password: 123456');
    
  } catch (error) {
    console.error('❌ Error adding สมชาย:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSomchai();