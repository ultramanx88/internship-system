import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAcademicData() {
  try {
    console.log('🌱 เริ่มสร้างข้อมูลระบบการศึกษาแบบลำดับชั้น...');

    // 1. สร้างคณะ
    const faculty = await prisma.faculty.create({
      data: {
        nameTh: 'บริหารธุรกิจและศิลปศาสตร์',
        nameEn: 'Business Administration and Liberal Arts',
        code: 'BALA',
        isActive: true
      }
    });
    console.log('✅ สร้างคณะ:', faculty.nameTh);

    // 2. สร้างสาขา
    const departments = await Promise.all([
      prisma.department.create({
        data: {
          nameTh: 'สาขาบัญชี',
          nameEn: 'Department of Accounting',
          code: 'ACC',
          facultyId: faculty.id,
          isActive: true
        }
      }),
      prisma.department.create({
        data: {
          nameTh: 'สาขาบริหาร',
          nameEn: 'Department of Management',
          code: 'MGT',
          facultyId: faculty.id,
          isActive: true
        }
      }),
      prisma.department.create({
        data: {
          nameTh: 'สาขาศิลปศาสตร์',
          nameEn: 'Department of Liberal Arts',
          code: 'LA',
          facultyId: faculty.id,
          isActive: true
        }
      })
    ]);
    console.log('✅ สร้างสาขา:', departments.map(d => d.nameTh).join(', '));

    // 3. สร้างหลักสูตร
    const curriculums = await Promise.all([
      // สาขาบัญชี - 1 หลักสูตร
      prisma.curriculum.create({
        data: {
          nameTh: 'บช.บ.การบัญชี',
          nameEn: 'B.B.A Accounting',
          code: 'ACC-BBA',
          degree: 'ปริญญาตรี',
          departmentId: departments[0].id, // สาขาบัญชี
          isActive: true
        }
      }),
      // สาขาบริหาร - 3 หลักสูตร
      prisma.curriculum.create({
        data: {
          nameTh: 'บธ.บ.บริหารธุรกิจ',
          nameEn: 'B.B.A Business Administration',
          code: 'MGT-BBA',
          degree: 'ปริญญาตรี',
          departmentId: departments[1].id, // สาขาบริหาร
          isActive: true
        }
      }),
      prisma.curriculum.create({
        data: {
          nameTh: 'บธ.บ.การจัดการธุรกิจระหว่างประเทศ(นานาชาติ)',
          nameEn: 'B.B.A International Business Management (International Program)',
          code: 'MGT-IBM',
          degree: 'ปริญญาตรี',
          departmentId: departments[1].id, // สาขาบริหาร
          isActive: true
        }
      }),
      prisma.curriculum.create({
        data: {
          nameTh: 'บธ.บ.ระบบสารสนเทศทางธุรกิจ',
          nameEn: 'B.B.A Business Information System',
          code: 'MGT-BIS',
          degree: 'ปริญญาตรี',
          departmentId: departments[1].id, // สาขาบริหาร
          isActive: true
        }
      }),
      // สาขาศิลปศาสตร์ - 2 หลักสูตร
      prisma.curriculum.create({
        data: {
          nameTh: 'ศศ.บ.การท่องเที่ยวและการบริการ',
          nameEn: 'B.A. Tourism and Hospitality',
          code: 'LA-TH',
          degree: 'ปริญญาตรี',
          departmentId: departments[2].id, // สาขาศิลปศาสตร์
          isActive: true
        }
      }),
      prisma.curriculum.create({
        data: {
          nameTh: 'ศศ.บ.ภาษาอังกฤษเพื่อการสื่อสารสากล',
          nameEn: 'B.A. English for International Communication',
          code: 'LA-EIC',
          degree: 'ปริญญาตรี',
          departmentId: departments[2].id, // สาขาศิลปศาสตร์
          isActive: true
        }
      })
    ]);
    console.log('✅ สร้างหลักสูตร:', curriculums.map(c => c.nameTh).join(', '));

    // 4. สร้างวิชาเอก (เฉพาะหลักสูตร บธ.บ.บริหารธุรกิจ)
    const businessAdminCurriculum = curriculums.find(c => c.code === 'MGT-BBA');
    if (businessAdminCurriculum) {
      const majors = await Promise.all([
        prisma.major.create({
          data: {
            nameTh: 'การจัดการธุรกิจ',
            nameEn: 'Management',
            curriculumId: businessAdminCurriculum.id,
            area: 'การจัดการ',
            isActive: true
          }
        }),
        prisma.major.create({
          data: {
            nameTh: 'การตลาดและการตลาดดิจิทัล',
            nameEn: 'Marketing and Digital Marketing',
            curriculumId: businessAdminCurriculum.id,
            area: 'การตลาด',
            isActive: true
          }
        }),
        prisma.major.create({
          data: {
            nameTh: 'ภาษาอังกฤษธุรกิจ',
            nameEn: 'Business English',
            curriculumId: businessAdminCurriculum.id,
            area: 'ภาษาอังกฤษ',
            isActive: true
          }
        }),
        prisma.major.create({
          data: {
            nameTh: 'ธุรกิจการค้าและบริการ',
            nameEn: 'Retail Business Management',
            curriculumId: businessAdminCurriculum.id,
            area: 'การค้าปลีก',
            isActive: true
          }
        })
      ]);
      console.log('✅ สร้างวิชาเอก:', majors.map(m => m.nameTh).join(', '));
    }

    console.log('🎉 สร้างข้อมูลระบบการศึกษาเสร็จสิ้น!');
    
    // แสดงสรุปข้อมูล
    const summary = await prisma.faculty.findMany({
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

    console.log('\n📊 สรุปข้อมูลที่สร้าง:');
    summary.forEach(faculty => {
      console.log(`\n🏛️ ${faculty.nameTh} (${faculty.nameEn})`);
      faculty.departments.forEach(dept => {
        console.log(`  📚 ${dept.nameTh} (${dept.nameEn})`);
        dept.curriculums.forEach(curr => {
          console.log(`    🎓 ${curr.nameTh} (${curr.nameEn})`);
          if (curr.majors.length > 0) {
            curr.majors.forEach(major => {
              console.log(`      📖 ${major.nameTh} (${major.nameEn})`);
            });
          } else {
            console.log(`      📖 ไม่มีวิชาเอก`);
          }
        });
      });
    });

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// รันสคริปต์
seedAcademicData();
