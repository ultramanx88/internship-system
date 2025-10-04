import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugStudentCreation() {
  try {
    console.log('🔍 Debugging student creation...');
    
    // ตรวจสอบการเชื่อมต่อฐานข้อมูล
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    // ตรวจสอบข้อมูลคณะ ภาควิชา หลักสูตร และสาขาวิชา
    const faculties = await prisma.faculty.findMany();
    const departments = await prisma.department.findMany();
    const curriculums = await prisma.curriculum.findMany();
    const majors = await prisma.major.findMany();
    
    console.log(`📚 Found ${faculties.length} faculties, ${departments.length} departments, ${curriculums.length} curriculums, ${majors.length} majors`);
    
    // ตรวจสอบข้อมูลที่เกี่ยวข้อง
    console.log('🏛️ Faculties:', faculties.map(f => ({ id: f.id, name: f.nameTh })));
    console.log('🏢 Departments:', departments.map(d => ({ id: d.id, name: d.nameTh, facultyId: d.facultyId })));
    console.log('📖 Curriculums:', curriculums.map(c => ({ id: c.id, name: c.nameTh, departmentId: c.departmentId })));
    console.log('🎓 Majors:', majors.map(m => ({ id: m.id, name: m.nameTh, curriculumId: m.curriculumId })));
    
    // ลองสร้างนักศึกษาคนเดียว
    const testStudent = {
      name: "ทดสอบ นักศึกษา",
      email: "test.student@university.ac.th",
      password: "password123",
      roles: "student",
      t_title: "นาย",
      t_name: "ทดสอบ",
      t_surname: "นักศึกษา",
      e_title: "Mr.",
      e_name: "Test",
      e_surname: "Student",
      facultyId: "faculty-1",
      departmentId: "dept-1",
      curriculumId: "curr-1",
      majorId: "major-1",
      studentYear: 3,
      phone: "081-234-5678",
      campus: "วิทยาเขตกรุงเทพ",
      gpa: "3.45",
      nationality: "ไทย",
      passportId: null,
      visaType: "none",
      profileImage: null,
      skills: "JavaScript, React, Node.js",
      statement: "ทดสอบการสร้างนักศึกษา",
      notifyEmail: true,
      notifyPush: false,
      notifySms: false,
      notifyAppUpdates: true,
      notifyDeadlines: true,
      notifyNews: false,
      language: "th",
      theme: "light",
      dateFormat: "thai"
    };
    
    console.log('🧪 Creating test student...');
    const student = await prisma.user.create({
      data: testStudent
    });
    
    console.log('✅ Test student created successfully:', student);
    
    // ตรวจสอบว่าข้อมูลถูกบันทึกหรือไม่
    const createdStudent = await prisma.user.findUnique({
      where: { email: testStudent.email }
    });
    
    console.log('🔍 Verification - Found student:', createdStudent);
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugStudentCreation();
