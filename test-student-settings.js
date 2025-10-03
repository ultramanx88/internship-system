// Test Student Settings specifically
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testStudentSettings() {
  console.log('🧪 Testing Student Settings Data Loading...');
  
  try {
    // Test with adminPick user (the one you're using)
    const userId = 'adminPick';
    console.log(`🔍 Testing with user ID: ${userId}`);
    
    // Simulate the API call
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        faculty: true,
        department: true,
        curriculum: true,
        major: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.name);
    
    // Create settings object exactly like API does
    const settings = {
      // ข้อมูลภาษาไทย
      thaiTitle: user.t_title || '',
      thaiName: user.t_name || '',
      thaiMiddleName: user.t_middle_name || '',
      thaiSurname: user.t_surname || '',
      // ข้อมูลภาษาอังกฤษ
      englishTitle: user.e_title || '',
      englishName: user.e_name || '',
      englishMiddleName: user.e_middle_name || '',
      englishSurname: user.e_surname || '',
      // ข้อมูลอื่นๆ
      email: user.email,
      phone: user.phone || '',
      studentId: user.id,
      faculty: user.faculty?.nameTh || '',
      department: user.department?.nameTh || '',
      program: user.curriculum?.nameTh || '',
      major: user.major?.nameTh || '',
      campus: user.campus || '',
      gpa: user.gpa || '',
      nationality: user.nationality || 'ไทย',
      passportId: user.passportId || '',
      visaType: user.visaType || 'none',
      skills: user.skills || '',
      statement: user.statement || ''
    };
    
    console.log('\n📊 Settings data that should appear in form:');
    console.log('=' .repeat(50));
    console.log('Thai Name Fields:');
    console.log('  Title:', settings.thaiTitle || '(empty)');
    console.log('  First Name:', settings.thaiName || '(empty)');
    console.log('  Middle Name:', settings.thaiMiddleName || '(empty)');
    console.log('  Last Name:', settings.thaiSurname || '(empty)');
    
    console.log('\nEnglish Name Fields:');
    console.log('  Title:', settings.englishTitle || '(empty)');
    console.log('  First Name:', settings.englishName || '(empty)');
    console.log('  Middle Name:', settings.englishMiddleName || '(empty)');
    console.log('  Last Name:', settings.englishSurname || '(empty)');
    
    console.log('\nPersonal Info:');
    console.log('  Email:', settings.email);
    console.log('  Phone:', settings.phone || '(empty)');
    console.log('  Student ID:', settings.studentId);
    console.log('  Nationality:', settings.nationality);
    console.log('  Passport/ID:', settings.passportId || '(empty)');
    console.log('  Visa Type:', settings.visaType);
    
    console.log('\nAcademic Info:');
    console.log('  Faculty:', settings.faculty || '(empty)');
    console.log('  Department:', settings.department || '(empty)');
    console.log('  Program:', settings.program || '(empty)');
    console.log('  Major:', settings.major || '(empty)');
    console.log('  Campus:', settings.campus || '(empty)');
    console.log('  GPA:', settings.gpa || '(empty)');
    
    // Check if data is complete
    const requiredFields = [
      'thaiName', 'thaiSurname', 'englishName', 'englishSurname',
      'email', 'phone', 'faculty', 'department'
    ];
    
    const missingFields = requiredFields.filter(field => !settings[field]);
    
    if (missingFields.length === 0) {
      console.log('\n✅ All required fields have data - Settings form should populate correctly!');
    } else {
      console.log('\n⚠️ Missing data in fields:', missingFields.join(', '));
      console.log('💡 This explains why some form fields appear empty');
    }
    
    // Test the exact API response format
    const apiResponse = {
      success: true,
      settings
    };
    
    console.log('\n📤 Complete API Response:');
    console.log('  Success:', apiResponse.success);
    console.log('  Settings object keys:', Object.keys(apiResponse.settings).length);
    
    console.log('\n🎯 Frontend should receive this data and populate the form fields');
    
  } catch (error) {
    console.error('❌ Student settings test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testStudentSettings().catch(console.error);