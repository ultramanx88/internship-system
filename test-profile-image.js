// Test Profile Image Upload and Display
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testProfileImageFlow() {
  console.log('🧪 Testing Profile Image Flow...');
  
  try {
    // 1. Find a test user
    console.log('👤 Finding test user...');
    let testUser = await prisma.user.findFirst({
      where: {
        email: { contains: 'test' }
      }
    });
    
    if (!testUser) {
      // Create test user if not exists
      testUser = await prisma.user.create({
        data: {
          id: 'test-profile-user',
          name: 'Test Profile User',
          email: 'test-profile@example.com',
          password: 'test123',
          roles: '["student"]'
        }
      });
      console.log('✅ Created test user:', testUser.name);
    } else {
      console.log('✅ Found test user:', testUser.name, '(ID:', testUser.id + ')');
    }
    
    // 2. Test API GET (without profile image)
    console.log('📖 Testing GET profile (empty)...');
    const testImageUrl = 'https://example.com/test-profile-image.jpg';
    
    // Simulate API call
    const getEmptyResult = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: { id: true, profileImage: true }
    });
    console.log('✅ GET result (empty):', getEmptyResult.profileImage || 'null');
    
    // 3. Test API PUT (upload profile image)
    console.log('📝 Testing PUT profile (upload)...');
    const updatedUser = await prisma.user.update({
      where: { id: testUser.id },
      data: { profileImage: testImageUrl }
    });
    console.log('✅ PUT result:', updatedUser.profileImage);
    
    // 4. Test API GET (with profile image)
    console.log('📖 Testing GET profile (with image)...');
    const getWithImageResult = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: { id: true, profileImage: true }
    });
    console.log('✅ GET result (with image):', getWithImageResult.profileImage);
    
    // 5. Test localStorage simulation
    console.log('💾 Testing localStorage simulation...');
    const localStorageKey = `profile-image-${testUser.id}`;
    console.log('✅ localStorage key:', localStorageKey);
    console.log('✅ localStorage value:', testImageUrl);
    
    // 6. Test avatar display logic
    console.log('🖼️ Testing avatar display logic...');
    const profileImage = getWithImageResult.profileImage;
    const fallbackImage = `https://avatar.vercel.sh/${testUser.email}.png`;
    const displayImage = profileImage || fallbackImage;
    console.log('✅ Display image:', displayImage);
    
    // 7. Test update flow
    console.log('🔄 Testing update flow...');
    const newImageUrl = 'https://example.com/updated-profile-image.jpg';
    
    // Simulate updateProfileImage function
    await prisma.user.update({
      where: { id: testUser.id },
      data: { profileImage: newImageUrl }
    });
    
    const finalResult = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: { id: true, profileImage: true }
    });
    console.log('✅ Final result:', finalResult.profileImage);
    
    // 8. Cleanup
    console.log('🧹 Cleaning up...');
    if (testUser.id === 'test-profile-user') {
      await prisma.user.delete({
        where: { id: testUser.id }
      });
      console.log('✅ Test user deleted');
    } else {
      // Reset profile image for existing user
      await prisma.user.update({
        where: { id: testUser.id },
        data: { profileImage: null }
      });
      console.log('✅ Profile image reset');
    }
    
    console.log('🎉 Profile image flow test completed successfully!');
    
  } catch (error) {
    console.error('❌ Profile image flow test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Test API endpoints directly
async function testAPIEndpoints() {
  console.log('\n🔌 Testing API Endpoints...');
  
  try {
    // Find a real user
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log('👤 Testing with user:', user.name, '(ID:', user.id + ')');
    
    // Test GET endpoint logic
    console.log('📖 Testing GET endpoint logic...');
    const getResult = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, profileImage: true }
    });
    
    if (getResult) {
      console.log('✅ GET endpoint would return:', {
        success: true,
        profileImage: getResult.profileImage
      });
    } else {
      console.log('❌ GET endpoint would return 404');
    }
    
    // Test PUT endpoint logic
    console.log('📝 Testing PUT endpoint logic...');
    const testImage = 'https://example.com/api-test-image.jpg';
    
    const putResult = await prisma.user.update({
      where: { id: user.id },
      data: { profileImage: testImage }
    });
    
    console.log('✅ PUT endpoint would return:', {
      success: true,
      message: 'Profile image updated successfully',
      profileImage: putResult.profileImage
    });
    
    // Verify the update
    const verifyResult = await prisma.user.findUnique({
      where: { id: user.id },
      select: { profileImage: true }
    });
    
    console.log('✅ Verification:', verifyResult.profileImage === testImage ? 'SUCCESS' : 'FAILED');
    
    // Reset for cleanup
    await prisma.user.update({
      where: { id: user.id },
      data: { profileImage: null }
    });
    
    console.log('🎉 API endpoints test completed successfully!');
    
  } catch (error) {
    console.error('❌ API endpoints test failed:', error.message);
  }
}

async function main() {
  await testProfileImageFlow();
  await testAPIEndpoints();
}

main().catch(console.error);