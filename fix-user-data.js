// Fix user data to have proper Thai names and academic info
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUserData() {
  console.log('🔧 Fixing user data...');
  
  try {
    // 1. Update student users with Thai names and academic info
    console.log('👨‍🎓 Updating student users...');
    
    const students = await prisma.user.findMany({
      where: {
        roles: {
          contains: 'student'
        }
      }
    });
    
    console.log(`Found ${students.length} student users`);
    
    // Get faculty and department IDs
    const faculty = await prisma.faculty.findFirst({
      where: { nameTh: { contains: 'วิทยาศาสตร์' } }
    });
    
    const department = await prisma.department.findFirst({
      where: { nameTh: { contains: 'เทคโนโลยี' } }
    });
    
    const curriculum = await prisma.curriculum.findFirst({
      where: { nameTh: { contains: 'เทคโนโลยี' } }
    });
    
    const major = await prisma.major.findFirst({
      where: { nameTh: { contains: 'เทคโนโลยี' } }
    });
    
    console.log('Academic data found:');
    console.log('  Faculty:', faculty?.nameTh || 'NOT FOUND');
    console.log('  Department:', department?.nameTh || 'NOT FOUND');
    console.log('  Curriculum:', curriculum?.nameTh || 'NOT FOUND');
    console.log('  Major:', major?.nameTh || 'NOT FOUND');
    
    // Update each student
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      // Generate Thai name based on existing name or ID
      let thaiName = 'นักศึกษา';
      let thaiSurname = 'ทดสอบ';
      let englishName = 'Student';
      let englishSurname = 'Test';
      
      if (student.name.includes('Student')) {
        const number = student.name.match(/\d+/)?.[0] || (i + 1).toString().padStart(3, '0');
        thaiName = `นักศึกษา`;
        thaiSurname = `ทดสอบ${number}`;
        englishName = 'Student';
        englishSurname = `Test${number}`;
      } else if (student.id.includes('u68')) {
        const number = student.id.replace('u68', '');
        thaiName = `นักศึกษา`;
        thaiSurname = `รหัส${number}`;
        englishName = 'Student';
        englishSurname = `ID${number}`;
      } else {
        // Use existing name if available
        const nameParts = student.name.split(' ');
        englishName = nameParts[0] || 'Student';
        englishSurname = nameParts.slice(1).join(' ') || 'Test';
        thaiName = 'นักศึกษา';
        thaiSurname = 'ทดสอบ';
      }
      
      const updateData = {
        // Thai names
        t_title: 'นาย',
        t_name: thaiName,
        t_surname: thaiSurname,
        // English names
        e_title: 'Mr.',
        e_name: englishName,
        e_surname: englishSurname,
        // Personal info
        phone: `081-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        nationality: 'ไทย',
        gpa: (Math.random() * 1.5 + 2.5).toFixed(2), // GPA between 2.5-4.0
        campus: 'วิทยาเขตหลัก',
        // Academic info
        facultyId: faculty?.id || null,
        departmentId: department?.id || null,
        curriculumId: curriculum?.id || null,
        majorId: major?.id || null,
        // Notification settings
        notifyEmail: true,
        notifyPush: false,
        notifySms: false,
        notifyAppUpdates: true,
        notifyDeadlines: true,
        notifyNews: false,
        // Preferences
        language: 'th',
        theme: 'light',
        dateFormat: 'thai'
      };
      
      await prisma.user.update({
        where: { id: student.id },
        data: updateData
      });
      
      console.log(`✅ Updated ${student.name} (${student.id}) -> ${thaiName} ${thaiSurname}`);
    }
    
    // 2. Update test001 user specifically
    console.log('\n🧪 Updating test001 user...');
    
    const testUser = await prisma.user.findUnique({
      where: { id: 'test001' }
    });
    
    if (testUser) {
      await prisma.user.update({
        where: { id: 'test001' },
        data: {
          t_title: 'นาย',
          t_name: 'ทดสอบ',
          t_surname: 'ระบบ',
          e_title: 'Mr.',
          e_name: 'Test',
          e_surname: 'System',
          phone: '081-234-5678',
          nationality: 'ไทย',
          gpa: '3.75',
          campus: 'วิทยาเขตหลัก',
          facultyId: faculty?.id || null,
          departmentId: department?.id || null,
          curriculumId: curriculum?.id || null,
          majorId: major?.id || null,
          notifyEmail: true,
          notifyPush: false,
          notifySms: true,
          notifyAppUpdates: true,
          notifyDeadlines: true,
          notifyNews: false,
          language: 'th',
          theme: 'light',
          dateFormat: 'thai'
        }
      });
      
      console.log('✅ Updated test001 user with complete data');
    }
    
    // 3. Update adminPick user (the one you're testing with)
    console.log('\n👤 Updating adminPick user...');
    
    const adminPickUser = await prisma.user.findUnique({
      where: { id: 'adminPick' }
    });
    
    if (adminPickUser) {
      await prisma.user.update({
        where: { id: 'adminPick' },
        data: {
          t_title: 'นาย',
          t_name: 'ธเนศ',
          t_surname: 'บุญทัพ',
          e_title: 'Mr.',
          e_name: 'Thanes',
          e_surname: 'Boontup',
          phone: '081-999-8888',
          nationality: 'ไทย',
          gpa: '3.50',
          campus: 'วิทยาเขตหลัก',
          facultyId: faculty?.id || null,
          departmentId: department?.id || null,
          curriculumId: curriculum?.id || null,
          majorId: major?.id || null,
          notifyEmail: true,
          notifyPush: true,
          notifySms: false,
          notifyAppUpdates: true,
          notifyDeadlines: true,
          notifyNews: true,
          language: 'th',
          theme: 'light',
          dateFormat: 'thai'
        }
      });
      
      console.log('✅ Updated adminPick user with complete data');
    }
    
    // 4. Verify updates
    console.log('\n🔍 Verifying updates...');
    
    const updatedTestUser = await prisma.user.findUnique({
      where: { id: 'test001' },
      include: {
        faculty: true,
        department: true,
        curriculum: true,
        major: true
      }
    });
    
    if (updatedTestUser) {
      console.log('📊 Test user data:');
      console.log('  Thai Name:', updatedTestUser.t_name, updatedTestUser.t_surname);
      console.log('  English Name:', updatedTestUser.e_name, updatedTestUser.e_surname);
      console.log('  Phone:', updatedTestUser.phone);
      console.log('  Faculty:', updatedTestUser.faculty?.nameTh || 'NOT SET');
      console.log('  Department:', updatedTestUser.department?.nameTh || 'NOT SET');
      console.log('  GPA:', updatedTestUser.gpa);
    }
    
    console.log('\n🎉 User data fix completed!');
    console.log('💡 Now the settings page should display data properly');
    
  } catch (error) {
    console.error('❌ Fix user data failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserData().catch(console.error);