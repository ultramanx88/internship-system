// Unit Test for CRUD Operations
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test User Settings CRUD
async function testUserSettingsCRUD() {
  console.log('\n🧪 Testing User Settings CRUD...');
  
  try {
    // CREATE - สร้าง test user
    console.log('➕ Creating test user...');
    const testUser = await prisma.user.upsert({
      where: { id: 'test-crud-001' },
      update: {},
      create: {
        id: 'test-crud-001',
        name: 'Test User',
        email: 'test-crud@example.com',
        password: 'test123',
        roles: '["student"]'
      }
    });
    console.log('✅ Test user created:', testUser.id);
    
    // READ - อ่านข้อมูล user
    console.log('📖 Reading user data...');
    const userData = await prisma.user.findUnique({
      where: { id: 'test-crud-001' },
      include: {
        faculty: true,
        department: true,
        curriculum: true,
        major: true
      }
    });
    console.log('✅ User data read:', userData ? 'SUCCESS' : 'FAILED');
    
    // UPDATE - อัปเดตข้อมูล
    console.log('📝 Updating user settings...');
    const updatedUser = await prisma.user.update({
      where: { id: 'test-crud-001' },
      data: {
        t_title: 'นาย',
        t_name: 'ทดสอบ',
        t_surname: 'ระบบ',
        phone: '081-234-5678',
        nationality: 'ไทย',
        notifyEmail: true,
        notifyPush: false,
        language: 'th',
        theme: 'light'
      }
    });
    console.log('✅ User settings updated:', updatedUser.t_name);
    
    // DELETE - รีเซ็ตการตั้งค่า
    console.log('🔄 Resetting user settings...');
    const resetUser = await prisma.user.update({
      where: { id: 'test-crud-001' },
      data: {
        phone: null,
        nationality: 'ไทย',
        notifyEmail: true,
        notifyPush: false,
        language: 'th',
        theme: 'light'
      }
    });
    console.log('✅ User settings reset:', resetUser.phone === null ? 'SUCCESS' : 'FAILED');
    
  } catch (error) {
    console.error('❌ User Settings CRUD Error:', error.message);
  }
}

// Test Profile Image CRUD
async function testProfileImageCRUD() {
  console.log('\n🧪 Testing Profile Image CRUD...');
  
  try {
    // UPDATE - อัปเดตรูปโปรไฟล์
    console.log('📝 Updating profile image...');
    const updatedProfile = await prisma.user.update({
      where: { id: 'test-crud-001' },
      data: {
        profileImage: 'https://example.com/test-profile.jpg'
      }
    });
    console.log('✅ Profile image updated:', updatedProfile.profileImage ? 'SUCCESS' : 'FAILED');
    
    // READ - อ่านรูปโปรไฟล์
    console.log('📖 Reading profile image...');
    const profileData = await prisma.user.findUnique({
      where: { id: 'test-crud-001' },
      select: {
        id: true,
        profileImage: true
      }
    });
    console.log('✅ Profile image read:', profileData.profileImage ? 'SUCCESS' : 'FAILED');
    
    // DELETE - ลบรูปโปรไฟล์
    console.log('🗑️ Deleting profile image...');
    const deletedProfile = await prisma.user.update({
      where: { id: 'test-crud-001' },
      data: {
        profileImage: null
      }
    });
    console.log('✅ Profile image deleted:', deletedProfile.profileImage === null ? 'SUCCESS' : 'FAILED');
    
  } catch (error) {
    console.error('❌ Profile Image CRUD Error:', error.message);
  }
}

// Test Academic Data CRUD
async function testAcademicDataCRUD() {
  console.log('\n🧪 Testing Academic Data CRUD...');
  
  try {
    // CREATE - สร้างคณะใหม่
    console.log('➕ Creating test faculty...');
    const testFaculty = await prisma.faculty.create({
      data: {
        id: 'test-faculty-001',
        nameTh: 'คณะทดสอบ CRUD',
        nameEn: 'Test CRUD Faculty',
        code: 'CRUD',
        isActive: true
      }
    });
    console.log('✅ Test faculty created:', testFaculty.nameTh);
    
    // READ - อ่านข้อมูลคณะ
    console.log('📖 Reading faculties data...');
    const faculties = await prisma.faculty.findMany({
      where: { isActive: true },
      include: {
        departments: {
          include: {
            curriculums: {
              include: {
                majors: true
              }
            }
          }
        }
      }
    });
    console.log('✅ Faculties read:', faculties.length, 'faculties found');
    
    // UPDATE - อัปเดตข้อมูลคณะ
    console.log('📝 Updating faculty...');
    const updatedFaculty = await prisma.faculty.update({
      where: { id: 'test-faculty-001' },
      data: {
        nameTh: 'คณะทดสอบ CRUD (แก้ไข)',
        nameEn: 'Test CRUD Faculty (Updated)',
        code: 'CRUD_UPD'
      }
    });
    console.log('✅ Faculty updated:', updatedFaculty.nameTh);
    
    // SOFT DELETE - ปิดการใช้งานคณะ
    console.log('🔄 Soft deleting faculty...');
    const softDeletedFaculty = await prisma.faculty.update({
      where: { id: 'test-faculty-001' },
      data: {
        isActive: false
      }
    });
    console.log('✅ Faculty soft deleted:', !softDeletedFaculty.isActive ? 'SUCCESS' : 'FAILED');
    
    // HARD DELETE - ลบคณะถาวร
    console.log('💥 Hard deleting faculty...');
    await prisma.faculty.delete({
      where: { id: 'test-faculty-001' }
    });
    console.log('✅ Faculty hard deleted: SUCCESS');
    
  } catch (error) {
    console.error('❌ Academic Data CRUD Error:', error.message);
  }
}

// Test Data Validation
async function testDataValidation() {
  console.log('\n🧪 Testing Data Validation...');
  
  try {
    // Test duplicate email
    console.log('⚠️ Testing duplicate email validation...');
    try {
      await prisma.user.create({
        data: {
          id: 'test-duplicate',
          name: 'Duplicate User',
          email: 'test-crud@example.com', // Same email as test user
          password: 'test123',
          roles: '["student"]'
        }
      });
      console.log('❌ Duplicate email validation: FAILED (should have thrown error)');
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('✅ Duplicate email validation: SUCCESS (correctly rejected)');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Test required fields
    console.log('⚠️ Testing required fields validation...');
    try {
      await prisma.user.create({
        data: {
          id: 'test-required',
          // Missing required fields: name, email, password, roles
        }
      });
      console.log('❌ Required fields validation: FAILED (should have thrown error)');
    } catch (error) {
      console.log('✅ Required fields validation: SUCCESS (correctly rejected)');
    }
    
  } catch (error) {
    console.error('❌ Data Validation Error:', error.message);
  }
}

// Test Relations
async function testRelations() {
  console.log('\n🧪 Testing Database Relations...');
  
  try {
    // Test faculty-department relation
    console.log('🔗 Testing faculty-department relation...');
    const facultyWithDepts = await prisma.faculty.findFirst({
      include: {
        departments: true
      }
    });
    console.log('✅ Faculty-Department relation:', facultyWithDepts ? 'SUCCESS' : 'NO DATA');
    
    // Test user-faculty relation
    console.log('🔗 Testing user-faculty relation...');
    const userWithFaculty = await prisma.user.findFirst({
      where: {
        facultyId: { not: null }
      },
      include: {
        faculty: true
      }
    });
    console.log('✅ User-Faculty relation:', userWithFaculty ? 'SUCCESS' : 'NO DATA');
    
  } catch (error) {
    console.error('❌ Relations Test Error:', error.message);
  }
}

// Cleanup test data
async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    // Delete test user
    await prisma.user.deleteMany({
      where: {
        id: {
          startsWith: 'test-crud'
        }
      }
    });
    
    // Delete test faculties
    await prisma.faculty.deleteMany({
      where: {
        id: {
          startsWith: 'test-faculty'
        }
      }
    });
    
    console.log('✅ Cleanup completed');
    
  } catch (error) {
    console.error('❌ Cleanup Error:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting CRUD Unit Tests...');
  console.log('=' .repeat(50));
  
  await testUserSettingsCRUD();
  await testProfileImageCRUD();
  await testAcademicDataCRUD();
  await testDataValidation();
  await testRelations();
  await cleanup();
  
  console.log('\n' + '=' .repeat(50));
  console.log('✨ All unit tests completed!');
}

// Main execution
async function main() {
  try {
    await runAllTests();
  } catch (error) {
    console.error('❌ Test execution error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);