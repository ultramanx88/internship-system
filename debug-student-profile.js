const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugStudentProfile(studentId) {
  try {
    console.log(`🔍 ตรวจสอบข้อมูลนักศึกษา: ${studentId}\n`);

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        email: true,
        t_name: true,
        e_name: true,
        t_surname: true,
        e_surname: true,
        t_title: true,
        e_title: true,
        phone: true,
        profileImage: true,
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

    console.log('📊 ข้อมูลปัจจุบัน:');
    console.log(`   ID: ${student.id}`);
    console.log(`   Name: ${student.name || '❌ ไม่มี'}`);
    console.log(`   Email: ${student.email || '❌ ไม่มี'}`);
    console.log(`   TName: ${student.t_name || '❌ ไม่มี'}`);
    console.log(`   TSurname: ${student.t_surname || '❌ ไม่มี'}`);
    console.log(`   TTitle: ${student.t_title || '❌ ไม่มี'}`);
    console.log(`   Phone: ${student.phone || '❌ ไม่มี'}`);
    console.log(`   MajorId: ${student.majorId || '❌ ไม่มี'}`);
    console.log(`   DepartmentId: ${student.departmentId || '❌ ไม่มี'}`);
    console.log(`   FacultyId: ${student.facultyId || '❌ ไม่มี'}`);
    console.log(`   CurriculumId: ${student.curriculumId || '❌ ไม่มี'}\n`);

    // ตรวจสอบข้อมูลที่จำเป็น
    const requiredFields = [
      { name: 'name', value: student.name },
      { name: 'email', value: student.email },
      { name: 't_name', value: student.t_name },
      { name: 't_surname', value: student.t_surname },
      { name: 't_title', value: student.t_title },
      { name: 'phone', value: student.phone },
      { name: 'majorId', value: student.majorId },
      { name: 'departmentId', value: student.departmentId },
      { name: 'facultyId', value: student.facultyId },
      { name: 'curriculumId', value: student.curriculumId }
    ];

    const filledFields = requiredFields.filter(field => 
      field.value && field.value.toString().trim() !== ''
    );

    const completionRate = filledFields.length / requiredFields.length;
    const isComplete = completionRate >= 0.8;

    console.log('📈 สถานะการกรอกข้อมูล:');
    console.log(`   ข้อมูลที่กรอกแล้ว: ${filledFields.length}/${requiredFields.length}`);
    console.log(`   อัตราความสมบูรณ์: ${(completionRate * 100).toFixed(1)}%`);
    console.log(`   ครบถ้วน (≥80%): ${isComplete ? '✅ ใช่' : '❌ ไม่'}\n`);

    console.log('❌ ข้อมูลที่ขาดหายไป:');
    const missingFields = requiredFields.filter(field => 
      !field.value || field.value.toString().trim() === ''
    );
    
    if (missingFields.length === 0) {
      console.log('   ไม่มีข้อมูลที่ขาดหายไป');
    } else {
      missingFields.forEach(field => {
        console.log(`   - ${field.name}`);
      });
    }

    console.log('\n💡 วิธีแก้ไข:');
    if (!isComplete) {
      console.log('   1. ไปที่หน้า Settings ของนักศึกษา');
      console.log('   2. กรอกข้อมูลที่ขาดหายไปให้ครบถ้วน');
      console.log('   3. บันทึกข้อมูล');
      console.log('   4. กลับมาที่หน้า Application Form');
    } else {
      console.log('   ข้อมูลครบถ้วนแล้ว สามารถไปขั้นตอนถัดไปได้');
    }

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// ใช้ student ID ที่มีอยู่จริง
const studentId = process.argv[2] || 'u6800001';
debugStudentProfile(studentId);
