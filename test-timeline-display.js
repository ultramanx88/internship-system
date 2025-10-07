const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTimelineDisplay() {
  try {
    console.log('🧪 ทดสอบการแสดงผล Timeline...\n');

    const studentId = 'u6800001';
    
    // 1. ตรวจสอบข้อมูลนักศึกษา
    console.log('1️⃣ ตรวจสอบข้อมูลนักศึกษา...');
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        email: true,
        t_name: true,
        t_surname: true,
        t_title: true,
        phone: true,
        majorId: true,
        departmentId: true,
        facultyId: true,
        curriculumId: true
      }
    });

    if (!student) {
      console.log('❌ ไม่พบนักศึกษา');
      return;
    }

    // ตรวจสอบการลงทะเบียนข้อมูลนักศึกษา
    const studentRegistered = student.name && student.email && student.phone && 
                            student.t_name && student.t_surname && 
                            student.facultyId && student.majorId;
    
    console.log('✅ ข้อมูลนักศึกษา:', studentRegistered ? 'ครบถ้วน' : 'ไม่ครบถ้วน');
    console.log(`   - Name: ${student.name || '❌'}`);
    console.log(`   - Email: ${student.email || '❌'}`);
    console.log(`   - Phone: ${student.phone || '❌'}`);
    console.log(`   - T Name: ${student.t_name || '❌'}`);
    console.log(`   - T Surname: ${student.t_surname || '❌'}`);
    console.log(`   - Faculty ID: ${student.facultyId || '❌'}`);
    console.log(`   - Major ID: ${student.majorId || '❌'}\n`);

    // 2. ตรวจสอบคำขอฝึกงาน
    console.log('2️⃣ ตรวจสอบคำขอฝึกงาน...');
    const applications = await prisma.application.findMany({
      where: { studentId },
      select: {
        id: true,
        status: true,
        dateApplied: true,
        projectTopic: true,
        feedback: true
      }
    });

    console.log(`✅ พบคำขอฝึกงาน: ${applications.length} รายการ`);
    applications.forEach((app, index) => {
      console.log(`   ${index + 1}. ID: ${app.id}`);
      console.log(`      Status: ${app.status}`);
      console.log(`      Date Applied: ${app.dateApplied}`);
      console.log(`      Project Topic: ${app.projectTopic || 'ไม่มี'}`);
    });
    console.log('');

    // 3. ตรวจสอบสถานะการฝึกงาน
    console.log('3️⃣ ตรวจสอบสถานะการฝึกงาน...');
    const hasApplied = applications.length > 0;
    const hasPending = applications.some(app => app.status === 'pending');
    const hasApproved = applications.some(app => app.status === 'approved');
    const hasCompleted = applications.some(app => app.status === 'completed');

    console.log(`✅ Has Applied: ${hasApplied}`);
    console.log(`✅ Has Pending: ${hasPending}`);
    console.log(`✅ Has Approved: ${hasApproved}`);
    console.log(`✅ Has Completed: ${hasCompleted}\n`);

    // 4. สร้างไทม์ไลน์ตามสถานะ
    console.log('4️⃣ สร้างไทม์ไลน์ตามสถานะ...');
    const steps = [
      {
        step: 1,
        title: 'ลงทะเบียนข้อมูลนักศึกษา',
        status: studentRegistered ? 'completed' : 'current',
        isEditable: !studentRegistered,
        buttonText: studentRegistered ? 'บันทึกแล้ว' : 'กรอกข้อมูล',
        description: 'กรอกข้อมูลส่วนตัวและติดต่อ'
      },
      {
        step: 2,
        title: 'กรอกข้อมูลสหกิจศึกษาหรือฝึกงาน',
        status: hasApplied ? (hasPending ? 'current' : 'completed') : (studentRegistered ? 'current' : 'upcoming'),
        isEditable: studentRegistered && !hasApplied,
        buttonText: hasApplied ? (hasPending ? 'รอการตรวจสอบ' : 'บันทึกแล้ว') : (studentRegistered ? 'ดำเนินการ' : 'รอการลงทะเบียน'),
        description: hasApplied ? (hasPending ? 'คำขอของคุณอยู่ระหว่างการตรวจสอบ' : 'เลือกประเภทการฝึกงานและบริษัทที่ต้องการ') : 'เลือกประเภทการฝึกงานและบริษัทที่ต้องการ'
      },
      {
        step: 3,
        title: 'ยื่นเอกสารให้กับทางบริษัท',
        status: hasApproved ? 'completed' : (hasApplied ? (hasPending ? 'upcoming' : 'current') : 'upcoming'),
        isEditable: hasApplied && !hasApproved && !hasPending,
        buttonText: hasApproved ? 'ส่งแล้ว' : (hasApplied ? (hasPending ? 'รอการอนุมัติ' : 'ดำเนินการ') : 'รอการสมัคร'),
        description: hasApplied ? (hasPending ? 'รอการอนุมัติจากเจ้าหน้าที่' : 'ส่งเอกสารที่จำเป็นให้บริษัท') : 'ส่งเอกสารที่จำเป็นให้บริษัท'
      },
      {
        step: 4,
        title: 'ช่วงสหกิจศึกษา / ฝึกงาน',
        status: hasCompleted ? 'completed' : (hasApproved ? 'current' : 'upcoming'),
        isEditable: hasApproved && !hasCompleted,
        buttonText: hasCompleted ? 'เสร็จสิ้น' : (hasApproved ? 'กำลังฝึกงาน' : 'รอการอนุมัติ'),
        description: 'ปฏิบัติงานตามที่ได้รับมอบหมาย'
      },
      {
        step: 5,
        title: 'กรอกหัวข้อโปรเจกต์',
        status: hasCompleted ? 'current' : 'upcoming',
        isEditable: hasCompleted,
        buttonText: hasCompleted ? 'กรอกหัวข้อ' : 'รอการฝึกงาน',
        description: 'สรุปผลงานและหัวข้อโปรเจกต์'
      }
    ];

    console.log('📋 Timeline Steps:');
    steps.forEach(step => {
      const statusIcon = step.status === 'completed' ? '✅' : 
                        step.status === 'current' ? '🔄' : '⏳';
      console.log(`   ${statusIcon} Step ${step.step}: ${step.title}`);
      console.log(`      Status: ${step.status}`);
      console.log(`      Button: ${step.buttonText}`);
      console.log(`      Description: ${step.description}`);
      console.log(`      Editable: ${step.isEditable ? 'Yes' : 'No'}`);
      console.log('');
    });

    // 5. ตรวจสอบขั้นตอนปัจจุบัน
    console.log('5️⃣ ตรวจสอบขั้นตอนปัจจุบัน...');
    const currentStep = steps.find(step => step.status === 'current');
    if (currentStep) {
      console.log(`✅ ขั้นตอนปัจจุบัน: Step ${currentStep.step} - ${currentStep.title}`);
      console.log(`   Button Text: ${currentStep.buttonText}`);
      console.log(`   Description: ${currentStep.description}`);
    } else {
      console.log('❌ ไม่พบขั้นตอนปัจจุบัน');
    }

    console.log('\n🎉 การทดสอบ Timeline เสร็จสิ้น!');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTimelineDisplay();
