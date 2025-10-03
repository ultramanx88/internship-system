// Realtime System Test
import { io } from 'socket.io-client';

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

async function testRealtimeSystem() {
  log('cyan', '\n🔌 Testing Realtime System...');
  
  return new Promise((resolve) => {
    // Connect to Socket.io server
    const socket = io('http://localhost:3000', {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    let testsPassed = 0;
    let totalTests = 4;

    socket.on('connect', () => {
      log('green', '✅ Socket.io connection established');
      testsPassed++;
      
      // Join admin room for testing
      socket.emit('join-admin-room');
      log('blue', '📡 Joined admin room');
    });

    socket.on('user-created', (data) => {
      log('green', '✅ Received user-created event');
      log('blue', `   User: ${data.data.name} (${data.data.email})`);
      testsPassed++;
    });

    socket.on('user-updated', (data) => {
      log('green', '✅ Received user-updated event');
      log('blue', `   User: ${data.data.name} (${data.data.email})`);
      testsPassed++;
    });

    socket.on('user-deleted', (data) => {
      log('green', '✅ Received user-deleted event');
      log('blue', `   User: ${data.data.name}`);
      testsPassed++;
    });

    socket.on('disconnect', () => {
      log('yellow', '🔌 Socket.io disconnected');
    });

    socket.on('connect_error', (error) => {
      log('red', `❌ Socket.io connection error: ${error.message}`);
    });

    // Test API endpoints
    setTimeout(async () => {
      try {
        log('blue', '\n🧪 Testing Realtime API endpoints...');
        
        // Test create user
        const createResponse = await fetch('http://localhost:3000/api/users/realtime', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Realtime Test User',
            email: `realtime_${Date.now()}@test.com`,
            password: '123456',
            roles: '["student"]',
          }),
        });
        
        const createResult = await createResponse.json();
        if (createResult.success) {
          log('green', '✅ Create user API works');
          
          // Test update user
          setTimeout(async () => {
            const updateResponse = await fetch(`http://localhost:3000/api/users/realtime?id=${createResult.data.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: 'Updated Realtime User',
              }),
            });
            
            const updateResult = await updateResponse.json();
            if (updateResult.success) {
              log('green', '✅ Update user API works');
              
              // Test delete user
              setTimeout(async () => {
                const deleteResponse = await fetch(`http://localhost:3000/api/users/realtime?id=${createResult.data.id}`, {
                  method: 'DELETE',
                });
                
                const deleteResult = await deleteResponse.json();
                if (deleteResult.success) {
                  log('green', '✅ Delete user API works');
                }
              }, 1000);
            }
          }, 1000);
        }
      } catch (error) {
        log('red', `❌ API test error: ${error.message}`);
      }
    }, 2000);

    // Check results after 10 seconds
    setTimeout(() => {
      socket.disconnect();
      
      log('bright', '\n📊 Realtime System Test Results:');
      log('bright', '=' .repeat(50));
      log(testsPassed >= totalTests ? 'green' : 'red', 
          `Tests Passed: ${testsPassed}/${totalTests}`);
      
      if (testsPassed >= totalTests) {
        log('green', '🎉 All realtime tests passed!');
        resolve(true);
      } else {
        log('red', '❌ Some realtime tests failed');
        resolve(false);
      }
    }, 10000);
  });
}

// Run the test
testRealtimeSystem().then((success) => {
  process.exit(success ? 0 : 1);
}).catch((error) => {
  log('red', `❌ Test execution failed: ${error.message}`);
  process.exit(1);
});