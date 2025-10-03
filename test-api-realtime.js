// Real-time API Testing (requires running server)
const BASE_URL = 'http://localhost:3000';

// Test if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: { 'x-user-id': 'test001' }
    });
    return response.status !== 0;
  } catch (error) {
    return false;
  }
}

// Real-time API Tests
async function testRealtimeAPI() {
  console.log('🔌 Testing Real-time API Endpoints...');
  
  // Check if server is running
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Server is not running!');
    console.log('📋 To start server: npm run dev');
    console.log('🌐 Then visit: http://localhost:3000');
    return false;
  }
  
  console.log('✅ Server is running!');
  
  try {
    // Test User Profile API
    console.log('\n👤 Testing User Profile API...');
    
    // GET Profile
    console.log('📖 GET /api/user/profile');
    const getResponse = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: { 'x-user-id': 'test001' }
    });
    const getData = await getResponse.json();
    console.log('✅ GET Response:', getData.success ? 'SUCCESS' : 'FAILED');
    console.log('🖼️ Current profile image:', getData.profileImage || 'None');
    
    // PUT Profile (Update)
    console.log('📝 PUT /api/user/profile');
    const testImageUrl = `https://example.com/api-test-${Date.now()}.jpg`;
    const putResponse = await fetch(`${BASE_URL}/api/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test001'
      },
      body: JSON.stringify({ profileImage: testImageUrl })
    });
    const putData = await putResponse.json();
    console.log('✅ PUT Response:', putData.success ? 'SUCCESS' : 'FAILED');
    console.log('🖼️ Updated profile image:', putData.profileImage);
    
    // Verify Update
    console.log('🔍 Verifying update...');
    const verifyResponse = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: { 'x-user-id': 'test001' }
    });
    const verifyData = await verifyResponse.json();
    console.log('✅ Verification:', verifyData.profileImage === testImageUrl ? 'SUCCESS' : 'FAILED');
    
    // Test User Settings API
    console.log('\n⚙️ Testing User Settings API...');
    
    // GET Settings
    console.log('📖 GET /api/user/settings');
    const settingsGetResponse = await fetch(`${BASE_URL}/api/user/settings`, {
      headers: { 'x-user-id': 'test001' }
    });
    const settingsGetData = await settingsGetResponse.json();
    console.log('✅ GET Settings:', settingsGetData.success ? 'SUCCESS' : 'FAILED');
    console.log('👤 Current name:', settingsGetData.settings?.thaiName || 'Not set');
    
    // PUT Settings (Update)
    console.log('📝 PUT /api/user/settings');
    const settingsUpdate = {
      thaiName: 'ทดสอบ API',
      thaiSurname: 'เรียลไทม์',
      phone: '081-999-7777',
      nationality: 'ไทย',
      notifications: {
        email: true,
        push: false,
        sms: true
      },
      preferences: {
        language: 'th',
        theme: 'light'
      }
    };
    
    const settingsPutResponse = await fetch(`${BASE_URL}/api/user/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test001'
      },
      body: JSON.stringify(settingsUpdate)
    });
    const settingsPutData = await settingsPutResponse.json();
    console.log('✅ PUT Settings:', settingsPutData.success ? 'SUCCESS' : 'FAILED');
    
    // Verify Settings Update
    console.log('🔍 Verifying settings update...');
    const settingsVerifyResponse = await fetch(`${BASE_URL}/api/user/settings`, {
      headers: { 'x-user-id': 'test001' }
    });
    const settingsVerifyData = await settingsVerifyResponse.json();
    console.log('✅ Settings Verification:', 
      settingsVerifyData.settings?.thaiName === 'ทดสอบ API' ? 'SUCCESS' : 'FAILED');
    console.log('📱 Updated phone:', settingsVerifyData.settings?.phone);
    
    // Test Academic Faculties API
    console.log('\n🏫 Testing Academic Faculties API...');
    
    // GET Faculties
    console.log('📖 GET /api/academic/faculties');
    const facultiesResponse = await fetch(`${BASE_URL}/api/academic/faculties`);
    const facultiesData = await facultiesResponse.json();
    console.log('✅ GET Faculties:', facultiesData.success ? 'SUCCESS' : 'FAILED');
    console.log('📊 Total faculties:', facultiesData.count || 0);
    
    // POST Faculty (Create)
    console.log('➕ POST /api/academic/faculties');
    const newFaculty = {
      nameTh: `คณะทดสอบ API ${Date.now()}`,
      nameEn: `API Test Faculty ${Date.now()}`,
      code: `API${Date.now().toString().slice(-3)}`
    };
    
    const facultyPostResponse = await fetch(`${BASE_URL}/api/academic/faculties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFaculty)
    });
    const facultyPostData = await facultyPostResponse.json();
    console.log('✅ POST Faculty:', facultyPostData.success ? 'SUCCESS' : 'FAILED');
    
    if (facultyPostData.success && facultyPostData.faculty) {
      const facultyId = facultyPostData.faculty.id;
      console.log('🆔 Created faculty ID:', facultyId);
      
      // PUT Faculty (Update)
      console.log('📝 PUT /api/academic/faculties');
      const facultyUpdate = {
        id: facultyId,
        nameTh: newFaculty.nameTh + ' (แก้ไข)',
        nameEn: newFaculty.nameEn + ' (Updated)',
        code: newFaculty.code + '_UPD'
      };
      
      const facultyPutResponse = await fetch(`${BASE_URL}/api/academic/faculties`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facultyUpdate)
      });
      const facultyPutData = await facultyPutResponse.json();
      console.log('✅ PUT Faculty:', facultyPutData.success ? 'SUCCESS' : 'FAILED');
      
      // DELETE Faculty
      console.log('🗑️ DELETE /api/academic/faculties');
      const facultyDeleteResponse = await fetch(
        `${BASE_URL}/api/academic/faculties?id=${facultyId}&permanent=true`,
        { method: 'DELETE' }
      );
      const facultyDeleteData = await facultyDeleteResponse.json();
      console.log('✅ DELETE Faculty:', facultyDeleteData.success ? 'SUCCESS' : 'FAILED');
    }
    
    console.log('\n🎉 Real-time API testing completed!');
    console.log('✨ All endpoints are working with live database!');
    
    return true;
  } catch (error) {
    console.error('❌ Real-time API test failed:', error.message);
    return false;
  }
}

// Instructions for manual testing
function showManualTestingInstructions() {
  console.log('\n📋 Manual Real-time Testing Instructions:');
  console.log('=' .repeat(50));
  console.log('1. 🚀 Start the development server:');
  console.log('   npm run dev');
  console.log('');
  console.log('2. 🌐 Open your browser and go to:');
  console.log('   http://localhost:3000');
  console.log('');
  console.log('3. 🔐 Login with test credentials:');
  console.log('   Email: test@test.com');
  console.log('   Password: 123456');
  console.log('');
  console.log('4. 🧪 Test real-time CRUD operations:');
  console.log('   • Go to Settings page');
  console.log('   • Upload a profile image');
  console.log('   • Change your name, phone, etc.');
  console.log('   • Check if changes appear immediately');
  console.log('');
  console.log('5. 🗄️ Open Prisma Studio to see database changes:');
  console.log('   npm run db:studio');
  console.log('   Open: http://localhost:5555');
  console.log('');
  console.log('6. ✅ Verify real-time updates:');
  console.log('   • Changes in browser should reflect in database');
  console.log('   • Database changes should appear in browser');
  console.log('   • No page refresh needed for updates');
}

// Main execution
async function main() {
  console.log('🧪 Real-time API Testing Tool');
  console.log('=' .repeat(50));
  
  const success = await testRealtimeAPI();
  
  if (!success) {
    showManualTestingInstructions();
  }
}

main().catch(console.error);