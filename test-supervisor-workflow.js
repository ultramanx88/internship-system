const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Test data
const testData = {
  applicationId: 'app_123', // ต้องมี Application ที่มี supervisorAssigned = true
  supervisorId: 'supervisor_1'
};

async function testSupervisorWorkflow() {
  console.log('🧪 เริ่มทดสอบ Supervisor Workflow...\n');

  try {
    // 1. ตรวจสอบรายการที่รออาจารย์นิเทศรับมอบหมาย
    console.log('1️⃣ ตรวจสอบรายการที่รออาจารย์นิเทศรับมอบหมาย...');
    const pendingAssignmentsResponse = await fetch(`${BASE_URL}/api/supervisor/workflow?action=pending_assignments`, {
      headers: {
        'x-user-id': testData.supervisorId
      }
    });

    const pendingAssignmentsResult = await pendingAssignmentsResponse.json();
    console.log('✅ รายการรอมอบหมาย:', pendingAssignmentsResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    console.log('📊 จำนวนรายการ:', pendingAssignmentsResult.applications?.length || 0);
    console.log('');

    if (pendingAssignmentsResult.applications && pendingAssignmentsResult.applications.length > 0) {
      testData.applicationId = pendingAssignmentsResult.applications[0].id;
      console.log('📄 ใช้ Application ID:', testData.applicationId);
    }

    // 2. อาจารย์นิเทศรับมอบหมาย
    console.log('2️⃣ อาจารย์นิเทศรับมอบหมาย...');
    const receiveResponse = await fetch(`${BASE_URL}/api/supervisor/workflow/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': testData.supervisorId
      },
      body: JSON.stringify({
        applicationId: testData.applicationId,
        action: 'receive_assignment',
        notes: 'รับมอบหมายจากอาจารย์ประจำวิชาเรียบร้อย'
      })
    });

    const receiveResult = await receiveResponse.json();
    console.log('✅ รับมอบหมาย:', receiveResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    console.log('📝 Message:', receiveResult.message);
    console.log('');

    // 3. ตรวจสอบสถานะ Supervisor Workflow
    console.log('3️⃣ ตรวจสอบสถานะ Supervisor Workflow...');
    const statusResponse = await fetch(`${BASE_URL}/api/supervisor/workflow?action=status&applicationId=${testData.applicationId}`, {
      headers: {
        'x-user-id': testData.supervisorId
      }
    });

    const statusResult = await statusResponse.json();
    console.log('✅ ตรวจสอบสถานะ:', statusResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    if (statusResult.success) {
      console.log('📈 Current Step:', statusResult.workflowStatus.currentStep);
      console.log('📊 Supervisor Received:', statusResult.workflowStatus.supervisorReceived);
      console.log('📊 Supervisor Confirmed:', statusResult.workflowStatus.supervisorConfirmed);
      console.log('📊 Appointment Scheduled:', statusResult.workflowStatus.appointmentScheduled);
    }
    console.log('');

    // 4. อาจารย์นิเทศตรวจดูและยืนยัน
    console.log('4️⃣ อาจารย์นิเทศตรวจดูและยืนยัน...');
    const confirmResponse = await fetch(`${BASE_URL}/api/supervisor/workflow/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': testData.supervisorId
      },
      body: JSON.stringify({
        applicationId: testData.applicationId,
        action: 'confirm_assignment',
        notes: 'ตรวจดูรายละเอียดและยืนยันการรับมอบหมายเรียบร้อย'
      })
    });

    const confirmResult = await confirmResponse.json();
    console.log('✅ ตรวจดูและยืนยัน:', confirmResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    console.log('📝 Message:', confirmResult.message);
    console.log('');

    // 5. อาจารย์นิเทศนัดหมายนิเทศ
    console.log('5️⃣ อาจารย์นิเทศนัดหมายนิเทศ...');
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 7); // นัดหมายในอีก 7 วัน
    
    const scheduleResponse = await fetch(`${BASE_URL}/api/supervisor/workflow/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': testData.supervisorId
      },
      body: JSON.stringify({
        applicationId: testData.applicationId,
        action: 'schedule_appointment',
        appointmentDate: appointmentDate.toISOString(),
        appointmentLocation: 'ห้องประชุมคณะวิศวกรรมศาสตร์',
        notes: 'นัดหมายนิเทศกับนักศึกษาเรียบร้อย'
      })
    });

    const scheduleResult = await scheduleResponse.json();
    console.log('✅ นัดหมายนิเทศ:', scheduleResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    console.log('📝 Message:', scheduleResult.message);
    console.log('');

    // 6. ตรวจสอบสถานะสุดท้าย
    console.log('6️⃣ ตรวจสอบสถานะสุดท้าย...');
    const finalStatusResponse = await fetch(`${BASE_URL}/api/supervisor/workflow?action=status&applicationId=${testData.applicationId}`, {
      headers: {
        'x-user-id': testData.supervisorId
      }
    });

    const finalStatusResult = await finalStatusResponse.json();
    console.log('✅ สถานะสุดท้าย:', finalStatusResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    if (finalStatusResult.success) {
      console.log('📈 Current Step:', finalStatusResult.workflowStatus.currentStep);
      console.log('📊 Supervisor Received:', finalStatusResult.workflowStatus.supervisorReceived);
      console.log('📊 Supervisor Confirmed:', finalStatusResult.workflowStatus.supervisorConfirmed);
      console.log('📊 Appointment Scheduled:', finalStatusResult.workflowStatus.appointmentScheduled);
      console.log('📊 Is Completed:', finalStatusResult.workflowStatus.isCompleted);
    }

    console.log('\n🎉 การทดสอบ Supervisor Workflow เสร็จสิ้น!');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการทดสอบ:', error);
  }
}

// รันการทดสอบ
testSupervisorWorkflow();
