// Test PostgreSQL Connection and CRUD Operations
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔌 Testing PostgreSQL connection...');
  
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connection successful!');
    
    // Test basic query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('📊 PostgreSQL version:', result[0].version);
    
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    return false;
  }
}

async function testCRUDOperations() {
  console.log('\n🧪 Testing CRUD operations on PostgreSQL...');
  
  try {
    // Test CREATE
    console.log('➕ Testing CREATE...');
    const testFaculty = await prisma.faculty.create({
      data: {
        id: 'test-pg-faculty',
        nameTh: 'คณะทดสอบ PostgreSQL',
        nameEn: 'PostgreSQL Test Faculty',
        code: 'PG_TEST',
        isActive: true
      }
    });
    console.log('✅ CREATE successful:', testFaculty.nameTh);
    
    // Test READ
    console.log('📖 Testing READ...');
    const faculties = await prisma.faculty.findMany({
      where: { isActive: true }
    });
    console.log('✅ READ successful:', faculties.length, 'faculties found');
    
    // Test UPDATE
    console.log('📝 Testing UPDATE...');
    const updatedFaculty = await prisma.faculty.update({
      where: { id: 'test-pg-faculty' },
      data: {
        nameTh: 'คณะทดสอบ PostgreSQL (แก้ไข)',
        nameEn: 'PostgreSQL Test Faculty (Updated)'
      }
    });
    console.log('✅ UPDATE successful:', updatedFaculty.nameTh);
    
    // Test DELETE
    console.log('🗑️ Testing DELETE...');
    await prisma.faculty.delete({
      where: { id: 'test-pg-faculty' }
    });
    console.log('✅ DELETE successful');
    
    return true;
  } catch (error) {
    console.error('❌ CRUD operations failed:', error.message);
    return false;
  }
}

async function testAdvancedFeatures() {
  console.log('\n🚀 Testing PostgreSQL advanced features...');
  
  try {
    // Test Transactions
    console.log('💳 Testing Transactions...');
    await prisma.$transaction(async (tx) => {
      const faculty = await tx.faculty.create({
        data: {
          id: 'test-tx-faculty',
          nameTh: 'คณะทดสอบ Transaction',
          nameEn: 'Transaction Test Faculty',
          code: 'TX_TEST',
          isActive: true
        }
      });
      
      const department = await tx.department.create({
        data: {
          id: 'test-tx-dept',
          nameTh: 'ภาควิชาทดสอบ Transaction',
          nameEn: 'Transaction Test Department',
          code: 'TX_DEPT',
          facultyId: faculty.id,
          isActive: true
        }
      });
      
      console.log('✅ Transaction successful');
    });
    
    // Cleanup transaction test data
    await prisma.department.delete({ where: { id: 'test-tx-dept' } });
    await prisma.faculty.delete({ where: { id: 'test-tx-faculty' } });
    
    // Test Full-text Search (if supported)
    console.log('🔍 Testing Search capabilities...');
    const searchResults = await prisma.faculty.findMany({
      where: {
        nameTh: {
          contains: 'วิทยาศาสตร์'
        }
      }
    });
    console.log('✅ Search successful:', searchResults.length, 'results found');
    
    // Test Aggregations
    console.log('📊 Testing Aggregations...');
    const stats = await prisma.faculty.aggregate({
      _count: {
        id: true
      },
      where: {
        isActive: true
      }
    });
    console.log('✅ Aggregation successful:', stats._count.id, 'active faculties');
    
    return true;
  } catch (error) {
    console.error('❌ Advanced features test failed:', error.message);
    return false;
  }
}

async function testPerformance() {
  console.log('\n⚡ Testing Performance...');
  
  try {
    const startTime = Date.now();
    
    // Test complex query with relations
    const complexQuery = await prisma.faculty.findMany({
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
    
    const endTime = Date.now();
    const queryTime = endTime - startTime;
    
    console.log('✅ Complex query completed in:', queryTime, 'ms');
    console.log('📊 Query result:', complexQuery.length, 'faculties with full relations');
    
    if (queryTime < 1000) {
      console.log('🚀 Performance: EXCELLENT');
    } else if (queryTime < 3000) {
      console.log('👍 Performance: GOOD');
    } else {
      console.log('⚠️ Performance: NEEDS IMPROVEMENT');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting PostgreSQL Tests...');
  console.log('=' .repeat(50));
  
  const results = {
    connection: false,
    crud: false,
    advanced: false,
    performance: false
  };
  
  results.connection = await testConnection();
  
  if (results.connection) {
    results.crud = await testCRUDOperations();
    results.advanced = await testAdvancedFeatures();
    results.performance = await testPerformance();
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 Test Results Summary:');
  console.log('=' .repeat(50));
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${test.toUpperCase().padEnd(15)} ${status}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  const successRate = Math.round((passedTests / totalTests) * 100);
  
  console.log('=' .repeat(50));
  console.log(`🎯 Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`);
  
  if (successRate === 100) {
    console.log('🎉 All tests passed! PostgreSQL is ready for production.');
  } else if (successRate >= 75) {
    console.log('👍 Most tests passed. PostgreSQL is mostly ready.');
  } else {
    console.log('⚠️ Several tests failed. Please check PostgreSQL configuration.');
  }
}

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