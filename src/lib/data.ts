
// Re-defining types here for simplicity as `types.ts` is being removed.
export type Role =
  | 'student'
  | 'staff'
  | 'courseInstructor'
  | 'committee'
  | 'visitor'
  | 'admin';

export type UserRoleGroup = 'student' | 'academic';

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  roles: Role[];
  skills?: string;
  statement?: string;
  titleId?: string;
};

export type InternshipType = 'internship' | 'co-op';

export type Internship = {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  type: InternshipType;
};

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export type Application = {
  id: string;
  studentId: string;
  internshipId: string;
  status: ApplicationStatus;
  dateApplied: string;
  feedback?: string;
  projectTopic?: string;
};

export type ProgressReport = {
  id: string;
  applicationId: string;
  report: string;
  date: string;
};

export type AcademicTerm = {
  id: string;
  year: number;
  semester: string;
  startDate: Date;
  endDate: Date;
};

export type Holiday = {
    id: string;
    date: Date;
    name: string;
};

export type UserTitle = {
    id: string;
    nameTh: string;
    nameEn: string;
    applicableTo: UserRoleGroup[];
}

export type Major = {
    id: string;
    nameTh: string;
    nameEn: string;
    type: 'major' | 'minor';
};

export type CompanyEvaluationQuestion = {
    id: string;
    question: string;
    score: number | null;
}

export type CompanyEvaluation = {
    internshipId: string;
    companyName: string;
    isEvaluated: boolean;
    evaluationDate: string | null;
    questions: CompanyEvaluationQuestion[];
}


// Data from DEMO_USERS.md, adapted for multi-role structure
export let users: User[] = [
  // Admin Users
  { id: 'admin2', name: 'System Administrator', email: 'admin2@smart-solutions.com', password: 'admin123', roles: ['admin'] },
  { id: 'demo001', name: 'Demo Admin 001', email: 'demo001@smart-solutions.com', password: '123456', roles: ['admin'] },
  { id: 'admin', name: 'System Administrator', email: 'admin@smart-solutions.com', password: '123456', roles: ['admin'] },
  { id: 'admin001', name: 'Admin 001', email: 'admin001@smart-solutions.com', password: '123456', roles: ['admin'] },
  { id: 'admin002', name: 'Admin 002', email: 'admin002@smart-solutions.com', password: '123456', roles: ['admin'] },
  { id: 'admin003', name: 'Admin 003', email: 'admin003@smart-solutions.com', password: '123456', roles: ['admin'] },
  
  // Staff Users
  { id: 's6800001', name: 'Staff 001', email: 's6800001@smart-solutions.com', password: '123456', roles: ['staff'] },
  { id: 's6800002', name: 'Staff 002', email: 's6800002@smart-solutions.com', password: '123456', roles: ['staff'] },

  // Instructor Users
  { id: 't6800001', name: 'Instructor 001', email: 't6800001@smart-solutions.com', password: '123456', roles: ['courseInstructor'] },
  
  // Multi-role User (Instructor and Visitor)
  { id: 't6800002', name: 'Instructor 002 (and Visitor)', email: 't6800002@smart-solutions.com', password: '123456', roles: ['courseInstructor', 'visitor'] },
  
  // Multi-role User (Instructor, Committee, Visitor)
  { id: 't6800003', name: 'Instructor 003 (and Committee, Visitor)', email: 't6800003@smart-solutions.com', password: '123456', roles: ['courseInstructor', 'committee', 'visitor'] },
  
  // Committee Users
  { id: 't6800004', name: 'Committee 004', email: 't6800004@smart-solutions.com', password: '123456', roles: ['committee'] },
  { id: 't6800005', name: 'Committee 005 (and Visitor)', email: 't6800005@smart-solutions.com', password: '123456', roles: ['committee', 'visitor'] },

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
  { id: 'u6800011', name: 'Student 011', email: 'u6800011@smart-solutions.com', password: '123456', roles: ['student'] },
  { id: 'u6800012', name: 'Student 012', email: 'u6800012@smart-solutions.com', password: '123456', roles: ['student'] },
  { id: 'u6800013', name: 'Student 013', email: 'u6800013@smart-solutions.com', password: '123456', roles: ['student'] },
  { id: 'u6800014', name: 'Student 014', email: 'u6800014@smart-solutions.com', password: '123456', roles: ['student'] },
  { id: 'u6800015', name: 'Student 015', email: 'u6800015@smart-solutions.com', password: '123456', roles: ['student'] },
  { id: 'u6800016', name: 'Student 016', email: 'u6800016@smart-solutions.com', password: '123456', roles: ['student'] },
  { id: 'u6800017', name: 'Student 017', email: 'u6800017@smart-solutions.com', password: '123456', roles: ['student'] },
  { id: 'u6800018', name: 'Student 018', email: 'u6800018@smart-solutions.com', password: '123456', roles: ['student'] },
  { id: 'u6800019', name: 'Student 019', email: 'u6800019@smart-solutions.com', password: '123456', roles: ['student'] },
  { id: 'u6800020', name: 'Student 020', email: 'u6800020@smart-solutions.com', password: '123456', roles: ['student'] },
];

export const internships: Internship[] = [
  { id: 'intern-1', title: 'Frontend Developer (ฝึกงาน)', company: 'Innovate Inc.', location: 'Remote', description: 'Work with our frontend team to build and maintain our React-based web applications. Experience with TypeScript and Tailwind CSS is a plus.', type: 'internship' },
  { id: 'intern-2', title: 'Backend Developer (สหกิจ)', company: 'DataCorp', location: 'New York, NY', description: 'Join our backend team to develop and optimize our Python/Django services. Focus on API design, database management, and performance.', type: 'co-op' },
  { id: 'intern-3', title: 'UX/UI Design (ฝึกงาน)', company: 'Creative Solutions', location: 'San Francisco, CA', description: 'Help shape the user experience of our products. Create wireframes, mockups, and prototypes. Proficiency in Figma is required.', type: 'internship' },
];

export let applications: Application[] = [
  { id: 'app-1', studentId: 'test001', internshipId: 'intern-2', status: 'approved', dateApplied: '2024-07-20' },
  { id: 'app-2', studentId: '65010001', internshipId: 'intern-1', status: 'approved', dateApplied: '2024-07-18' },
  { id: 'app-3', studentId: 'test001', internshipId: 'intern-3', status: 'rejected', dateApplied: '2024-07-15', feedback: 'Lacks required portfolio experience in UX/UI design.' },
  { id: 'app-4', studentId: '65010001', internshipId: 'intern-2', status: 'pending', dateApplied: '2024-07-21' },
];

export let progressReports: ProgressReport[] = [
  { id: 'report-1', applicationId: 'app-1', report: 'Week 1: Onboarding complete. Started research for the co-op project on performance optimization.', date: '2024-07-25' },
  { id: 'report-2', applicationId: 'app-2', report: 'Week 1: Onboarding complete. Met the team and set up my development environment. Started working on my first ticket for a new UI component.', date: '2024-07-25' }
];

export const academicTerms: AcademicTerm[] = [
  { id: 'term-1', year: 2567, semester: '1', startDate: new Date('2024-08-01'), endDate: new Date('2024-12-20') },
  { id: 'term-2', year: 2567, semester: '2', startDate: new Date('2025-01-10'), endDate: new Date('2025-05-30') },
];

export const holidays: Holiday[] = [
    { id: 'holiday-1', date: new Date('2024-10-13'), name: 'วันคล้ายวันสวรรคต ร.9' },
    { id: 'holiday-2', date: new Date('2024-12-10'), name: 'วันรัฐธรรมนูญ' },
];

export const userRoleGroups: { id: UserRoleGroup, label: string }[] = [
    { id: 'student', label: 'นักศึกษา' },
    { id: 'academic', label: 'บุคลากรสายวิชาการ' }
];

export const titles: UserTitle[] = [
    { id: 't-1', nameTh: 'นาย', nameEn: 'Mr.', applicableTo: ['student', 'academic'] },
    { id: 't-2', nameTh: 'นาง', nameEn: 'Mrs.', applicableTo: ['student', 'academic'] },
    { id: 't-3', nameTh: 'นางสาว', nameEn: 'Miss', applicableTo: ['student', 'academic'] },
    { id: 't-4', nameTh: 'ดร.', nameEn: 'Dr.', applicableTo: ['academic'] },
    { id: 't-5', nameTh: 'รศ.ดร.', nameEn: 'Assoc. Prof. Dr.', applicableTo: ['academic'] },
    { id: 't-6', nameTh: 'ว่าที่ร้อยตรี', nameEn: 'Acting Sub-Lieutenant', applicableTo: ['student', 'academic'] },
];

export const majors: Major[] = [
    { id: 'major-1', nameTh: 'เทคโนโลยีสารสนเทศ', nameEn: 'Information Technology', type: 'major' },
    { id: 'major-2', nameTh: 'วิทยาการคอมพิวเตอร์', nameEn: 'Computer Science', type: 'major' },
    { id: 'major-3', nameTh: 'วิศวกรรมซอฟต์แวร์', nameEn: 'Software Engineering', type: 'major' },
    { id: 'major-4', nameTh: 'การตลาดดิจิทัล', nameEn: 'Digital Marketing', type: 'minor' },
    { id: 'major-5', nameTh: 'การจัดการธุรกิจ', nameEn: 'Business Management', type: 'minor' },
];

export const companyEvaluations: CompanyEvaluation[] = [
    {
        internshipId: 'intern-2', // DataCorp
        companyName: 'DataCorp',
        isEvaluated: true,
        evaluationDate: '2024-08-01T10:00:00Z',
        questions: [
            { id: 'q1', question: 'ด้านการสนับสนุนและการให้คำปรึกษาจากพี่เลี้ยง', score: 5 },
            { id: 'q2', question: 'ด้านการมอบหมายงานที่ท้าทายและส่งเสริมการเรียนรู้', score: 4 },
        ]
    },
    {
        internshipId: 'intern-1', // Innovate Inc.
        companyName: 'Innovate Inc.',
        isEvaluated: false,
        evaluationDate: null,
        questions: [
            { id: 'q1', question: 'ด้านการสนับสนุนและการให้คำปรึกษาจากพี่เลี้ยง', score: null },
            { id: 'q2', question: 'ด้านการมอบหมายงานที่ท้าทายและส่งเสริมการเรียนรู้', score: null },
            { id: 'q3', question: 'ด้านสภาพแวดล้อมในการทำงานและวัฒนธรรมองค์กร', score: null },
            { id: 'q4', question: 'ด้านโอกาสในการพัฒนาทักษะและความรู้เพิ่มเติม', score: null },
            { id: 'q5', question: 'ด้านความชัดเจนของเนื้องานและเป้าหมาย', score: null },
        ]
    }
]
