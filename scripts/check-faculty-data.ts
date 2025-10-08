import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFacultyData() {
  try {
    console.log('🔍 ตรวจสอบข้อมูลคณะและนักศึกษา...\n');

    // ตรวจสอบคณะที่มีในระบบ
    const faculties = await prisma.faculty.findMany({
      include: {
        departments: {
          include: {
            curriculums: {
              include: {
                majors: true
              }
            }
          }
        }
      }
    });

    console.log('📚 คณะที่มีในระบบ:');
    faculties.forEach(faculty => {
      console.log(`- ${faculty.nameTh} (${faculty.nameEn})`);
      faculty.departments.forEach(dept => {
        console.log(`  └─ ${dept.nameTh} (${dept.nameEn})`);
        dept.curriculums.forEach(curriculum => {
          console.log(`    └─ ${curriculum.nameTh} (${curriculum.nameEn})`);
          curriculum.majors.forEach(major => {
            console.log(`      └─ ${major.nameTh} (${major.nameEn})`);
          });
        });
      });
    });

    // ตรวจสอบนักศึกษาที่มีในระบบ
    const students = await prisma.user.findMany({
      where: {
        roles: {
          contains: 'student'
        }
      },
      include: {
        major: {
          include: {
            curriculum: {
              include: {
                department: {
                  include: {
                    faculty: true
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log('\n👥 นักศึกษาที่มีในระบบ:');
    students.forEach(student => {
      const facultyName = student.major?.curriculum?.department?.faculty?.nameTh || 'ไม่ระบุ';
      const deptName = student.major?.curriculum?.department?.nameTh || 'ไม่ระบุ';
      const curriculumName = student.major?.curriculum?.nameTh || 'ไม่ระบุ';
      const majorName = student.major?.nameTh || 'ไม่ระบุ';
      
      console.log(`- ${student.name} (${student.email})`);
      console.log(`  └─ คณะ: ${facultyName}`);
      console.log(`  └─ สาขา: ${deptName}`);
      console.log(`  └─ หลักสูตร: ${curriculumName}`);
      console.log(`  └─ วิชาเอก: ${majorName}\n`);
    });

    // ตรวจสอบสถิติ
    console.log('📊 สถิติข้อมูล:');
    console.log(`- จำนวนคณะ: ${faculties.length}`);
    console.log(`- จำนวนนักศึกษา: ${students.length}`);
    
    const studentsWithFaculty = students.filter(s => s.major?.curriculum?.department?.faculty);
    console.log(`- นักศึกษาที่มีคณะ: ${studentsWithFaculty.length}`);
    console.log(`- นักศึกษาที่ไม่มีคณะ: ${students.length - studentsWithFaculty.length}`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFacultyData();
