// Test API Functions Directly
import { NextRequest } from 'next/server';

// Mock NextRequest for testing
function createMockRequest(method, url, body = null, headers = {}) {
  const request = {
    method,
    url,
    headers: {
      get: (key) => headers[key] || null,
      ...headers
    },
    json: async () => body
  };
  return request;
}

// Test User Settings API Functions
async function testUserSettingsAPI() {
  console.log('\n🧪 Testing User Settings API Functions...');
  
  try {
    // Import API functions
    const { GET, PUT, DELETE } = await import('./src/app/api/user/settings/route.ts');
    
    // Test GET
    console.log('📖 Testing GET function...');
    const getRequest = createMockRequest('GET', '/api/user/settings', null, {
      'x-user-id': 'test001'
    });
    const getResponse = await GET(getRequest);
    const getData = await getResponse.json();
    console.log('✅ GET Function:', getData.success ? 'SUCCESS' : 'FAILED');
    
    // Test PUT
    console.log('📝 Testing PUT function...');
    const putBody = {
      thaiTitle: 'นาย',
      thaiName: 'ทดสอบ API',
      thaiSurname: 'ฟังก์ชัน',
      email: 'test-api@example.com',
      phone: '081-999-8888'
    };
    const putRequest = createMockRequest('PUT', '/api/user/settings', putBody, {
      'x-user-id': 'test001',
      'Content-Type': 'application/json'
    });
    const putResponse = await PUT(putRequest);
    const putData = await putResponse.json();
    console.log('✅ PUT Function:', putData.success ? 'SUCCESS' : 'FAILED');
    
    // Test DELETE
    console.log('🗑️ Testing DELETE function...');
    const deleteRequest = createMockRequest('DELETE', '/api/user/settings', null, {
      'x-user-id': 'test001'
    });
    const deleteResponse = await DELETE(deleteRequest);
    const deleteData = await deleteResponse.json();
    console.log('✅ DELETE Function:', deleteData.success ? 'SUCCESS' : 'FAILED');
    
  } catch (error) {
    console.error('❌ User Settings API Functions Error:', error.message);
  }
}

// Test User Profile API Functions
async function testUserProfileAPI() {
  console.log('\n🧪 Testing User Profile API Functions...');
  
  try {
    // Import API functions
    const { GET, PUT, DELETE } = await import('./src/app/api/user/profile/route.ts');
    
    // Test GET
    console.log('📖 Testing GET function...');
    const getRequest = createMockRequest('GET', '/api/user/profile', null, {
      'x-user-id': 'test001'
    });
    const getResponse = await GET(getRequest);
    const getData = await getResponse.json();
    console.log('✅ GET Function:', getData.success ? 'SUCCESS' : 'FAILED');
    
    // Test PUT
    console.log('📝 Testing PUT function...');
    const putBody = {
      profileImage: 'https://example.com/api-test-image.jpg'
    };
    const putRequest = createMockRequest('PUT', '/api/user/profile', putBody, {
      'x-user-id': 'test001',
      'Content-Type': 'application/json'
    });
    const putResponse = await PUT(putRequest);
    const putData = await putResponse.json();
    console.log('✅ PUT Function:', putData.success ? 'SUCCESS' : 'FAILED');
    
    // Test DELETE
    console.log('🗑️ Testing DELETE function...');
    const deleteRequest = createMockRequest('DELETE', '/api/user/profile', null, {
      'x-user-id': 'test001'
    });
    const deleteResponse = await DELETE(deleteRequest);
    const deleteData = await deleteResponse.json();
    console.log('✅ DELETE Function:', deleteData.success ? 'SUCCESS' : 'FAILED');
    
  } catch (error) {
    console.error('❌ User Profile API Functions Error:', error.message);
  }
}

// Test Academic Faculties API Functions
async function testAcademicFacultiesAPI() {
  console.log('\n🧪 Testing Academic Faculties API Functions...');
  
  try {
    // Import API functions
    const { GET, POST, PUT, DELETE } = await import('./src/app/api/academic/faculties/route.ts');
    
    // Test GET
    console.log('📖 Testing GET function...');
    const getRequest = createMockRequest('GET', '/api/academic/faculties');
    const getResponse = await GET(getRequest);
    const getData = await getResponse.json();
    console.log('✅ GET Function:', getData.success ? 'SUCCESS' : 'FAILED');
    console.log('📊 Faculties count:', getData.count || 0);
    
    // Test POST
    console.log('➕ Testing POST function...');
    const postBody = {
      nameTh: 'คณะทดสอบ API',
      nameEn: 'API Test Faculty',
      code: 'API_TEST'
    };
    const postRequest = createMockRequest('POST', '/api/academic/faculties', postBody, {
      'Content-Type': 'application/json'
    });
    const postResponse = await POST(postRequest);
    const postData = await postResponse.json();
    console.log('✅ POST Function:', postData.success ? 'SUCCESS' : 'FAILED');
    
    let testFacultyId = null;
    if (postData.success && postData.faculty) {
      testFacultyId = postData.faculty.id;
      
      // Test PUT
      console.log('📝 Testing PUT function...');
      const putBody = {
        id: testFacultyId,
        nameTh: 'คณะทดสอบ API (แก้ไข)',
        nameEn: 'API Test Faculty (Updated)',
        code: 'API_TEST_UPD'
      };
      const putRequest = createMockRequest('PUT', '/api/academic/faculties', putBody, {
        'Content-Type': 'application/json'
      });
      const putResponse = await PUT(putRequest);
      const putData = await putResponse.json();
      console.log('✅ PUT Function:', putData.success ? 'SUCCESS' : 'FAILED');
      
      // Test DELETE
      console.log('🗑️ Testing DELETE function...');
      const deleteRequest = createMockRequest('DELETE', `/api/academic/faculties?id=${testFacultyId}&permanent=true`);
      const deleteResponse = await DELETE(deleteRequest);
      const deleteData = await deleteResponse.json();
      console.log('✅ DELETE Function:', deleteData.success ? 'SUCCESS' : 'FAILED');
    }
    
  } catch (error) {
    console.error('❌ Academic Faculties API Functions Error:', error.message);
  }
}

// Test Error Scenarios
async function testErrorScenarios() {
  console.log('\n🧪 Testing Error Scenarios...');
  
  try {
    // Import API functions
    const { GET: getUserSettings } = await import('./src/app/api/user/settings/route.ts');
    const { PUT: putUserProfile } = await import('./src/app/api/user/profile/route.ts');
    
    // Test 404 - User not found
    console.log('🔍 Testing 404 Error...');
    const request404 = createMockRequest('GET', '/api/user/settings', null, {
      'x-user-id': 'nonexistent-user-123'
    });
    const response404 = await getUserSettings(request404);
    console.log('✅ 404 Error:', response404.status === 404 ? 'SUCCESS' : 'FAILED');
    
    // Test 400 - Bad Request
    console.log('⚠️ Testing 400 Error...');
    const request400 = createMockRequest('PUT', '/api/user/profile', {}, {
      'x-user-id': 'test001',
      'Content-Type': 'application/json'
    });
    const response400 = await putUserProfile(request400);
    console.log('✅ 400 Error:', response400.status === 400 ? 'SUCCESS' : 'FAILED');
    
  } catch (error) {
    console.error('❌ Error Scenarios Test Error:', error.message);
  }
}

// Performance Test
async function testPerformance() {
  console.log('\n🧪 Testing Performance...');
  
  try {
    const { GET } = await import('./src/app/api/academic/faculties/route.ts');
    
    console.log('⚡ Testing API response time...');
    const startTime = Date.now();
    
    const request = createMockRequest('GET', '/api/academic/faculties');
    const response = await GET(request);
    const data = await response.json();
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('✅ Response Time:', responseTime, 'ms');
    console.log('✅ Performance:', responseTime < 1000 ? 'GOOD' : 'NEEDS IMPROVEMENT');
    
  } catch (error) {
    console.error('❌ Performance Test Error:', error.message);
  }
}

// Run all API function tests
async function runAllAPITests() {
  console.log('🚀 Starting API Function Tests...');
  console.log('=' .repeat(50));
  
  await testUserSettingsAPI();
  await testUserProfileAPI();
  await testAcademicFacultiesAPI();
  await testErrorScenarios();
  await testPerformance();
  
  console.log('\n' + '=' .repeat(50));
  console.log('✨ All API function tests completed!');
}

// Main execution
async function main() {
  try {
    await runAllAPITests();
  } catch (error) {
    console.error('❌ API test execution error:', error);
  }
}

main().catch(console.error);