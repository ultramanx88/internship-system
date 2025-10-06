const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Test data
const testData = {
  applicationId: 'app_123', // ต้องมี Application ที่มี staffReviewed = true
  staffId: 'staff_1'
};

async function testStaffWorkflow() {
  console.log('🧪 เริ่มทดสอบ Staff Workflow...\n');

  try {
    // 1. ตรวจสอบรายการที่รอรับเอกสาร
    console.log('1️⃣ ตรวจสอบรายการที่รอรับเอกสาร...');
    const pendingReceiptResponse = await fetch(`${BASE_URL}/api/staff/workflow?action=pending_receipt`, {
      headers: {
        'x-user-id': testData.staffId
      }
    });

    const pendingReceiptResult = await pendingReceiptResponse.json();
    console.log('✅ รายการรอรับเอกสาร:', pendingReceiptResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    console.log('📊 จำนวนรายการ:', pendingReceiptResult.applications?.length || 0);
    console.log('');

    if (pendingReceiptResult.applications && pendingReceiptResult.applications.length > 0) {
      testData.applicationId = pendingReceiptResult.applications[0].id;
      console.log('📄 ใช้ Application ID:', testData.applicationId);
    }

    // 2. Staff รับเอกสาร
    console.log('2️⃣ Staff รับเอกสาร...');
    const receiveResponse = await fetch(`${BASE_URL}/api/staff/workflow/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': testData.staffId
      },
      body: JSON.stringify({
        applicationId: testData.applicationId,
        action: 'receive_document',
        notes: 'รับเอกสารจาก Student เรียบร้อย'
      })
    });

    const receiveResult = await receiveResponse.json();
    console.log('✅ รับเอกสาร:', receiveResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    console.log('📝 Message:', receiveResult.message);
    console.log('');

    // 3. ตรวจสอบสถานะ Staff Workflow
    console.log('3️⃣ ตรวจสอบสถานะ Staff Workflow...');
    const statusResponse = await fetch(`${BASE_URL}/api/staff/workflow?action=status&applicationId=${testData.applicationId}`, {
      headers: {
        'x-user-id': testData.staffId
      }
    });

    const statusResult = await statusResponse.json();
    console.log('✅ ตรวจสอบสถานะ:', statusResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    if (statusResult.success) {
      console.log('📈 Current Step:', statusResult.workflowStatus.currentStep);
      console.log('📊 Document Received:', statusResult.workflowStatus.documentReceived);
      console.log('📊 Document Reviewed:', statusResult.workflowStatus.documentReviewed);
      console.log('📊 Document Approved:', statusResult.workflowStatus.documentApproved);
      console.log('📊 Document Sent to Company:', statusResult.workflowStatus.documentSentToCompany);
    }
    console.log('');

    // 4. Staff ตรวจเอกสาร
    console.log('4️⃣ Staff ตรวจเอกสาร...');
    const reviewResponse = await fetch(`${BASE_URL}/api/staff/workflow/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': testData.staffId
      },
      body: JSON.stringify({
        applicationId: testData.applicationId,
        action: 'review_document',
        notes: 'ตรวจเอกสารเรียบร้อย ข้อมูลครบถ้วน'
      })
    });

    const reviewResult = await reviewResponse.json();
    console.log('✅ ตรวจเอกสาร:', reviewResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    console.log('📝 Message:', reviewResult.message);
    console.log('');

    // 5. Staff อนุมัติเอกสาร
    console.log('5️⃣ Staff อนุมัติเอกสาร...');
    const approveResponse = await fetch(`${BASE_URL}/api/staff/workflow/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': testData.staffId
      },
      body: JSON.stringify({
        applicationId: testData.applicationId,
        action: 'approve_document',
        notes: 'อนุมัติเอกสารเรียบร้อย พร้อมส่งให้บริษัท'
      })
    });

    const approveResult = await approveResponse.json();
    console.log('✅ อนุมัติเอกสาร:', approveResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    console.log('📝 Message:', approveResult.message);
    console.log('');

    // 6. Staff ส่งเอกสารให้บริษัท
    console.log('6️⃣ Staff ส่งเอกสารให้บริษัท...');
    const sendResponse = await fetch(`${BASE_URL}/api/staff/workflow/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': testData.staffId
      },
      body: JSON.stringify({
        applicationId: testData.applicationId,
        action: 'send_to_company',
        notes: 'ส่งเอกสารให้บริษัทเรียบร้อย'
      })
    });

    const sendResult = await sendResponse.json();
    console.log('✅ ส่งเอกสารให้บริษัท:', sendResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    console.log('📝 Message:', sendResult.message);
    console.log('');

    // 7. ตรวจสอบสถานะสุดท้าย
    console.log('7️⃣ ตรวจสอบสถานะสุดท้าย...');
    const finalStatusResponse = await fetch(`${BASE_URL}/api/staff/workflow?action=status&applicationId=${testData.applicationId}`, {
      headers: {
        'x-user-id': testData.staffId
      }
    });

    const finalStatusResult = await finalStatusResponse.json();
    console.log('✅ สถานะสุดท้าย:', finalStatusResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    if (finalStatusResult.success) {
      console.log('📈 Current Step:', finalStatusResult.workflowStatus.currentStep);
      console.log('📊 Document Received:', finalStatusResult.workflowStatus.documentReceived);
      console.log('📊 Document Reviewed:', finalStatusResult.workflowStatus.documentReviewed);
      console.log('📊 Document Approved:', finalStatusResult.workflowStatus.documentApproved);
      console.log('📊 Document Sent to Company:', finalStatusResult.workflowStatus.documentSentToCompany);
      console.log('📊 Is Completed:', finalStatusResult.workflowStatus.isCompleted);
    }

    console.log('\n🎉 การทดสอบ Staff Workflow เสร็จสิ้น!');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการทดสอบ:', error);
  }
}

// รันการทดสอบ
testStaffWorkflow();
