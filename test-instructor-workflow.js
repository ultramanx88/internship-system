const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Test data
const testData = {
  applicationId: 'app_123', // ต้องมี Application ที่มี staffReviewed = true
  instructorId: 'instructor_1'
};

async function testInstructorWorkflow() {
  console.log('🧪 เริ่มทดสอบ Instructor Workflow...\n');

  try {
    // 1. ตรวจสอบรายการที่รออาจารย์ประจำวิชารับ
    console.log('1️⃣ ตรวจสอบรายการที่รออาจารย์ประจำวิชารับ...');
    const pendingReceiptResponse = await fetch(`${BASE_URL}/api/instructor/workflow?action=pending_receipt`, {
      headers: {
        'x-user-id': testData.instructorId
      }
    });

    const pendingReceiptResult = await pendingReceiptResponse.json();
    console.log('✅ รายการรอรับคำขอ:', pendingReceiptResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    console.log('📊 จำนวนรายการ:', pendingReceiptResult.applications?.length || 0);
    console.log('');

    if (pendingReceiptResult.applications && pendingReceiptResult.applications.length > 0) {
      testData.applicationId = pendingReceiptResult.applications[0].id;
      console.log('📄 ใช้ Application ID:', testData.applicationId);
    }

    // 2. อาจารย์ประจำวิชารับคำขอ
    console.log('2️⃣ อาจารย์ประจำวิชารับคำขอ...');
    const receiveResponse = await fetch(`${BASE_URL}/api/instructor/workflow/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': testData.instructorId
      },
      body: JSON.stringify({
        applicationId: testData.applicationId,
        action: 'receive_application',
        feedback: 'รับคำขอฝึกงานจาก Student เรียบร้อย'
      })
    });

    const receiveResult = await receiveResponse.json();
    console.log('✅ รับคำขอ:', receiveResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    console.log('📝 Message:', receiveResult.message);
    console.log('');

    // 3. ตรวจสอบสถานะ Instructor Workflow
    console.log('3️⃣ ตรวจสอบสถานะ Instructor Workflow...');
    const statusResponse = await fetch(`${BASE_URL}/api/instructor/workflow?action=status&applicationId=${testData.applicationId}`, {
      headers: {
        'x-user-id': testData.instructorId
      }
    });

    const statusResult = await statusResponse.json();
    console.log('✅ ตรวจสอบสถานะ:', statusResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    if (statusResult.success) {
      console.log('📈 Current Step:', statusResult.workflowStatus.currentStep);
      console.log('📊 Instructor Received:', statusResult.workflowStatus.instructorReceived);
      console.log('📊 Instructor Reviewed:', statusResult.workflowStatus.instructorReviewed);
      console.log('📊 Supervisor Assigned:', statusResult.workflowStatus.supervisorAssigned);
    }
    console.log('');

    // 4. อาจารย์ประจำวิชาพิจารณา (อนุมัติ)
    console.log('4️⃣ อาจารย์ประจำวิชาพิจารณา (อนุมัติ)...');
    const reviewResponse = await fetch(`${BASE_URL}/api/instructor/workflow/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': testData.instructorId
      },
      body: JSON.stringify({
        applicationId: testData.applicationId,
        action: 'review_application',
        status: 'approved',
        feedback: 'อนุมัติคำขอฝึกงาน โครงการเหมาะสม สามารถดำเนินการได้'
      })
    });

    const reviewResult = await reviewResponse.json();
    console.log('✅ พิจารณา (อนุมัติ):', reviewResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    console.log('📝 Message:', reviewResult.message);
    console.log('');

    // 5. ตรวจสอบสถานะสุดท้าย
    console.log('5️⃣ ตรวจสอบสถานะสุดท้าย...');
    const finalStatusResponse = await fetch(`${BASE_URL}/api/instructor/workflow?action=status&applicationId=${testData.applicationId}`, {
      headers: {
        'x-user-id': testData.instructorId
      }
    });

    const finalStatusResult = await finalStatusResponse.json();
    console.log('✅ สถานะสุดท้าย:', finalStatusResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    if (finalStatusResult.success) {
      console.log('📈 Current Step:', finalStatusResult.workflowStatus.currentStep);
      console.log('📊 Instructor Received:', finalStatusResult.workflowStatus.instructorReceived);
      console.log('📊 Instructor Reviewed:', finalStatusResult.workflowStatus.instructorReviewed);
      console.log('📊 Supervisor Assigned:', finalStatusResult.workflowStatus.supervisorAssigned);
      console.log('📊 Is Completed:', finalStatusResult.workflowStatus.isCompleted);
    }

    console.log('\n🎉 การทดสอบ Instructor Workflow เสร็จสิ้น!');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการทดสอบ:', error);
  }
}

// รันการทดสอบ
testInstructorWorkflow();
