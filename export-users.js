const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        roles: true,
        t_title: true,
        t_name: true,
        t_middle_name: true,
        t_surname: true,
        e_title: true,
        e_name: true,
        e_middle_name: true,
        e_surname: true,
        facultyId: true,
        departmentId: true,
        curriculumId: true,
        majorId: true,
        studentYear: true,
        phone: true,
        campus: true,
        gpa: true,
        nationality: true,
        passportId: true,
        visaType: true,
        profileImage: true,
        notifyEmail: true,
        notifyPush: true,
        notifySms: true,
        notifyAppUpdates: true,
        notifyDeadlines: true,
        notifyNews: true,
        language: true,
        theme: true,
        dateFormat: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    fs.writeFileSync('users-export.json', JSON.stringify(users, null, 2));
    console.log('✅ Exported', users.length, 'users to users-export.json');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportUsers();
