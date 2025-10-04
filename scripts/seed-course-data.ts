import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ข้อมูลหมวดหมู่วิชา
const courseCategories = [
  {
    id: 'cat_core',
    name: 'วิชาพื้นฐาน',
    nameEn: 'Core Courses',
    description: 'วิชาพื้นฐานที่จำเป็นสำหรับทุกสาขา'
  },
  {
    id: 'cat_major',
    name: 'วิชาเฉพาะ',
    nameEn: 'Major Courses',
    description: 'วิชาเฉพาะทางตามสาขาวิชา'
  },
  {
    id: 'cat_elective',
    name: 'วิชาเลือก',
    nameEn: 'Elective Courses',
    description: 'วิชาเลือกตามความสนใจ'
  },
  {
    id: 'cat_practical',
    name: 'วิชาปฏิบัติ',
    nameEn: 'Practical Courses',
    description: 'วิชาที่เน้นการปฏิบัติงาน'
  }
];

// ข้อมูลวิชา
const courses = [
  // วิชาพื้นฐาน
  {
    id: 'course_it101',
    code: 'IT101',
    name: 'เทคโนโลยีสารสนเทศ',
    nameEn: 'Information Technology',
    description: 'ความรู้พื้นฐานเกี่ยวกับเทคโนโลยีสารสนเทศ',
    credits: 3,
    categoryId: 'cat_core',
    facultyId: 'faculty-1',
    departmentId: 'dept-1',
    curriculumId: 'curriculum-1',
    majorId: 'major-1'
  },
  {
    id: 'course_it102',
    code: 'IT102',
    name: 'การเขียนโปรแกรมเบื้องต้น',
    nameEn: 'Introduction to Programming',
    description: 'เรียนรู้การเขียนโปรแกรมด้วยภาษา Python',
    credits: 3,
    categoryId: 'cat_core',
    facultyId: 'faculty-1',
    departmentId: 'dept-1',
    curriculumId: 'curriculum-1',
    majorId: 'major-1'
  },
  {
    id: 'course_sd201',
    code: 'SD201',
    name: 'การพัฒนาซอฟต์แวร์',
    nameEn: 'Software Development',
    description: 'หลักการและวิธีการพัฒนาซอฟต์แวร์',
    credits: 3,
    categoryId: 'cat_major',
    facultyId: 'faculty-1',
    departmentId: 'dept-1',
    curriculumId: 'curriculum-1',
    majorId: 'major-2'
  },
  {
    id: 'course_sd202',
    code: 'SD202',
    name: 'การออกแบบระบบ',
    nameEn: 'System Design',
    description: 'การออกแบบระบบซอฟต์แวร์และฐานข้อมูล',
    credits: 3,
    categoryId: 'cat_major',
    facultyId: 'faculty-1',
    departmentId: 'dept-1',
    curriculumId: 'curriculum-1',
    majorId: 'major-2'
  },
  {
    id: 'course_cs301',
    code: 'CS301',
    name: 'วิทยาการคอมพิวเตอร์',
    nameEn: 'Computer Science',
    description: 'ความรู้พื้นฐานทางวิทยาการคอมพิวเตอร์',
    credits: 3,
    categoryId: 'cat_major',
    facultyId: 'faculty-1',
    departmentId: 'dept-1',
    curriculumId: 'curriculum-2',
    majorId: 'major-3'
  },
  {
    id: 'course_cs302',
    code: 'CS302',
    name: 'โครงสร้างข้อมูลและอัลกอริทึม',
    nameEn: 'Data Structures and Algorithms',
    description: 'การเรียนรู้โครงสร้างข้อมูลและอัลกอริทึมพื้นฐาน',
    credits: 3,
    categoryId: 'cat_major',
    facultyId: 'faculty-1',
    departmentId: 'dept-1',
    curriculumId: 'curriculum-2',
    majorId: 'major-3'
  },
  {
    id: 'course_bm401',
    code: 'BM401',
    name: 'การจัดการธุรกิจ',
    nameEn: 'Business Management',
    description: 'หลักการจัดการธุรกิจและการบริหาร',
    credits: 3,
    categoryId: 'cat_major',
    facultyId: 'faculty-2',
    departmentId: 'dept-2',
    curriculumId: 'curriculum-3',
    majorId: 'major-4'
  },
  {
    id: 'course_bm402',
    code: 'BM402',
    name: 'การตลาดดิจิทัล',
    nameEn: 'Digital Marketing',
    description: 'การตลาดในยุคดิจิทัลและออนไลน์',
    credits: 3,
    categoryId: 'cat_major',
    facultyId: 'faculty-2',
    departmentId: 'dept-2',
    curriculumId: 'curriculum-3',
    majorId: 'major-4'
  }
];

async function seedCourseData() {
  try {
    console.log('🚀 เริ่มสร้างข้อมูลวิชา...');

    // 1. สร้างหมวดหมู่วิชา
    console.log('📚 สร้างหมวดหมู่วิชา...');
    for (const category of courseCategories) {
      await prisma.courseCategory.upsert({
        where: { id: category.id },
        update: category,
        create: category
      });
      console.log(`✅ สร้างหมวดหมู่: ${category.name}`);
    }

    // 2. สร้างวิชา
    console.log('📖 สร้างวิชา...');
    for (const course of courses) {
      await prisma.course.upsert({
        where: { id: course.id },
        update: course,
        create: course
      });
      console.log(`✅ สร้างวิชา: ${course.name} (${course.code})`);
    }

    // 3. สร้างการกำหนดอาจารย์ประจำวิชา
    console.log('👨‍🏫 สร้างการกำหนดอาจารย์ประจำวิชา...');
    
    // ตรวจสอบข้อมูลที่จำเป็น
    const academicYear = await prisma.academicYear.findFirst({
      where: { year: '2568' }
    });
    
    const semesters = await prisma.semester.findMany({
      where: { academicYearId: academicYear?.id }
    });
    
    const instructorRole = await prisma.educatorRole.findFirst({
      where: { name: 'อาจารย์ประจำวิชา' }
    });

    if (!academicYear || !semesters.length || !instructorRole) {
      console.log('❌ ไม่พบข้อมูลที่จำเป็นสำหรับการกำหนดอาจารย์');
      return;
    }

    // ข้อมูลการกำหนดอาจารย์
    const courseInstructorAssignments = [
      {
        id: 'ci_it101_68',
        instructorId: 'instructor_001',
        courseId: 'course_it101',
        courseName: 'เทคโนโลยีสารสนเทศ'
      },
      {
        id: 'ci_sd201_68',
        instructorId: 'instructor_002',
        courseId: 'course_sd201',
        courseName: 'การพัฒนาซอฟต์แวร์'
      },
      {
        id: 'ci_cs301_68',
        instructorId: 'instructor_003',
        courseId: 'course_cs301',
        courseName: 'วิทยาการคอมพิวเตอร์'
      },
      {
        id: 'ci_bm401_68',
        instructorId: 'instructor_004',
        courseId: 'course_bm401',
        courseName: 'การจัดการธุรกิจ'
      }
    ];

    // สร้างการกำหนดสำหรับเทอมแรก (active)
    const firstSemester = semesters[0];
    for (const assignment of courseInstructorAssignments) {
      try {
        await prisma.courseInstructor.create({
          data: {
            id: `${assignment.id}_${firstSemester.id}`,
            instructorId: assignment.instructorId,
            roleId: instructorRole.id,
            academicYearId: academicYear.id,
            semesterId: firstSemester.id,
            courseId: assignment.courseId,
            isActive: true,
            createdBy: 'admin-001'
          }
        });
        console.log(`✅ กำหนดอาจารย์: ${assignment.courseName} - ${assignment.instructorId}`);
      } catch (error) {
        console.log(`⚠️  อาจารย์ ${assignment.courseName} มีอยู่แล้ว`);
      }
    }

    // สร้างการกำหนดสำหรับเทอมอื่นๆ (inactive)
    for (let i = 1; i < semesters.length; i++) {
      const semester = semesters[i];
      for (const assignment of courseInstructorAssignments) {
        try {
          await prisma.courseInstructor.create({
            data: {
              id: `${assignment.id}_${semester.id}`,
              instructorId: assignment.instructorId,
              roleId: instructorRole.id,
              academicYearId: academicYear.id,
              semesterId: semester.id,
              courseId: assignment.courseId,
              isActive: false,
              createdBy: 'admin-001'
            }
          });
          console.log(`✅ กำหนดอาจารย์: ${assignment.courseName} - ${semester.name}`);
        } catch (error) {
          console.log(`⚠️  อาจารย์ ${assignment.courseName} - ${semester.name} มีอยู่แล้ว`);
        }
      }
    }

    console.log('🎉 สร้างข้อมูลวิชาเสร็จสิ้น!');
    
    // แสดงสรุปข้อมูล
    const totalCategories = await prisma.courseCategory.count();
    const totalCourses = await prisma.course.count();
    const totalCourseInstructors = await prisma.courseInstructor.count();

    console.log('\n📊 สรุปข้อมูล:');
    console.log(`- หมวดหมู่วิชา: ${totalCategories} หมวดหมู่`);
    console.log(`- วิชา: ${totalCourses} วิชา`);
    console.log(`- การกำหนดอาจารย์ประจำวิชา: ${totalCourseInstructors} รายการ`);
    console.log(`- ปีการศึกษา: 2568`);
    console.log(`- เทอม: ${semesters.length} เทอม`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCourseData();
