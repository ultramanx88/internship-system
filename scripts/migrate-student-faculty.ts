import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateStudentFaculty() {
  try {
    console.log('🔄 เริ่มย้ายข้อมูลนักศึกษาไปยังคณะใหม่...\n');

    // หาคณะใหม่ (บริหารธุรกิจและศิลปศาสตร์)
    const newFaculty = await prisma.faculty.findFirst({
      where: {
        nameTh: 'บริหารธุรกิจและศิลปศาสตร์'
      },
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

    if (!newFaculty) {
      console.log('❌ ไม่พบคณะบริหารธุรกิจและศิลปศาสตร์');
      return;
    }

    console.log(`✅ พบคณะใหม่: ${newFaculty.nameTh}`);
    console.log(`   - จำนวนสาขา: ${newFaculty.departments.length}`);
    
    // แสดงสาขาที่มี
    newFaculty.departments.forEach(dept => {
      console.log(`   - ${dept.nameTh}: ${dept.curriculums.length} หลักสูตร`);
    });

    // หาสาขาและหลักสูตรที่เหมาะสมสำหรับการย้าย
    const accountingDept = newFaculty.departments.find(d => d.nameTh === 'สาขาบัญชี');
    const managementDept = newFaculty.departments.find(d => d.nameTh === 'สาขาบริหาร');
    const liberalArtsDept = newFaculty.departments.find(d => d.nameTh === 'สาขาศิลปศาสตร์');

    if (!accountingDept || !managementDept || !liberalArtsDept) {
      console.log('❌ ไม่พบสาขาที่ต้องการ');
      return;
    }

    // หาหลักสูตรและวิชาเอกที่เหมาะสม
    const accountingCurriculum = accountingDept.curriculums[0]; // บช.บ.การบัญชี
    const businessAdminCurriculum = managementDept.curriculums.find(c => c.nameTh.includes('บริหารธุรกิจ'));
    const businessAdminMajor = businessAdminCurriculum?.majors[0]; // การจัดการธุรกิจ

    console.log('\n📋 หลักสูตรและวิชาเอกที่จะใช้:');
    console.log(`- ${accountingCurriculum.nameTh} (ไม่มีวิชาเอก)`);
    console.log(`- ${businessAdminCurriculum?.nameTh} -> ${businessAdminMajor?.nameTh}`);

    // ย้ายนักศึกษาจากคณะเก่า
    const oldFaculties = await prisma.faculty.findMany({
      where: {
        nameTh: {
          in: ['คณะวิทยาศาสตร์และเทคโนโลยี', 'คณะบริหารธุรกิจ']
        }
      }
    });

    console.log(`\n🗑️  คณะเก่าที่จะลบ: ${oldFaculties.map(f => f.nameTh).join(', ')}`);

    // ย้ายนักศึกษาทั้งหมดไปยังคณะใหม่
    const students = await prisma.user.findMany({
      where: {
        roles: {
          contains: 'student'
        }
      }
    });

    console.log(`\n👥 กำลังย้ายนักศึกษา ${students.length} คน...`);

    let successCount = 0;
    let errorCount = 0;

    for (const student of students) {
      try {
        // กำหนดสาขาและหลักสูตรตามลำดับ
        let targetDept, targetCurriculum, targetMajor;

        // กระจายนักศึกษาไปยังสาขาต่างๆ
        const studentIndex = students.indexOf(student);
        
        if (studentIndex % 3 === 0) {
          // 1/3 ไปสาขาบัญชี
          targetDept = accountingDept;
          targetCurriculum = accountingCurriculum;
          targetMajor = null; // ไม่มีวิชาเอก
        } else if (studentIndex % 3 === 1) {
          // 1/3 ไปสาขาบริหาร (หลักสูตรบริหารธุรกิจ)
          targetDept = managementDept;
          targetCurriculum = businessAdminCurriculum;
          targetMajor = businessAdminMajor;
        } else {
          // 1/3 ไปสาขาศิลปศาสตร์
          targetDept = liberalArtsDept;
          targetCurriculum = liberalArtsDept.curriculums[0]; // หลักสูตรแรก
          targetMajor = null; // ไม่มีวิชาเอก
        }

        // อัปเดตข้อมูลนักศึกษา
        await prisma.user.update({
          where: { id: student.id },
          data: {
            majorId: targetMajor?.id || null,
            // อัปเดตข้อมูลเพิ่มเติมถ้ามี
            t_name: student.t_name || student.name.split(' ')[0],
            t_surname: student.t_surname || student.name.split(' ').slice(1).join(' '),
          }
        });

        console.log(`✅ ${student.name} -> ${targetDept.nameTh} -> ${targetCurriculum?.nameTh}${targetMajor ? ` -> ${targetMajor.nameTh}` : ''}`);
        successCount++;

      } catch (error) {
        console.log(`❌ ${student.name}: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 สรุปการย้าย:`);
    console.log(`- สำเร็จ: ${successCount} คน`);
    console.log(`- ผิดพลาด: ${errorCount} คน`);

    // ลบคณะเก่า (ถ้าต้องการ)
    console.log(`\n🗑️  กำลังลบคณะเก่า...`);
    
    for (const oldFaculty of oldFaculties) {
      try {
        // ลบข้อมูลที่เกี่ยวข้องก่อน
        await prisma.major.deleteMany({
          where: {
            curriculum: {
              department: {
                facultyId: oldFaculty.id
              }
            }
          }
        });

        await prisma.curriculum.deleteMany({
          where: {
            department: {
              facultyId: oldFaculty.id
            }
          }
        });

        await prisma.department.deleteMany({
          where: {
            facultyId: oldFaculty.id
          }
        });

        await prisma.faculty.delete({
          where: { id: oldFaculty.id }
        });

        console.log(`✅ ลบคณะ ${oldFaculty.nameTh} เรียบร้อย`);
      } catch (error) {
        console.log(`❌ ไม่สามารถลบคณะ ${oldFaculty.nameTh}: ${error.message}`);
      }
    }

    console.log('\n🎉 การย้ายข้อมูลเสร็จสิ้น!');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateStudentFaculty();
