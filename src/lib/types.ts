// Defining user roles
export type Role =
  | 'admin'
  | 'staff'
  | 'courseInstructor'
  | 'committee'
  | 'visitor'
  | 'student';

// Defining application status
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

// Defining internship type
export type InternshipType = 'internship' | 'co-op';

// Base User type from data
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  roles: Role[];
  skills?: string;
  statement?: string;
}

// Internship type
export interface Internship {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    type: InternshipType;
}

// Application type
export interface Application {
    id: string;
    studentId: string;
    internshipId: string;
    status: ApplicationStatus;
    dateApplied: string;
    feedback?: string;
    projectTopic?: string;
}

// Progress Report type
export interface ProgressReport {
    id: string;
    applicationId: string;
    report: string;
    date: string;
}

// Academic Term type
export interface AcademicTerm {
    id: string;
    year: number;
    semester: string;
    startDate: Date;
    endDate: Date;
}

// Holiday type
export interface Holiday {
    id: string;
    date: Date;
    name: string;
}

// User Role Group for settings
export type UserRoleGroup = 'student' | 'academic';

// User Title type
export interface UserTitle {
    id: string;
    nameTh: string;
    nameEn: string;
    applicableTo: UserRoleGroup[];
}

// Major/Minor type
export interface Major {
    id: string;
    nameTh: string;
    nameEn: string;
    type: 'major' | 'minor';
}

// Company Evaluation type
export interface CompanyEvaluation {
    internshipId: string;
    companyName: string;
    isEvaluated: boolean;
    evaluationDate: string | null;
    questions: Company