const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Test data
const testData = {
  studentId: 's6800001',
  internshipId: 'internship_1',
  projectTopic: 'การพัฒนาระบบจัดการฝึกงาน',
  feedback: 'โครงการน่าสนใจ'
};

async function testWorkflow() {
  console.log('🧪 เริ่มทดสอบ Application Workflow...\n');

  try {
    // 1. สร้าง Application ใหม่
    console.log('1️⃣ สร้าง Application ใหม่...');
    const createResponse = await fetch(`${BASE_URL}/api/applications/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 's6800001' // Student ID
      },
      body: JSON.stringify(testData)
    });

    const createResult = await createResponse.json();
    console.log('✅ สร้าง Application:', createResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    console.log('📄 Application ID:', createResult.application?.id);
    console.log('📊 Status:', createResult.application?.status);
    console.log('👨‍🏫 Course Instructor:', createResult.application?.courseInstructor?.name);
    console.log('');

    if (!createResult.success) {
      console.log('❌ ไม่สามารถสร้าง Application ได้:', createResult.error);
      return;
    }

    const applicationId = createResult.application.id;

    // 2. ตรวจสอบ Workflow Status
    console.log('2️⃣ ตรวจสอบ Workflow Status...');
    const statusResponse = await fetch(`${BASE_URL}/api/applications/${applicationId}/workflow`, {
      headers: {
        'x-user-id': 's6800001'
      }
    });

    const statusResult = await statusResponse.json();
    console.log('✅ Workflow Status:', statusResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    if (statusResult.success) {
      console.log('📈 Current Step:', statusResult.workflowStatus.currentStep);
      console.log('👨‍🏫 Course Instructor Status:', statusResult.workflowStatus.courseInstructorStatus);
      console.log('👨‍💼 Supervisor Status:', statusResult.workflowStatus.supervisorStatus);
      console.log('👥 Committee Status:', statusResult.workflowStatus.committeeStatus);
    }
    console.log('');

    // 3. อาจารย์ประจำวิชาพิจารณา (อนุมัติ)
    console.log('3️⃣ อาจารย์ประจำวิชาพิจารณา (อนุมัติ)...');
    const courseInstructorResponse = await fetch(`${BASE_URL}/api/applications/${applicationId}/workflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'instructor_1' // Course Instructor ID
      },
      body: JSON.stringify({
        status: 'approved',
        feedback: 'โครงการเหมาะสม สามารถดำเนินการได้'
      })
    });

    const courseInstructorResult = await courseInstructorResponse.json();
    console.log('✅ Course Instructor Review:', courseInstructorResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    console.log('📝 Message:', courseInstructorResult.message);
    console.log('');

    // 4. ตรวจสอบ Workflow Status หลังอาจารย์ประจำวิชาพิจารณา
    console.log('4️⃣ ตรวจสอบ Workflow Status หลังอาจารย์ประจำวิชาพิจารณา...');
    const statusResponse2 = await fetch(`${BASE_URL}/api/applications/${applicationId}/workflow`, {
      headers: {
        'x-user-id': 's6800001'
      }
    });

    const statusResult2 = await statusResponse2.json();
    console.log('✅ Workflow Status:', statusResult2.success ? 'สำเร็จ' : 'ล้มเหลว');
    if (statusResult2.success) {
      console.log('📈 Current Step:', statusResult2.workflowStatus.currentStep);
      console.log('👨‍🏫 Course Instructor Status:', statusResult2.workflowStatus.courseInstructorStatus);
      console.log('👨‍💼 Supervisor Status:', statusResult2.workflowStatus.supervisorStatus);
      console.log('👥 Committee Status:', statusResult2.workflowStatus.committeeStatus);
    }
    console.log('');

    // 5. กรรมการพิจารณา (อนุมัติ)
    console.log('5️⃣ กรรมการพิจารณา (อนุมัติ)...');
    const committeeResponse = await fetch(`${BASE_URL}/api/applications/${applicationId}/workflow`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'committee_1' // Committee ID
      },
      body: JSON.stringify({
        status: 'approved',
        feedback: 'โครงการมีประโยชน์ เหมาะสมสำหรับการฝึกงาน'
      })
    });

    const committeeResult = await committeeResponse.json();
    console.log('✅ Committee Review:', committeeResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    console.log('📝 Message:', committeeResult.message);
    console.log('📊 Final Status:', committeeResult.finalStatus);
    console.log('📈 Approved Count:', committeeResult.approvedCount);
    console.log('📈 Total Count:', committeeResult.totalCount);
    console.log('');

    // 6. ตรวจสอบ Workflow Status สุดท้าย
    console.log('6️⃣ ตรวจสอบ Workflow Status สุดท้าย...');
    const finalStatusResponse = await fetch(`${BASE_URL}/api/applications/${applicationId}/workflow`, {
      headers: {
        'x-user-id': 's6800001'
      }
    });

    const finalStatusResult = await finalStatusResponse.json();
    console.log('✅ Final Workflow Status:', finalStatusResult.success ? 'สำเร็จ' : 'ล้มเหลว');
    if (finalStatusResult.success) {
      console.log('📈 Current Step:', finalStatusResult.workflowStatus.currentStep);
      console.log('👨‍🏫 Course Instructor Status:', finalStatusResult.workflowStatus.courseInstructorStatus);
      console.log('👨‍💼 Supervisor Status:', finalStatusResult.workflowStatus.supervisorStatus);
      console.log('👥 Committee Status:', finalStatusResult.workflowStatus.committeeStatus);
      console.log('✅ Is Completed:', finalStatusResult.workflowStatus.isCompleted);
      console.log('❌ Is Rejected:', finalStatusResult.workflowStatus.isRejected);
    }

    console.log('\n🎉 การทดสอบ Workflow เสร็จสิ้น!');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการทดสอบ:', error);
  }
}

// รันการทดสอบ
testWorkflow();
