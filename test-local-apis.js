#!/usr/bin/env node

/**
 * Local API Testing Script
 * ทดสอบ API ทั้งหมดใน local ก่อน deploy ไป VPS
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:8080';
const TEST_APIS = [
  '/api/health',
  '/api/companies',
  '/api/applications',
  '/api/users',
  '/api/faculties',
  '/api/departments',
  '/api/curriculums',
  '/api/majors',
  '/api/provinces',
  '/api/academic-years',
  '/api/semesters',
  '/api/courses',
  '/api/educator-roles',
  '/api/reports',
  '/api/notifications'
];

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            success: false,
            error: 'Invalid JSON response'
          });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testAPI(endpoint) {
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    log(`Testing ${endpoint}...`, 'blue');
    const result = await makeRequest(url);
    
    if (result.success) {
      log(`✅ ${endpoint} - Status: ${result.status}`, 'green');
      
      // Check if response has expected structure
      if (result.data && typeof result.data === 'object') {
        if (result.data.success !== undefined) {
          if (result.data.success) {
            log(`   Response: Success`, 'green');
          } else {
            log(`   Response: Failed - ${result.data.error || 'Unknown error'}`, 'red');
          }
        } else if (Array.isArray(result.data)) {
          log(`   Response: Array with ${result.data.length} items`, 'green');
        } else {
          log(`   Response: Object with ${Object.keys(result.data).length} properties`, 'green');
        }
      }
      
      return { endpoint, success: true, status: result.status };
    } else {
      log(`❌ ${endpoint} - Status: ${result.status}`, 'red');
      if (result.error) {
        log(`   Error: ${result.error}`, 'red');
      }
      if (result.data && result.data.error) {
        log(`   API Error: ${result.data.error}`, 'red');
      }
      return { endpoint, success: false, status: result.status, error: result.error };
    }
  } catch (error) {
    log(`❌ ${endpoint} - Error: ${error.message}`, 'red');
    return { endpoint, success: false, error: error.message };
  }
}

async function runTests() {
  log('🚀 Starting Local API Tests...', 'bold');
  log(`Base URL: ${BASE_URL}`, 'blue');
  log('', 'reset');
  
  const results = [];
  
  for (const endpoint of TEST_APIS) {
    const result = await testAPI(endpoint);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
  }
  
  log('', 'reset');
  log('📊 Test Results Summary:', 'bold');
  log('', 'reset');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  log(`✅ Successful: ${successful.length}/${results.length}`, 'green');
  log(`❌ Failed: ${failed.length}/${results.length}`, failed.length > 0 ? 'red' : 'green');
  
  if (failed.length > 0) {
    log('', 'reset');
    log('Failed APIs:', 'red');
    failed.forEach(result => {
      log(`  - ${result.endpoint} (${result.status || 'Error'})`, 'red');
      if (result.error) {
        log(`    ${result.error}`, 'red');
      }
    });
  }
  
  log('', 'reset');
  
  if (failed.length === 0) {
    log('🎉 All APIs are working correctly! Safe to deploy to VPS.', 'green');
    process.exit(0);
  } else {
    log('⚠️  Some APIs are failing. Please fix them before deploying to VPS.', 'yellow');
    process.exit(1);
  }
}

// Check if local server is running
async function checkServer() {
  try {
    await makeRequest(`${BASE_URL}/api/health`);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  log('🔍 Checking if local server is running...', 'blue');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    log('❌ Local server is not running!', 'red');
    log('Please start your Next.js development server first:', 'yellow');
    log('  npm run dev', 'blue');
    process.exit(1);
  }
  
  log('✅ Local server is running', 'green');
  log('', 'reset');
  
  await runTests();
}

main().catch(error => {
  log(`💥 Test runner error: ${error.message}`, 'red');
  process.exit(1);
});
