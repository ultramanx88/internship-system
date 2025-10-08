import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixStudentFaculty() {
  try {
    console.log('🔧 แก้ไขข้อมูลคณะของนักศึกษา...\n');

    // หาคณะใหม่
    const faculty = await prisma.faculty.findFirst({
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

    if (!faculty) {
      console.log('❌ ไม่พบคณะบริหารธุรกิจและศิลปศาสตร์');
      return;
    }

    // หาหลักสูตรและวิชาเอก
    const accountingDept = faculty.departments.find(d => d.nameTh === 'สาขาบัญชี');
    const managementDept = faculty.departments.find(d => d.nameTh === 'สาขาบริหาร');
    const liberalArtsDept = faculty.departments.find(d => d.nameTh === 'สาขาศิลปศาสตร์');

    const accountingCurriculum = accountingDept?.curriculums[0]; // บช.บ.การบัญชี
    const businessAdminCurriculum = managementDept?.curriculums.find(c => c.nameTh.includes('บริหารธุรกิจ'));
    const businessAdminMajor = businessAdminCurriculum?.majors[0]; // การจัดการธุรกิจ
    const liberalArtsCurriculum = liberalArtsDept?.curriculums[0]; // ศศ.บ.ภาษาอังกฤษเพื่อการสื่อสารสากล

    console.log('📋 หลักสูตรที่จะใช้:');
    console.log(`- ${accountingCurriculum?.nameTh} (ไม่มีวิชาเอก)`);
    console.log(`- ${businessAdminCurriculum?.nameTh} -> ${businessAdminMajor?.nameTh}`);
    console.log(`- ${liberalArtsCurriculum?.nameTh} (ไม่มีวิชาเอก)`);

    // หานักศึกษาที่ไม่มีคณะ
    const studentsWithoutFaculty = await prisma.user.findMany({
      where: {
        roles: {
          contains: 'student'
        },
        major: null
      }
    });

    console.log(`\n👥 นักศึกษาที่ไม่มีคณะ: ${studentsWithoutFaculty.length} คน`);

    let successCount = 0;
    let errorCount = 0;

    for (const student of studentsWithoutFaculty) {
      try {
        // กำหนดสาขาและหลักสูตรตามลำดับ
        let targetDept, targetCurriculum, targetMajor;

        const studentIndex = studentsWithoutFaculty.indexOf(student);
        
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
          targetCurriculum = liberalArtsCurriculum;
          targetMajor = null; // ไม่มีวิชาเอก
        }

        if (!targetDept || !targetCurriculum) {
          console.log(`⚠️  ${student.name}: ไม่พบหลักสูตรที่เหมาะสม`);
          continue;
        }

        // อัปเดตข้อมูลนักศึกษา
        await prisma.user.update({
          where: { id: student.id },
          data: {
            majorId: targetMajor?.id || null,
          }
        });

        console.log(`✅ ${student.name} -> ${targetDept.nameTh} -> ${targetCurriculum.nameTh}${targetMajor ? ` -> ${targetMajor.nameTh}` : ''}`);
        successCount++;

      } catch (error) {
        console.log(`❌ ${student.name}: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 สรุปการแก้ไข:`);
    console.log(`- สำเร็จ: ${successCount} คน`);
    console.log(`- ผิดพลาด: ${errorCount} คน`);

    // ตรวจสอบผลลัพธ์
    const finalCheck = await prisma.user.findMany({
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

    const studentsWithFaculty = finalCheck.filter(s => s.major?.curriculum?.department?.faculty);
    console.log(`\n🎯 ผลลัพธ์สุดท้าย:`);
    console.log(`- นักศึกษาทั้งหมด: ${finalCheck.length} คน`);
    console.log(`- นักศึกษาที่มีคณะ: ${studentsWithFaculty.length} คน`);
    console.log(`- นักศึกษาที่ไม่มีคณะ: ${finalCheck.length - studentsWithFaculty.length} คน`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixStudentFaculty();
