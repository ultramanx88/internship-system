import { User, Internship, Application, ProgressReport, AcademicTerm, Holiday, Major, CompanyEvaluation, Faculty, Role } from '@prisma/client';

type DemoUser = Omit<User, 'createdAt' | 'updatedAt'> & {
    password?: string;
};

// Data from DEMO_USERS.md, adapted for multi-role structure
export let users: DemoUser[] = [
  // Admin Users
  { id: 'user_admin2', name: 'System Administrator', email: 'admin2@smart-solutions.com', password: 'admin123', roles: ['admin'], skills: null, statement: null },
  { id: 'user_demo001', name: 'Demo Admin 001', email: 'demo001@smart-solutions.com', password: '123456', roles: ['admin'], skills: null, statement: null },
  { id: 'user_admin', name: 'System Administrator', email: 'admin@smart-solutions.com', password: '123456', roles: ['admin'], skills: null, statement: null },
  { id: 'user_admin001', name: 'Admin 001', email: 'admin001@smart-solutions.com', password: '123456', roles: ['admin'], skills: null, statement: null },
  { id: 'user_admin002', name: 'Admin 002', email: 'admin002@smart-solutions.com', password: '123456', roles: ['admin'], skills: null, statement: null },
  { id: 'user_admin003', name: 'Admin 003', email: 'admin003@smart-solutions.com', password: '123456', roles: ['admin'], skills: null, statement: null },
  
  // Staff Users
  { id: 'user_s6800001', name: 'Staff 001', email: 's6800001@smart-solutions.com', password: '123456', roles: ['staff'], skills: null, statement: null },
  { id: 'user_s6800002', name: 'Staff 002', email: 's6800002@smart-solutions.com', password: '123456', roles: ['staff'], skills: null, statement: null },

  // Instructor Users
  { id: 'user_t6800001', name: 'Instructor 001', email: 't6800001@smart-solutions.com', password: '123456', roles: ['courseInstructor'], skills: null, statement: null },
  
  // Multi-role User (Instructor and Visitor)
  { id: 'user_t6800002', name: 'Instructor 002 (and Visitor)', email: 't6800002@smart-solutions.com', password: '123456', roles: ['courseInstructor', 'visitor'], skills: null, statement: null },
  
  // Multi-role User (Instructor, Committee, Visitor)
  { id: 'user_t6800003', name: 'Instructor 003 (and Committee, Visitor)', email: 't6800003@smart-solutions.com', password: '123456', roles: ['courseInstructor', 'committee', 'visitor'], skills: null, statement: null },
  
  // Committee Users
  { id: 'user_t6800004', name: 'Committee 004', email: 't6800004@smart-solutions.com', password: '123456', roles: ['committee'], skills: null, statement: null },
  { id: 'user_t6800005', name: 'Committee 005 (and Visitor)', email: 't6800005@smart-solutions.com', password: '123456', roles: ['committee', 'visitor'], skills: null, statement: null },

  // Student Users
  { id: 'test001', name: 'Test User', email: 'test@test.com', password: '123456', roles: ['student'], skills: 'React, TypeScript, Node.js', statement: 'Eager to apply my web development skills in a real-world setting and contribute to a dynamic team.' },
  { id: '65010001', name: 'Student User', email: 'student@test.com', password: '123456', roles: ['student'], skills: 'Python, Django, Data Analysis', statement: 'Passionate about data and looking to gain experience in backend development and machine learning.' },
  { id: 'u6800001', name: 'Student 001', email: 'u6800001@smart-solutions.com', password: '123456', roles: ['student'], skills: 'Figma, UI/UX Design', statement: 'Creative student looking for a challenging design internship.' },
  { id: 'u6800002', name: 'Student 002', email: 'u6800002@smart-solutions.com', password: '123456', roles: ['student'], skills: 'Java, Spring Boot', statement: 'Detail-oriented student with a passion for robust backend systems.' },
  { id: 'u6800003', name: 'Student 003', email: 'u6800003@smart-solutions.com', password: '123456', roles: ['student'], skills: 'JavaScript, Vue.js', statement: 'Frontend enthusiast ready to build beautiful user interfaces.' },
  { id: 'u6800004', name: 'Student 004', email: 'u6800004@smart-solutions.com', password: '123456', roles: ['student'], skills: 'C++, Unreal Engine', statement: 'Game development hobbyist seeking to turn passion into a profession.' },
  { id: 'u6800005', name: 'Student 005', email: 'u6800005@smart-solutions.com', password: '123456', roles: ['student'], skills: 'Swift, iOS Development', statement: 'Aspiring mobile developer with a focus on Apple ecosystems.' },
  { id: 'u6800006', name: 'Student 006', email: 'u6800006@smart-solutions.com', password: '123456', roles: ['student'], skills: 'SQL, PowerBI, Tableau', statement: 'Analytical mind with a knack for data visualization.' },
  { id: 'u6800007', name: 'Student 007', email: 'u6800007@smart-solutions.com', password: '123456', roles: ['student'], skills: 'Go, Docker, Kubernetes', statement: 'Interested in DevOps and cloud-native technologies.' },
  { id: 'u6800008', name: 'Student 008', email: 'u6800008@smart-solutions.com', password: '123456', roles: ['student'], skills: 'Ruby on Rails', statement: 'Full-stack developer with a love for rapid prototyping.' },
  { id: 'u6800009', name: 'Student 009', email: 'u6800009@smart-solutions.com', password: '123456', roles: ['student'], skills: 'PHP, Laravel', statement: 'Experienced with classic web technologies and modern frameworks.' },
  { id: 'u6800010', name: 'Student 010', email: 'u6800010@smart-solutions.com', password: '123456', roles: ['student'], skills: 'Marketing, SEO, SEM', statement: 'Digital marketing student ready to drive growth.' },
  { id: 'u6800011', name: 'Student 011', email: 'u6800011@smart-solutions.com', password: '123456', roles: ['student'], skills: null, statement: null },
  { id: 'u6800012', name: 'Student 012', email: 'u6800012@smart-solutions.com', password: '123456', roles: ['student'], skills: null, statement: null },
  { id: 'u6800013', name: 'Student 013', email: 'u6800013@smart-solutions.com', password: '123456', roles: ['student'], skills: null, statement: null },
  { id: 'u6800014', name: 'Student 014', email: 'u6800014@smart-solutions.com', password: '123456', roles: ['student'], skills: null, statement: null },
  { id: 'u6800015', name: 'Student 015', email: 'u6800015@smart-solutions.com', password: '123456', roles: ['student'], skills: null, statement: null },
  { id: 'u6800016', name: 'Student 016', email: 'u6800016@smart-solutions.com', password: '123456', roles: ['student'], skills: null, statement: null },
  { id: 'u6800017', name: 'Student 017', email: 'u6800017@smart-solutions.com', password: '123456', roles: ['student'], skills: null, statement: null },
  { id: 'u6800018', name: 'Student 018', email: 'u6800018@smart-solutions.com', password: '123456', roles: ['student'], skills: null, statement: null },
  { id: 'u6800019', name: 'Student 019', email: 'u6800019@smart-solutions.com', password: '123456', roles: ['student'], skills: null, statement: null },
  { id: 'u6800020', name: 'Student 020', email: 'u6800020@smart-solutions.com', password: '123456', roles: ['student'], skills: null, statement: null },
];

export const internships: Omit<Internship, 'createdAt' | 'updatedAt'>[] = [
    { id: 'int001', title: 'Frontend Developer', company: 'Tech Innovators Inc.', location: 'กรุงเทพฯ', description: 'พัฒนาและดูแลเว็บแอปพลิเคชันโดยใช้ React และ TypeScript สร้างส่วนประกอบที่นำกลับมาใช้ใหม่ได้และไลบรารีส่วนหน้าเพื่อใช้ในอนาคต', type: 'internship' },
    { id: 'int002', title: 'Backend Developer (Co-op)', company: 'Data Systems Ltd.', location: 'เชียงใหม่', description: 'ออกแบบและใช้งาน API ของฝั่งเซิร์ฟเวอร์ ทำงานกับฐานข้อมูล และรับรองประสิทธิภาพของแอปพลิเคชัน', type: 'co-op' },
    { id: 'int003', title: 'UI/UX Designer', company: 'Creative Solutions', location: 'กรุงเทพฯ', description: 'สร้าง wireframes, storyboards, user flows, process flows และ site maps เพื่อสื่อสารแนวคิดการออกแบบและการมีปฏิสัมพันธ์อย่างมีประสิทธิภาพ', type: 'internship' },
    { id: 'int004', title: 'Data Analyst Intern', company: 'Insightful Analytics', location: 'ทำงานทางไกล', description: 'ตีความข้อมูล วิเคราะห์ผลลัพธ์โดยใช้เทคนิคทางสถิติ และจัดทำรายงานต่อเนื่อง', type: 'internship' },
    { id: 'int005', title: 'Full Stack Developer (Co-op)', company: 'Agile Coders', location: 'กรุงเทพฯ', description: 'ทำงานทั้งส่วนหน้าและส่วนหลังของเว็บแอปพลิเคชัน มีส่วนร่วมในทุกขั้นตอนของวงจรการพัฒนาซอฟต์แวร์', type: 'co-op' },
];

export let applications: Omit<Application, 'createdAt' | 'updatedAt'>[] = [
    { id: 'app001', studentId: 'test001', internshipId: 'int001', status: 'pending', dateApplied: new Date('2024-05-01') },
    { id: 'app002', studentId: '65010001', internshipId: 'int002', status: 'approved', dateApplied: new Date('2024-05-02'), projectTopic: 'การพัฒนาระบบแนะนำสินค้าด้วย Machine Learning', feedback: null },
    { id: 'app003', studentId: 'u6800001', internshipId: 'int003', status: 'rejected', dateApplied: new Date('2024-05-03'), feedback: 'ขาดประสบการณ์ในเครื่องมือออกแบบที่ต้องการ', projectTopic: null },
    { id: 'app004', studentId: 'u6800002', internshipId: 'int004', status: 'pending', dateApplied: new Date('2024-05-04'), feedback: null, projectTopic: null },
    { id: 'app005', studentId: 'test001', internshipId: 'int005', status: 'approved', dateApplied: new Date('2024-05-05'), projectTopic: 'การสร้างแดชบอร์ดวิเคราะห์ข้อมูลแบบ Real-time', feedback: null },
    { id: 'app006', studentId: 'u6800003', internshipId: 'int001', status: 'pending', dateApplied: new Date('2024-05-06'), feedback: null, projectTopic: null },
];


export const progressReports: Omit<ProgressReport, 'createdAt' | 'updatedAt'>[] = [
    { id: 'rep001', applicationId: 'app002', report: 'สัปดาห์ที่ 1: ตั้งค่าสภาพแวดล้อมการพัฒนาและเริ่มทำความเข้าใจ codebase', date: new Date('2024-06-10') },
    { id: 'rep002', applicationId: 'app002', report: 'สัปดาห์ที่ 2: ใช้ API endpoint แรกสำหรับโปรไฟล์ผู้ใช้', date: new Date('2024-06-17') },
    { id: 'rep003', applicationId: 'app005', report: 'สัปดาห์ที่ 1: รวบรวมข้อกำหนดสำหรับแดชบอร์ด', date: new Date('2024-06-12') },
];

export const academicTerms: Omit<AcademicTerm, 'createdAt' | 'updatedAt'>[] = [
    { id: 'term-1', year: 2567, semester: '1', startDate: new Date('2024-08-05'), endDate: new Date('2024-12-06') },
    { id: 'term-2', year: 2567, semester: '2', startDate: new Date('2025-01-06'), endDate: new Date('2025-05-09') },
];

export const holidays: Omit<Holiday, 'createdAt' | 'updatedAt'>[] = [
    { id: 'holiday-1', date: new Date('2025-01-01'), name: 'วันขึ้นปีใหม่' },
    { id: 'holiday-2', date: new Date('2025-04-14'), name: 'วันสงกรานต์' },
];

export type UserRoleGroup = 'student' | 'academic';
export const userRoleGroups: { id: UserRoleGroup; label: string }[] = [
    { id: 'student', label: 'นักศึกษา' },
    { id: 'academic', label: 'บุคลากรทางการศึกษา' }
];

export type UserTitle = {
    id: string;
    nameTh: string;
    nameEn: string;
    applicableTo: UserRoleGroup[];
};
export const titles: UserTitle[] = [
    { id: 't-1', nameTh: 'นาย', nameEn: 'Mr.', applicableTo: ['student', 'academic'] },
    { id: 't-2', nameTh: 'นางสาว', nameEn: 'Ms.', applicableTo: ['student'] },
    { id: 't-3', nameTh: 'นาง', nameEn: 'Mrs.', applicableTo: ['academic'] },
    { id: 't-4', nameTh: 'ผศ.ดร.', nameEn: 'Asst. Prof. Dr.', applicableTo: ['academic'] },
];

export const majors: Omit<Major, 'createdAt' | 'updatedAt'>[] = [
    { id: 'm-1', nameTh: 'เทคโนโลยีสารสนเทศ', nameEn: 'Information Technology', parentId: null },
    { id: 'm-1-1', nameTh: 'การจัดการสารสนเทศ', nameEn: 'Information Management', parentId: 'm-1' },
    { id: 'm-1-2', nameTh: 'เทคโนโลยีเว็บ', nameEn: 'Web Technology', parentId: 'm-1' },
    { id: 'm-2', nameTh: 'วิทยาการคอมพิวเตอร์', nameEn: 'Computer Science', parentId: null },
];

export let faculties: Omit<Faculty, 'createdAt' | 'updatedAt'>[] = [
    { id: 'f-1', nameTh: 'คณะเทคโนโลยีสารสนเทศ', nameEn: 'School of Information Technology' },
    { id: 'f-2', nameTh: 'คณะวิศวกรรมศาสตร์', nameEn: 'School of Engineering' },
    { id: 'f-3', nameTh: 'คณะบริหารธุรกิจ', nameEn: 'School of Business Administration' },
];


export type CompanyEvaluationQuestion = {
    id: string;
    question: string;
    score?: number | null;
};
export type CompanyEvaluation = {
    internshipId: string;
    companyName: string;
    isEvaluated: boolean;
    evaluationDate: string | null;
    questions: CompanyEvaluationQuestion[];
};

export const companyEvaluations: CompanyEvaluation[] = [
    { 
        internshipId: 'int002',
        companyName: 'Data Systems Ltd.',
        isEvaluated: false,
        evaluationDate: null,
        questions: [
            { id: 'q1', question: 'การสนับสนุนจากพี่เลี้ยง (Supervisor/Mentor Support)' },
            { id: 'q2', question: 'ความเหมาะสมของงานที่ได้รับมอบหมาย (Task Appropriateness)' },
            { id: 'q3', question: 'สภาพแวดล้อมและวัฒนธรรมองค์กร (Work Environment & Culture)' },
            { id: 'q4', question: 'โอกาสในการเรียนรู้และพัฒนา (Learning & Development Opportunities)' },
            { id: 'q5', question: 'ความพึงพอใจโดยรวม (Overall Satisfaction)' },
        ]
    },
    { 
        internshipId: 'int005',
        companyName: 'Agile Coders',
        isEvaluated: true,
        evaluationDate: '2024-07-20T10:00:00Z',
        questions: [
            { id: 'q1', question: 'การสนับสนุนจากพี่เลี้ยง (Supervisor/Mentor Support)', score: 5 },
            { id: 'q2', question: 'ความเหมาะสมของงานที่ได้รับมอบหมาย (Task Appropriateness)', score: 4 },
            { id: 'q3', question: 'สภาพแวดล้อมและวัฒนธรรมองค์กร (Work Environment & Culture)', score: 5 },
            { id: 'q4', question: 'โอกาสในการเรียนรู้และพัฒนา (Learning & Development Opportunities)', score: 5 },
            { id: 'q5', question: 'ความพึงพอใจโดยรวม (Overall Satisfaction)', score: 5 },
        ]
    }
];
