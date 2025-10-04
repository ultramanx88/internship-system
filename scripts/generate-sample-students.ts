import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ข้อมูลตัวอย่างสำหรับนักศึกษา
const sampleStudents = [
  {
    // ข้อมูลพื้นฐาน
    name: "สมชาย ใจดี",
    email: "somchai.jaidee@student.university.ac.th",
    password: "password123",
    roles: "student",
    
    // ข้อมูลภาษาไทย
    t_title: "นาย",
    t_name: "สมชาย",
    t_middle_name: "วิศาล",
    t_surname: "ใจดี",
    
    // ข้อมูลภาษาอังกฤษ
    e_title: "Mr.",
    e_name: "Somchai",
    e_middle_name: "Wisal",
    e_surname: "Jaidee",
    
    // ข้อมูลการศึกษา
    facultyId: "faculty-1", // คณะวิทยาศาสตร์และเทคโนโลยี
    departmentId: "dept-1", // สาขาวิชาเทคโนโลยีสารสนเทศ
    curriculumId: "curr-1", // หลักสูตรเทคโนโลยีสารสนเทศ
    majorId: "major-1", // สาขาวิชาเทคโนโลยีสารสนเทศ
    studentYear: 3,
    
    // ข้อมูลส่วนตัว
    phone: "081-234-5678",
    campus: "วิทยาเขตกรุงเทพ",
    gpa: "3.45",
    nationality: "ไทย",
    passportId: null,
    visaType: "none",
    profileImage: "/uploads/profiles/student1.webp",
    
    // ข้อมูลทักษะและความสนใจ
    skills: "JavaScript, React, Node.js, Python, Database Design, UI/UX Design",
    statement: "สนใจในการพัฒนาเว็บแอปพลิเคชันและระบบฐานข้อมูล ต้องการเรียนรู้การทำงานจริงในบริษัทเทคโนโลยี",
    
    // การตั้งค่าการแจ้งเตือน
    notifyEmail: true,
    notifyPush: true,
    notifySms: false,
    notifyAppUpdates: true,
    notifyDeadlines: true,
    notifyNews: true,
    
    // การตั้งค่าทั่วไป
    language: "th",
    theme: "light",
    dateFormat: "thai"
  },
  {
    name: "สมหญิง สวยงาม",
    email: "somying.suayngam@student.university.ac.th",
    password: "password123",
    roles: "student",
    
    t_title: "นางสาว",
    t_name: "สมหญิง",
    t_middle_name: "วิไล",
    t_surname: "สวยงาม",
    
    e_title: "Ms.",
    e_name: "Somying",
    e_middle_name: "Wilai",
    e_surname: "Suayngam",
    
    facultyId: "faculty-1",
    departmentId: "dept-2", // สาขาวิชาวิทยาการคอมพิวเตอร์
    curriculumId: "curr-2",
    majorId: "major-4",
    studentYear: 4,
    
    phone: "082-345-6789",
    campus: "วิทยาเขตกรุงเทพ",
    gpa: "3.78",
    nationality: "ไทย",
    passportId: null,
    visaType: "none",
    profileImage: "/uploads/profiles/student2.webp",
    
    skills: "Java, Spring Boot, Machine Learning, Data Science, SQL, Git",
    statement: "สนใจในด้าน Data Science และ Machine Learning ต้องการฝึกงานในบริษัทที่ใช้ AI และ Big Data",
    
    notifyEmail: true,
    notifyPush: false,
    notifySms: true,
    notifyAppUpdates: true,
    notifyDeadlines: true,
    notifyNews: false,
    
    language: "th",
    theme: "dark",
    dateFormat: "thai"
  },
  {
    name: "สมศักดิ์ เก่งมาก",
    email: "somsak.kengmak@student.university.ac.th",
    password: "password123",
    roles: "student",
    
    t_title: "นาย",
    t_name: "สมศักดิ์",
    t_middle_name: "วิชัย",
    t_surname: "เก่งมาก",
    
    e_title: "Mr.",
    e_name: "Somsak",
    e_middle_name: "Wichai",
    e_surname: "Kengmak",
    
    facultyId: "faculty-2", // คณะบริหารธุรกิจ
    departmentId: "dept-3", // สาขาวิชาการจัดการธุรกิจ
    curriculumId: "curr-3",
    majorId: "major-4",
    studentYear: 2,
    
    phone: "083-456-7890",
    campus: "วิทยาเขตกรุงเทพ",
    gpa: "3.92",
    nationality: "ไทย",
    passportId: "A1234567",
    visaType: "none",
    profileImage: "/uploads/profiles/student3.webp",
    
    skills: "Business Analysis, Project Management, Excel, PowerPoint, Communication, Leadership",
    statement: "สนใจในด้านการจัดการธุรกิจและการวิเคราะห์ข้อมูลธุรกิจ ต้องการฝึกงานในบริษัทที่ให้โอกาสในการเรียนรู้การทำงานจริง",
    
    notifyEmail: true,
    notifyPush: true,
    notifySms: true,
    notifyAppUpdates: true,
    notifyDeadlines: true,
    notifyNews: true,
    
    language: "en",
    theme: "light",
    dateFormat: "international"
  },
  {
    name: "สมพร ดีใจ",
    email: "somporn.deejai@student.university.ac.th",
    password: "password123",
    roles: "student",
    
    t_title: "นางสาว",
    t_name: "สมพร",
    t_middle_name: "สุขใส",
    t_surname: "ดีใจ",
    
    e_title: "Ms.",
    e_name: "Somporn",
    e_middle_name: "Suksai",
    e_surname: "Deejai",
    
    facultyId: "faculty-1",
    departmentId: "dept-1",
    curriculumId: "curr-1",
    majorId: "major-1",
    studentYear: 3,
    
    phone: "084-567-8901",
    campus: "วิทยาเขตกรุงเทพ",
    gpa: "3.25",
    nationality: "ไทย",
    passportId: null,
    visaType: "none",
    profileImage: "/uploads/profiles/student4.webp",
    
    skills: "PHP, Laravel, MySQL, HTML/CSS, JavaScript, Bootstrap",
    statement: "สนใจในการพัฒนาเว็บไซต์และระบบจัดการข้อมูล ต้องการเรียนรู้การทำงานในทีมพัฒนา",
    
    notifyEmail: true,
    notifyPush: false,
    notifySms: false,
    notifyAppUpdates: true,
    notifyDeadlines: true,
    notifyNews: false,
    
    language: "th",
    theme: "light",
    dateFormat: "thai"
  },
  {
    name: "สมหมาย ใจเย็น",
    email: "sommai.jaiyen@student.university.ac.th",
    password: "password123",
    roles: "student",
    
    t_title: "นาย",
    t_name: "สมหมาย",
    t_middle_name: "สุขใส",
    t_surname: "ใจเย็น",
    
    e_title: "Mr.",
    e_name: "Sommai",
    e_middle_name: "Suksai",
    e_surname: "Jaiyen",
    
    facultyId: "faculty-1",
    departmentId: "dept-2",
    curriculumId: "curr-2",
    majorId: "major-4",
    studentYear: 4,
    
    phone: "085-678-9012",
    campus: "วิทยาเขตกรุงเทพ",
    gpa: "3.67",
    nationality: "ไทย",
    passportId: null,
    visaType: "none",
    profileImage: "/uploads/profiles/student5.webp",
    
    skills: "C++, Python, Algorithm, Data Structure, Linux, Docker",
    statement: "สนใจในด้านการพัฒนาโปรแกรมและระบบซอฟต์แวร์ ต้องการฝึกงานในบริษัทที่ใช้เทคโนโลยีล่าสุด",
    
    notifyEmail: true,
    notifyPush: true,
    notifySms: false,
    notifyAppUpdates: true,
    notifyDeadlines: true,
    notifyNews: true,
    
    language: "th",
    theme: "dark",
    dateFormat: "thai"
  },
  {
    name: "สมใจ รักเรียน",
    email: "somjai.rakrian@student.university.ac.th",
    password: "password123",
    roles: "student",
    
    t_title: "นางสาว",
    t_name: "สมใจ",
    t_middle_name: "วิไล",
    t_surname: "รักเรียน",
    
    e_title: "Ms.",
    e_name: "Somjai",
    e_middle_name: "Wilai",
    e_surname: "Rakrian",
    
    facultyId: "faculty-2",
    departmentId: "dept-3",
    curriculumId: "curr-3",
    majorId: "major-4",
    studentYear: 2,
    
    phone: "086-789-0123",
    campus: "วิทยาเขตกรุงเทพ",
    gpa: "3.88",
    nationality: "ไทย",
    passportId: "B2345678",
    visaType: "none",
    profileImage: "/uploads/profiles/student6.webp",
    
    skills: "Marketing, Digital Marketing, Social Media, Content Creation, Analytics, Communication",
    statement: "สนใจในด้านการตลาดดิจิทัลและการสร้างเนื้อหา ต้องการฝึกงานในบริษัทที่ให้โอกาสในการเรียนรู้การทำงานจริง",
    
    notifyEmail: true,
    notifyPush: true,
    notifySms: true,
    notifyAppUpdates: true,
    notifyDeadlines: true,
    notifyNews: true,
    
    language: "en",
    theme: "light",
    dateFormat: "international"
  },
  {
    name: "สมบูรณ์ ดีเลิศ",
    email: "somboon.deeleet@student.university.ac.th",
    password: "password123",
    roles: "student",
    
    t_title: "นาย",
    t_name: "สมบูรณ์",
    t_middle_name: "วิชัย",
    t_surname: "ดีเลิศ",
    
    e_title: "Mr.",
    e_name: "Somboon",
    e_middle_name: "Wichai",
    e_surname: "Deeleet",
    
    facultyId: "faculty-1",
    departmentId: "dept-1",
    curriculumId: "curr-1",
    majorId: "major-1",
    studentYear: 3,
    
    phone: "087-890-1234",
    campus: "วิทยาเขตกรุงเทพ",
    gpa: "3.55",
    nationality: "ไทย",
    passportId: null,
    visaType: "none",
    profileImage: "/uploads/profiles/student7.webp",
    
    skills: "Vue.js, Nuxt.js, TypeScript, MongoDB, Firebase, AWS",
    statement: "สนใจในการพัฒนาเว็บแอปพลิเคชันสมัยใหม่และระบบคลาวด์ ต้องการเรียนรู้การทำงานในบริษัทเทคโนโลยี",
    
    notifyEmail: true,
    notifyPush: false,
    notifySms: false,
    notifyAppUpdates: true,
    notifyDeadlines: true,
    notifyNews: false,
    
    language: "th",
    theme: "light",
    dateFormat: "thai"
  },
  {
    name: "สมศรี สวยใส",
    email: "somsri.suaysai@student.university.ac.th",
    password: "password123",
    roles: "student",
    
    t_title: "นางสาว",
    t_name: "สมศรี",
    t_middle_name: "วิไล",
    t_surname: "สวยใส",
    
    e_title: "Ms.",
    e_name: "Somsri",
    e_middle_name: "Wilai",
    e_surname: "Suaysai",
    
    facultyId: "faculty-1",
    departmentId: "dept-2",
    curriculumId: "curr-2",
    majorId: "major-4",
    studentYear: 4,
    
    phone: "088-901-2345",
    campus: "วิทยาเขตกรุงเทพ",
    gpa: "3.72",
    nationality: "ไทย",
    passportId: null,
    visaType: "none",
    profileImage: "/uploads/profiles/student8.webp",
    
    skills: "Angular, Ionic, Flutter, React Native, Mobile Development, UI/UX",
    statement: "สนใจในการพัฒนาแอปพลิเคชันมือถือและ UI/UX Design ต้องการฝึกงานในบริษัทที่ให้โอกาสในการเรียนรู้การทำงานจริง",
    
    notifyEmail: true,
    notifyPush: true,
    notifySms: false,
    notifyAppUpdates: true,
    notifyDeadlines: true,
    notifyNews: true,
    
    language: "th",
    theme: "dark",
    dateFormat: "thai"
  },
  {
    name: "สมศักดิ์ เก่งกาจ",
    email: "somsak.kengkat@student.university.ac.th",
    password: "password123",
    roles: "student",
    
    t_title: "นาย",
    t_name: "สมศักดิ์",
    t_middle_name: "วิชัย",
    t_surname: "เก่งกาจ",
    
    e_title: "Mr.",
    e_name: "Somsak",
    e_middle_name: "Wichai",
    e_surname: "Kengkat",
    
    facultyId: "faculty-2",
    departmentId: "dept-3",
    curriculumId: "curr-3",
    majorId: "major-4",
    studentYear: 2,
    
    phone: "089-012-3456",
    campus: "วิทยาเขตกรุงเทพ",
    gpa: "3.33",
    nationality: "ไทย",
    passportId: "C3456789",
    visaType: "none",
    profileImage: "/uploads/profiles/student9.webp",
    
    skills: "Sales, Customer Service, Business Development, CRM, Excel, Presentation",
    statement: "สนใจในด้านการขายและการพัฒนาธุรกิจ ต้องการฝึกงานในบริษัทที่ให้โอกาสในการเรียนรู้การทำงานจริง",
    
    notifyEmail: true,
    notifyPush: true,
    notifySms: true,
    notifyAppUpdates: true,
    notifyDeadlines: true,
    notifyNews: true,
    
    language: "en",
    theme: "light",
    dateFormat: "international"
  },
  {
    name: "สมใจ ดีใจมาก",
    email: "somjai.deejaimak@student.university.ac.th",
    password: "password123",
    roles: "student",
    
    t_title: "นางสาว",
    t_name: "สมใจ",
    t_middle_name: "สุขใส",
    t_surname: "ดีใจมาก",
    
    e_title: "Ms.",
    e_name: "Somjai",
    e_middle_name: "Suksai",
    e_surname: "Deejaimak",
    
    facultyId: "faculty-1",
    departmentId: "dept-1",
    curriculumId: "curr-1",
    majorId: "major-1",
    studentYear: 3,
    
    phone: "090-123-4567",
    campus: "วิทยาเขตกรุงเทพ",
    gpa: "3.41",
    nationality: "ไทย",
    passportId: null,
    visaType: "none",
    profileImage: "/uploads/profiles/student10.webp",
    
    skills: "WordPress, WooCommerce, SEO, Google Analytics, Content Management, E-commerce",
    statement: "สนใจในการพัฒนาเว็บไซต์และระบบ E-commerce ต้องการเรียนรู้การทำงานในบริษัทที่ให้โอกาสในการเรียนรู้การทำงานจริง",
    
    notifyEmail: true,
    notifyPush: false,
    notifySms: false,
    notifyAppUpdates: true,
    notifyDeadlines: true,
    notifyNews: false,
    
    language: "th",
    theme: "light",
    dateFormat: "thai"
  }
];

async function generateSampleStudents() {
  try {
    console.log('🎓 Starting to generate sample students...');
    
    // ตรวจสอบว่ามีข้อมูลคณะ ภาควิชา หลักสูตร และสาขาวิชาหรือไม่
    const faculties = await prisma.faculty.findMany();
    const departments = await prisma.department.findMany();
    const curriculums = await prisma.curriculum.findMany();
    const majors = await prisma.major.findMany();
    
    console.log(`📊 Found ${faculties.length} faculties, ${departments.length} departments, ${curriculums.length} curriculums, ${majors.length} majors`);
    
    // สร้างข้อมูลนักศึกษา
    for (const studentData of sampleStudents) {
      try {
        const student = await prisma.user.upsert({
          where: { email: studentData.email },
          update: studentData,
          create: studentData
        });
        console.log(`✅ Created/Updated student: ${student.name} (${student.email})`);
      } catch (error) {
        console.error(`❌ Failed to create/update student ${studentData.name}:`, error);
      }
    }
    
    console.log('🎉 Sample students generation completed!');
    
    // แสดงสถิติ
    const totalStudents = await prisma.user.count({
      where: { roles: 'student' }
    });
    console.log(`📈 Total students in database: ${totalStudents}`);
    
  } catch (error) {
    console.error('❌ Error generating sample students:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// รันสคริปต์
generateSampleStudents();
