const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSeedData() {
  try {
    // ตรวจสอบข้อมูลคณะ
    const faculties = await prisma.faculty.findMany();
    console.log('Faculties in database:', faculties.length);
    if (faculties.length > 0) {
      console.log('Sample faculty:', faculties[0]);
    }

    // ตรวจสอบข้อมูลภาควิชา
    const departments = await prisma.department.findMany();
    console.log('Departments in database:', departments.length);
    if (departments.length > 0) {
      console.log('Sample department:', departments[0]);
    }

    // ตรวจสอบข้อมูลหลักสูตร
    const curricula = await prisma.curriculum.findMany();
    console.log('Curricula in database:', curricula.length);
    if (curricula.length > 0) {
      console.log('Sample curriculum:', curricula[0]);
    }

    // ตรวจสอบข้อมูลวิชาเอก
    const majors = await prisma.major.findMany();
    console.log('Majors in database:', majors.length);
    if (majors.length > 0) {
      console.log('Sample major:', majors[0]);
    }

    // ตรวจสอบข้อมูลบริษัท
    const companies = await prisma.company.findMany();
    console.log('Companies in database:', companies.length);
    if (companies.length > 0) {
      console.log('Sample company:', companies[0]);
    }

    // ตรวจสอบข้อมูลตำแหน่งฝึกงาน
    const internships = await prisma.internship.findMany();
    console.log('Internships in database:', internships.length);
    if (internships.length > 0) {
      console.log('Sample internship:', internships[0]);
    }

    // ตรวจสอบข้อมูลผู้ใช้
    const users = await prisma.user.findMany();
    console.log('Users in database:', users.length);
    
    // ตรวจสอบผู้ใช้ตามประเภท
    const adminUsers = users.filter(user => {
      try {
        const roles = JSON.parse(user.roles);
        return roles.includes('admin');
      } catch (e) {
        return false;
      }
    });
    console.log('Admin users:', adminUsers.length);
    
    const studentUsers = users.filter(user => {
      try {
        const roles = JSON.parse(user.roles);
        return roles.includes('student');
      } catch (e) {
        return false;
      }
    });
    console.log('Student users:', studentUsers.length);
    
    // ตรวจสอบข้อมูลของสมชาย
    const somchai = await prisma.user.findUnique({
      where: { id: '65010999' }
    });
    console.log('Somchai data exists:', somchai !== null);
    if (somchai) {
      console.log('Somchai data:', {
        id: somchai.id,
        name: somchai.name,
        t_name: somchai.t_name,
        t_surname: somchai.t_surname,
        e_name: somchai.e_name,
        e_surname: somchai.e_surname,
        email: somchai.email,
        roles: somchai.roles,
        facultyId: somchai.facultyId,
        departmentId: somchai.departmentId,
        curriculumId: somchai.curriculumId,
        majorId: somchai.majorId
      });
    }
  } catch (error) {
    console.error('Error checking seed data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSeedData();