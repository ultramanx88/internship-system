const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Test data
const testData = {
  applicationId: 'app_123', // ต้องมี Application ที่มี courseInstructorStatus = 'approved'
  committeeId: 'committee_1'
};

async function testCommitteeWorkflow() {
  console.log('🧪 เริ่มทดสอบ Committee Workflow...\n');

  try {
    // 1. ตรวจสอบรายการที่รอกรรมการรับ
    console.log('1️⃣ ตรวจสอบรายการที่รอกรรมการรับ...');
    const pendingReceiptResponse = await fetch(`${BASE_URL}/api/committee/workflow?action=pending_receipt`, {
      headers: {
        'x-user-id': testData.committeeId
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

    // 2. กรรมการรับคำขอ
    console.log('2️⃣ กรรมการรับคำขอ...');
    const receiveResponse = await fetch(`${BASE_URL}/api/committee/workflow/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': testData.committeeId
      },
      body: JSON.stringify({
        applicationId: testData.applicationId,
        action: 'receive_application',
        feedback: 'รับคำขอฝึกงานหลังจากอาจารย์ประจำวิชาอนุมัติเรียบร้อย'
      })
    });

    const receiveResult = await receiveResponse.json();
    console.log('✅ รับคำขอ:', receiveResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    console.log('📝 Message:', receiveResult.message);
    console.log('');

    // 3. ตรวจสอบสถานะ Committee Workflow
    console.log('3️⃣ ตรวจสอบสถานะ Committee Workflow...');
    const statusResponse = await fetch(`${BASE_URL}/api/committee/workflow?action=status&applicationId=${testData.applicationId}`, {
      headers: {
        'x-user-id': testData.committeeId
      }
    });

    const statusResult = await statusResponse.json();
    console.log('✅ ตรวจสอบสถานะ:', statusResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    if (statusResult.success) {
      console.log('📈 Current Step:', statusResult.workflowStatus.currentStep);
      console.log('📊 Committee Received:', statusResult.workflowStatus.committeeReceived);
      console.log('📊 Committee Reviewed:', statusResult.workflowStatus.committeeReviewed);
    }
    console.log('');

    // 4. กรรมการพิจารณา (อนุมัติ)
    console.log('4️⃣ กรรมการพิจารณา (อนุมัติ)...');
    const reviewResponse = await fetch(`${BASE_URL}/api/committee/workflow/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': testData.committeeId
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
    const finalStatusResponse = await fetch(`${BASE_URL}/api/committee/workflow?action=status&applicationId=${testData.applicationId}`, {
      headers: {
        'x-user-id': testData.committeeId
      }
    });

    const finalStatusResult = await finalStatusResponse.json();
    console.log('✅ สถานะสุดท้าย:', finalStatusResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    if (finalStatusResult.success) {
      console.log('📈 Current Step:', finalStatusResult.workflowStatus.currentStep);
      console.log('📊 Committee Received:', finalStatusResult.workflowStatus.committeeReceived);
      console.log('📊 Committee Reviewed:', finalStatusResult.workflowStatus.committeeReviewed);
      console.log('📊 Is Completed:', finalStatusResult.workflowStatus.isCompleted);
    }

    // 6. ตรวจสอบรายการการอนุมัติ
    console.log('6️⃣ ตรวจสอบรายการการอนุมัติ...');
    const approvalsResponse = await fetch(`${BASE_URL}/api/committee/workflow?action=approvals`, {
      headers: {
        'x-user-id': testData.committeeId
      }
    });

    const approvalsResult = await approvalsResponse.json();
    console.log('✅ รายการการอนุมัติ:', approvalsResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    console.log('📊 จำนวนรายการ:', approvalsResult.approvals?.length || 0);

    console.log('\n🎉 การทดสอบ Committee Workflow เสร็จสิ้น!');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการทดสอบ:', error);
  }
}

// รันการทดสอบ
testCommitteeWorkflow();
