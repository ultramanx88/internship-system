// Test CRUD Operations
const BASE_URL = 'http://localhost:3000';

// Test User Settings API
async function testUserSettings() {
  console.log('\n🧪 Testing User Settings API...');
  
  try {
    // Test READ (GET)
    console.log('📖 Testing GET /api/user/settings');
    const getResponse = await fetch(`${BASE_URL}/api/user/settings`, {
      headers: {
        'x-user-id': 'test001'
      }
    });
    const getData = await getResponse.json();
    console.log('✅ GET Response:', getData.success ? 'SUCCESS' : 'FAILED');
    
    // Test UPDATE (PUT)
    console.log('📝 Testing PUT /api/user/settings');
    const updateData = {
      thaiTitle: 'นาย',
      thaiName: 'ทดสอบ',
      thaiSurname: 'ระบบ',
      email: 'test@example.com',
      phone: '081-234-5678',
      nationality: 'ไทย',
      notifications: {
        email: true,
        push: false,
        sms: false
      },
      preferences: {
        language: 'th',
        theme: 'light'
      }
    };
    
    const putResponse = await fetch(`${BASE_URL}/api/user/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test001'
      },
      body: JSON.stringify(updateData)
    });
    const putData = await putResponse.json();
    console.log('✅ PUT Response:', putData.success ? 'SUCCESS' : 'FAILED');
    
    // Test DELETE (Reset settings)
    console.log('🗑️ Testing DELETE /api/user/settings');
    const deleteResponse = await fetch(`${BASE_URL}/api/user/settings`, {
      method: 'DELETE',
      headers: {
        'x-user-id': 'test001'
      }
    });
    const deleteData = await deleteResponse.json();
    console.log('✅ DELETE Response:', deleteData.success ? 'SUCCESS' : 'FAILED');
    
  } catch (error) {
    console.error('❌ User Settings API Error:', error.message);
  }
}

// Test User Profile API
async function testUserProfile() {
  console.log('\n🧪 Testing User Profile API...');
  
  try {
    // Test READ (GET)
    console.log('📖 Testing GET /api/user/profile');
    const getResponse = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: {
        'x-user-id': 'test001'
      }
    });
    const getData = await getResponse.json();
    console.log('✅ GET Response:', getData.success ? 'SUCCESS' : 'FAILED');
    
    // Test UPDATE (PUT)
    console.log('📝 Testing PUT /api/user/profile');
    const putResponse = await fetch(`${BASE_URL}/api/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test001'
      },
      body: JSON.stringify({
        profileImage: 'https://example.com/test-image.jpg'
      })
    });
    const putData = await putResponse.json();
    console.log('✅ PUT Response:', putData.success ? 'SUCCESS' : 'FAILED');
    
    // Test DELETE
    console.log('🗑️ Testing DELETE /api/user/profile');
    const deleteResponse = await fetch(`${BASE_URL}/api/user/profile`, {
      method: 'DELETE',
      headers: {
        'x-user-id': 'test001'
      }
    });
    const deleteData = await deleteResponse.json();
    console.log('✅ DELETE Response:', deleteData.success ? 'SUCCESS' : 'FAILED');
    
  } catch (error) {
    console.error('❌ User Profile API Error:', error.message);
  }
}

// Test Academic Faculties API
async function testAcademicFaculties() {
  console.log('\n🧪 Testing Academic Faculties API...');
  
  try {
    // Test READ (GET)
    console.log('📖 Testing GET /api/academic/faculties');
    const getResponse = await fetch(`${BASE_URL}/api/academic/faculties`);
    const getData = await getResponse.json();
    console.log('✅ GET Response:', getData.success ? 'SUCCESS' : 'FAILED');
    console.log('📊 Faculties count:', getData.count || 0);
    
    // Test CREATE (POST)
    console.log('➕ Testing POST /api/academic/faculties');
    const createData = {
      nameTh: 'คณะทดสอบ',
      nameEn: 'Test Faculty',
      code: 'TEST'
    };
    
    const postResponse = await fetch(`${BASE_URL}/api/academic/faculties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createData)
    });
    const postData = await postResponse.json();
    console.log('✅ POST Response:', postData.success ? 'SUCCESS' : 'FAILED');
    
    let testFacultyId = null;
    if (postData.success && postData.faculty) {
      testFacultyId = postData.faculty.id;
      console.log('🆔 Created Faculty ID:', testFacultyId);
      
      // Test UPDATE (PUT)
      console.log('📝 Testing PUT /api/academic/faculties');
      const updateData = {
        id: testFacultyId,
        nameTh: 'คณะทดสอบ (แก้ไข)',
        nameEn: 'Test Faculty (Updated)',
        code: 'TEST_UPD'
      };
      
      const putResponse = await fetch(`${BASE_URL}/api/academic/faculties`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      const putData = await putResponse.json();
      console.log('✅ PUT Response:', putData.success ? 'SUCCESS' : 'FAILED');
      
      // Test DELETE (Soft delete)
      console.log('🗑️ Testing DELETE /api/academic/faculties (Soft)');
      const deleteResponse = await fetch(`${BASE_URL}/api/academic/faculties?id=${testFacultyId}`, {
        method: 'DELETE'
      });
      const deleteData = await deleteResponse.json();
      console.log('✅ DELETE Response:', deleteData.success ? 'SUCCESS' : 'FAILED');
      
      // Test DELETE (Hard delete)
      console.log('💥 Testing DELETE /api/academic/faculties (Hard)');
      const hardDeleteResponse = await fetch(`${BASE_URL}/api/academic/faculties?id=${testFacultyId}&permanent=true`, {
        method: 'DELETE'
      });
      const hardDeleteData = await hardDeleteResponse.json();
      console.log('✅ HARD DELETE Response:', hardDeleteData.success ? 'SUCCESS' : 'FAILED');
    }
    
  } catch (error) {
    console.error('❌ Academic Faculties API Error:', error.message);
  }
}

// Test Error Handling
async function testErrorHandling() {
  console.log('\n🧪 Testing Error Handling...');
  
  try {
    // Test 404 - User not found
    console.log('🔍 Testing 404 Error');
    const response404 = await fetch(`${BASE_URL}/api/user/settings`, {
      headers: {
        'x-user-id': 'nonexistent-user'
      }
    });
    console.log('✅ 404 Status:', response404.status === 404 ? 'SUCCESS' : 'FAILED');
    
    // Test 400 - Bad Request
    console.log('⚠️ Testing 400 Error');
    const response400 = await fetch(`${BASE_URL}/api/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test001'
      },
      body: JSON.stringify({}) // Missing profileImage
    });
    console.log('✅ 400 Status:', response400.status === 400 ? 'SUCCESS' : 'FAILED');
    
  } catch (error) {
    console.error('❌ Error Handling Test Error:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting CRUD Tests...');
  console.log('=' .repeat(50));
  
  await testUserSettings();
  await testUserProfile();
  await testAcademicFaculties();
  await testErrorHandling();
  
  console.log('\n' + '=' .repeat(50));
  console.log('✨ All tests completed!');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/user/settings`, {
      headers: { 'x-user-id': 'test001' }
    });
    return response.ok || response.status === 404; // OK or expected 404
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running. Please start the development server:');
    console.log('   npm run dev');
    console.log('   or');
    console.log('   yarn dev');
    return;
  }
  
  console.log('✅ Server is running!');
  await runAllTests();
}

main().catch(console.error);