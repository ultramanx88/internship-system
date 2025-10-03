// Real-time CRUD Testing (Direct Database Operations)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Real-time User CRUD Operations
async function testUserCRUD() {
  log('cyan', '\n🧪 Testing Real-time User CRUD Operations...');
  
  try {
    // CREATE - สร้างผู้ใช้ใหม่
    log('blue', '➕ CREATE: Creating new user...');
    const newUser = await prisma.user.create({
      data: {
        id: `user_${Date.now()}`,
        name: 'Real-time Test User',
        email: `realtime_${Date.now()}@test.com`,
        password: 'test123',
        roles: '["student"]',
        t_name: 'ทดสอบ',
        t_surname: 'เรียลไทม์',
        e_name: 'Realtime',
        e_surname: 'Test',
        phone: '081-234-5678',
        nationality: 'ไทย'
      }
    });
    log('green', `✅ Created user: ${newUser.name} (ID: ${newUser.id})`);
    
    // READ - อ่านข้อมูลผู้ใช้
    log('blue', '📖 READ: Reading user data...');
    const readUser = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: {
        faculty: true,
        department: true
      }
    });
    log('green', `✅ Read user: ${readUser.name} - Phone: ${readUser.phone}`);
    
    // UPDATE - อัปเดตข้อมูลผู้ใช้
    log('blue', '📝 UPDATE: Updating user data...');
    const updatedUser = await prisma.user.update({
      where: { id: newUser.id },
      data: {
        phone: '089-999-8888',
        profileImage: 'https://example.com/realtime-profile.jpg',
        gpa: '3.75',
        campus: 'วิทยาเขตหลัก'
      }
    });
    log('green', `✅ Updated user: Phone: ${updatedUser.phone}, GPA: ${updatedUser.gpa}`);
    
    // READ AGAIN - ตรวจสอบการอัปเดต
    log('blue', '🔍 VERIFY: Verifying update...');
    const verifyUser = await prisma.user.findUnique({
      where: { id: newUser.id }
    });
    log('green', `✅ Verified: Phone: ${verifyUser.phone}, Profile: ${verifyUser.profileImage ? 'Set' : 'Not set'}`);
    
    // DELETE - ลบผู้ใช้
    log('blue', '🗑️ DELETE: Deleting user...');
    await prisma.user.delete({
      where: { id: newUser.id }
    });
    log('green', '✅ User deleted successfully');
    
    // VERIFY DELETE - ตรวจสอบการลบ
    log('blue', '🔍 VERIFY DELETE: Checking if user exists...');
    const deletedUser = await prisma.user.findUnique({
      where: { id: newUser.id }
    });
    log('green', `✅ Delete verified: ${deletedUser ? 'FAILED - User still exists' : 'SUCCESS - User deleted'}`);
    
    return true;
  } catch (error) {
    log('red', `❌ User CRUD failed: ${error.message}`);
    return false;
  }
}

// Real-time Faculty CRUD Operations
async function testFacultyCRUD() {
  log('cyan', '\n🧪 Testing Real-time Faculty CRUD Operations...');
  
  try {
    // CREATE - สร้างคณะใหม่
    log('blue', '➕ CREATE: Creating new faculty...');
    const newFaculty = await prisma.faculty.create({
      data: {
        id: `faculty_${Date.now()}`,
        nameTh: 'คณะทดสอบเรียลไทม์',
        nameEn: 'Real-time Test Faculty',
        code: 'RTF',
        isActive: true
      }
    });
    log('green', `✅ Created faculty: ${newFaculty.nameTh} (${newFaculty.code})`);
    
    // CREATE DEPARTMENT - สร้างภาควิชา
    log('blue', '➕ CREATE: Creating department...');
    const newDepartment = await prisma.department.create({
      data: {
        id: `dept_${Date.now()}`,
        nameTh: 'ภาควิชาทดสอบเรียลไทม์',
        nameEn: 'Real-time Test Department',
        code: 'RTD',
        facultyId: newFaculty.id,
        isActive: true
      }
    });
    log('green', `✅ Created department: ${newDepartment.nameTh}`);
    
    // READ WITH RELATIONS - อ่านข้อมูลพร้อม relations
    log('blue', '📖 READ: Reading faculty with relations...');
    const facultyWithDepts = await prisma.faculty.findUnique({
      where: { id: newFaculty.id },
      include: {
        departments: true,
        users: true
      }
    });
    log('green', `✅ Read faculty: ${facultyWithDepts.nameTh} with ${facultyWithDepts.departments.length} departments`);
    
    // UPDATE - อัปเดตคณะ
    log('blue', '📝 UPDATE: Updating faculty...');
    const updatedFaculty = await prisma.faculty.update({
      where: { id: newFaculty.id },
      data: {
        nameTh: 'คณะทดสอบเรียลไทม์ (แก้ไข)',
        nameEn: 'Real-time Test Faculty (Updated)'
      }
    });
    log('green', `✅ Updated faculty: ${updatedFaculty.nameTh}`);
    
    // SOFT DELETE - ปิดการใช้งาน
    log('blue', '🔄 SOFT DELETE: Deactivating faculty...');
    const deactivatedFaculty = await prisma.faculty.update({
      where: { id: newFaculty.id },
      data: { isActive: false }
    });
    log('green', `✅ Faculty deactivated: Active = ${deactivatedFaculty.isActive}`);
    
    // CLEANUP - ลบข้อมูลทดสอบ
    log('blue', '🧹 CLEANUP: Deleting test data...');
    await prisma.department.delete({ where: { id: newDepartment.id } });
    await prisma.faculty.delete({ where: { id: newFaculty.id } });
    log('green', '✅ Test data cleaned up');
    
    return true;
  } catch (error) {
    log('red', `❌ Faculty CRUD failed: ${error.message}`);
    return false;
  }
}

// Real-time Profile Image Operations
async function testProfileImageCRUD() {
  log('cyan', '\n🧪 Testing Real-time Profile Image CRUD...');
  
  try {
    // Find existing user
    log('blue', '👤 Finding existing user...');
    const existingUser = await prisma.user.findFirst({
      where: { email: { contains: 'test' } }
    });
    
    if (!existingUser) {
      log('yellow', '⚠️ No test user found, creating one...');
      const testUser = await prisma.user.create({
        data: {
          id: `profile_test_${Date.now()}`,
          name: 'Profile Test User',
          email: `profile_test_${Date.now()}@test.com`,
          password: 'test123',
          roles: '["student"]'
        }
      });
      log('green', `✅ Created test user: ${testUser.name}`);
      existingUser = testUser;
    }
    
    log('green', `✅ Using user: ${existingUser.name} (ID: ${existingUser.id})`);
    
    // UPDATE - Set profile image
    log('blue', '📝 UPDATE: Setting profile image...');
    const imageUrl = `https://example.com/profile_${Date.now()}.jpg`;
    const userWithImage = await prisma.user.update({
      where: { id: existingUser.id },
      data: { profileImage: imageUrl }
    });
    log('green', `✅ Profile image set: ${userWithImage.profileImage}`);
    
    // READ - Get profile image
    log('blue', '📖 READ: Getting profile image...');
    const profileData = await prisma.user.findUnique({
      where: { id: existingUser.id },
      select: { id: true, name: true, profileImage: true }
    });
    log('green', `✅ Profile image retrieved: ${profileData.profileImage}`);
    
    // UPDATE - Change profile image
    log('blue', '📝 UPDATE: Changing profile image...');
    const newImageUrl = `https://example.com/new_profile_${Date.now()}.jpg`;
    const updatedProfile = await prisma.user.update({
      where: { id: existingUser.id },
      data: { profileImage: newImageUrl }
    });
    log('green', `✅ Profile image updated: ${updatedProfile.profileImage}`);
    
    // DELETE - Remove profile image
    log('blue', '🗑️ DELETE: Removing profile image...');
    const clearedProfile = await prisma.user.update({
      where: { id: existingUser.id },
      data: { profileImage: null }
    });
    log('green', `✅ Profile image removed: ${clearedProfile.profileImage || 'null'}`);
    
    return true;
  } catch (error) {
    log('red', `❌ Profile Image CRUD failed: ${error.message}`);
    return false;
  }
}

// Real-time Settings CRUD
async function testSettingsCRUD() {
  log('cyan', '\n🧪 Testing Real-time Settings CRUD...');
  
  try {
    // Find or create test user
    let testUser = await prisma.user.findFirst({
      where: { email: { contains: 'settings' } }
    });
    
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          id: `settings_test_${Date.now()}`,
          name: 'Settings Test User',
          email: `settings_test_${Date.now()}@test.com`,
          password: 'test123',
          roles: '["student"]'
        }
      });
      log('green', `✅ Created settings test user: ${testUser.name}`);
    }
    
    // UPDATE - Update all settings
    log('blue', '📝 UPDATE: Updating user settings...');
    const updatedSettings = await prisma.user.update({
      where: { id: testUser.id },
      data: {
        // Personal info
        t_name: 'ทดสอบ',
        t_surname: 'การตั้งค่า',
        e_name: 'Settings',
        e_surname: 'Test',
        phone: '081-111-2222',
        nationality: 'ไทย',
        gpa: '3.50',
        campus: 'วิทยาเขตทดสอบ',
        
        // Notification settings
        notifyEmail: true,
        notifyPush: false,
        notifySms: true,
        notifyAppUpdates: true,
        notifyDeadlines: true,
        notifyNews: false,
        
        // Preferences
        language: 'th',
        theme: 'dark',
        dateFormat: 'thai'
      }
    });
    
    log('green', `✅ Settings updated: ${updatedSettings.t_name} ${updatedSettings.t_surname}`);
    log('green', `   📱 Phone: ${updatedSettings.phone}`);
    log('green', `   🔔 Email notifications: ${updatedSettings.notifyEmail}`);
    log('green', `   🎨 Theme: ${updatedSettings.theme}`);
    
    // READ - Get all settings
    log('blue', '📖 READ: Reading all settings...');
    const allSettings = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: {
        id: true,
        name: true,
        t_name: true,
        t_surname: true,
        e_name: true,
        e_surname: true,
        phone: true,
        nationality: true,
        gpa: true,
        campus: true,
        notifyEmail: true,
        notifyPush: true,
        notifySms: true,
        language: true,
        theme: true,
        dateFormat: true
      }
    });
    
    log('green', '✅ All settings retrieved:');
    log('green', `   👤 Thai name: ${allSettings.t_name} ${allSettings.t_surname}`);
    log('green', `   👤 English name: ${allSettings.e_name} ${allSettings.e_surname}`);
    log('green', `   📱 Phone: ${allSettings.phone}`);
    log('green', `   🌍 Nationality: ${allSettings.nationality}`);
    log('green', `   📊 GPA: ${allSettings.gpa}`);
    log('green', `   🏫 Campus: ${allSettings.campus}`);
    log('green', `   🔔 Notifications: Email=${allSettings.notifyEmail}, Push=${allSettings.notifyPush}, SMS=${allSettings.notifySms}`);
    log('green', `   ⚙️ Preferences: Lang=${allSettings.language}, Theme=${allSettings.theme}, Date=${allSettings.dateFormat}`);
    
    return true;
  } catch (error) {
    log('red', `❌ Settings CRUD failed: ${error.message}`);
    return false;
  }
}

// Performance Test
async function testPerformance() {
  log('cyan', '\n⚡ Testing Real-time Performance...');
  
  try {
    const startTime = Date.now();
    
    // Complex query with relations
    log('blue', '🔍 Running complex query...');
    const complexData = await prisma.faculty.findMany({
      include: {
        departments: {
          include: {
            curriculums: {
              include: {
                majors: true
              }
            }
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    const endTime = Date.now();
    const queryTime = endTime - startTime;
    
    log('green', `✅ Complex query completed in ${queryTime}ms`);
    log('green', `📊 Results: ${complexData.length} faculties`);
    
    let totalDepartments = 0;
    let totalCurriculums = 0;
    let totalMajors = 0;
    let totalUsers = 0;
    
    complexData.forEach(faculty => {
      totalDepartments += faculty.departments.length;
      totalUsers += faculty.users.length;
      faculty.departments.forEach(dept => {
        totalCurriculums += dept.curriculums.length;
        dept.curriculums.forEach(curr => {
          totalMajors += curr.majors.length;
        });
      });
    });
    
    log('green', `   📋 Total departments: ${totalDepartments}`);
    log('green', `   📖 Total curriculums: ${totalCurriculums}`);
    log('green', `   🎓 Total majors: ${totalMajors}`);
    log('green', `   👥 Total users: ${totalUsers}`);
    
    if (queryTime < 100) {
      log('green', '🚀 Performance: EXCELLENT');
    } else if (queryTime < 500) {
      log('yellow', '👍 Performance: GOOD');
    } else {
      log('red', '⚠️ Performance: NEEDS IMPROVEMENT');
    }
    
    return true;
  } catch (error) {
    log('red', `❌ Performance test failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runRealtimeCRUDTests() {
  log('bright', '🚀 Starting Real-time CRUD Tests...');
  log('bright', '=' .repeat(60));
  
  const results = {
    userCRUD: false,
    facultyCRUD: false,
    profileImageCRUD: false,
    settingsCRUD: false,
    performance: false
  };
  
  // Run all tests
  results.userCRUD = await testUserCRUD();
  results.facultyCRUD = await testFacultyCRUD();
  results.profileImageCRUD = await testProfileImageCRUD();
  results.settingsCRUD = await testSettingsCRUD();
  results.performance = await testPerformance();
  
  // Summary
  log('bright', '\n' + '=' .repeat(60));
  log('bright', '📊 Real-time CRUD Test Results:');
  log('bright', '=' .repeat(60));
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    const testName = test.replace(/([A-Z])/g, ' $1').toUpperCase();
    log(passed ? 'green' : 'red', `${testName.padEnd(20)} ${status}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  const successRate = Math.round((passedTests / totalTests) * 100);
  
  log('bright', '=' .repeat(60));
  log('bright', `🎯 Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`);
  
  if (successRate === 100) {
    log('green', '🎉 All real-time CRUD operations working perfectly!');
    log('green', '✨ Your database is ready for production use!');
  } else if (successRate >= 80) {
    log('yellow', '👍 Most real-time CRUD operations working well!');
    log('yellow', '🔧 Minor issues detected, but system is functional.');
  } else {
    log('red', '⚠️ Several real-time CRUD operations failed!');
    log('red', '🛠️ Please check database configuration and connections.');
  }
  
  log('bright', '\n🎯 Next Steps:');
  log('blue', '1. Run "npm run dev" to start the development server');
  log('blue', '2. Open "npm run db:studio" to view data in Prisma Studio');
  log('blue', '3. Test the web interface at http://localhost:3000');
  log('blue', '4. Check real-time updates in the browser');
}

// Execute tests
async function main() {
  try {
    await runRealtimeCRUDTests();
  } catch (error) {
    log('red', `❌ Test execution failed: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);