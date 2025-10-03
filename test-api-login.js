const fetch = require('node-fetch');

async function testLoginAPI() {
  try {
    console.log('🧪 Testing login API...');
    
    // Test verify API first
    console.log('\n1. Testing /api/auth/verify');
    const verifyResponse = await fetch('http://localhost:3000/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'admin@smart-solutions.com',
        password: '123456'
      })
    });
    
    const verifyData = await verifyResponse.json();
    console.log('Verify Response:', verifyResponse.status, verifyData);
    
    if (verifyResponse.ok && verifyData.user) {
      console.log('\n2. Testing /api/auth/login with role');
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: 'admin@smart-solutions.com',
          password: '123456',
          role: 'admin'
        })
      });
      
      const loginData = await loginResponse.json();
      console.log('Login Response:', loginResponse.status, loginData);
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testLoginAPI();