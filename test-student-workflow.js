const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Test data
const testData = {
  studentId: 's6800001',
  internshipId: 'internship_1',
  projectTopic: 'การพัฒนาระบบจัดการฝึกงานด้วย Next.js',
  feedback: 'สนใจในเทคโนโลยี Web Development'
};

async function testStudentWorkflow() {
  console.log('🧪 เริ่มทดสอบ Student Workflow...\n');

  try {
    // 1. ตรวจสอบสิทธิ์การขอฝึกงาน
    console.log('1️⃣ ตรวจสอบสิทธิ์การขอฝึกงาน...');
    const eligibilityResponse = await fetch(`${BASE_URL}/api/student/workflow?action=eligibility&studentId=${testData.studentId}`, {
      headers: {
        'x-user-id': testData.studentId
      }
    });

    const eligibilityResult = await eligibilityResponse.json();
    console.log('✅ ตรวจสอบสิทธิ์:', eligibilityResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    console.log('📊 Profile Complete:', eligibilityResult.profileComplete);
    console.log('📊 Can Submit Application:', eligibilityResult.canSubmitApplication);
    console.log('📝 Message:', eligibilityResult.message);
    console.log('');

    if (!eligibilityResult.success || !eligibilityResult.canSubmitApplication) {
      console.log('❌ นักศึกษาไม่สามารถขอฝึกงานได้:', eligibilityResult.message);
      return;
    }

    // 2. สร้างคำขอฝึกงาน
    console.log('2️⃣ สร้างคำขอฝึกงาน...');
    const createResponse = await fetch(`${BASE_URL}/api/student/workflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': testData.studentId
      },
      body: JSON.stringify({
        internshipId: testData.internshipId,
        projectTopic: testData.projectTopic,
        feedback: testData.feedback
      })
    });

    const createResult = await createResponse.json();
    console.log('✅ สร้างคำขอ:', createResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    console.log('📄 Application ID:', createResult.application?.id);
    console.log('📊 Status:', createResult.application?.status);
    console.log('📊 Student Workflow Step:', createResult.application?.studentWorkflowStep);
    console.log('📊 Profile Complete:', createResult.application?.studentProfileComplete);
    console.log('📊 Application Submitted:', createResult.application?.applicationSubmitted);
    console.log('📊 Staff Reviewed:', createResult.application?.staffReviewed);
    console.log('');

    if (!createResult.success) {
      console.log('❌ ไม่สามารถสร้างคำขอได้:', createResult.error);
      return;
    }

    const applicationId = createResult.application.id;

    // 3. ตรวจสอบสถานะ Workflow
    console.log('3️⃣ ตรวจสอบสถานะ Workflow...');
    const statusResponse = await fetch(`${BASE_URL}/api/student/workflow?action=status&applicationId=${applicationId}`, {
      headers: {
        'x-user-id': testData.studentId
      }
    });

    const statusResult = await statusResponse.json();
    console.log('✅ ตรวจสอบสถานะ:', statusResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    if (statusResult.success) {
      console.log('📈 Current Step:', statusResult.workflowStatus.currentStep);
      console.log('📊 Profile Complete:', statusResult.workflowStatus.profileComplete);
      console.log('📊 Application Submitted:', statusResult.workflowStatus.applicationSubmitted);
      console.log('📊 Staff Reviewed:', statusResult.workflowStatus.staffReviewed);
      console.log('📊 Can Submit Application:', statusResult.workflowStatus.canSubmitApplication);
      console.log('📊 Is Completed:', statusResult.workflowStatus.isCompleted);
    }
    console.log('');

    // 4. Staff ตรวจสอบคำขอ
    console.log('4️⃣ Staff ตรวจสอบคำขอ...');
    const staffReviewResponse = await fetch(`${BASE_URL}/api/staff/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'staff_1' // Staff ID
      },
      body: JSON.stringify({
        applicationId: applicationId,
        status: 'approved',
        feedback: 'เอกสารครบถ้วน โครงการเหมาะสม สามารถดำเนินการได้'
      })
    });

    const staffReviewResult = await staffReviewResponse.json();
    console.log('✅ Staff Review:', staffReviewResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    console.log('📝 Message:', staffReviewResult.message);
    console.log('📊 Staff Reviewed:', staffReviewResult.application?.staffReviewed);
    console.log('📊 Staff Feedback:', staffReviewResult.application?.staffFeedback);
    console.log('📊 Student Workflow Step:', staffReviewResult.application?.studentWorkflowStep);
    console.log('');

    // 5. ตรวจสอบสถานะสุดท้าย
    console.log('5️⃣ ตรวจสอบสถานะสุดท้าย...');
    const finalStatusResponse = await fetch(`${BASE_URL}/api/student/workflow?action=status&applicationId=${applicationId}`, {
      headers: {
        'x-user-id': testData.studentId
      }
    });

    const finalStatusResult = await finalStatusResponse.json();
    console.log('✅ สถานะสุดท้าย:', finalStatusResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    if (finalStatusResult.success) {
      console.log('📈 Current Step:', finalStatusResult.workflowStatus.currentStep);
      console.log('📊 Profile Complete:', finalStatusResult.workflowStatus.profileComplete);
      console.log('📊 Application Submitted:', finalStatusResult.workflowStatus.applicationSubmitted);
      console.log('📊 Staff Reviewed:', finalStatusResult.workflowStatus.staffReviewed);
      console.log('📊 Is Completed:', finalStatusResult.workflowStatus.isCompleted);
    }

    console.log('\n🎉 การทดสอบ Student Workflow เสร็จสิ้น!');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการทดสอบ:', error);
  }
}

// รันการทดสอบ
testStudentWorkflow();
