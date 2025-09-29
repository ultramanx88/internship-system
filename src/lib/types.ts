export type Role =
  | 'student'
  | 'staff'
  | 'courseInstructor'
  | 'committee'
  | 'visitor'
  | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string; // Should be handled securely, present for mock data
  roles: Role[];
  skills?: string;
  statement?: string;
};

export type Internship = {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
};

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export type Application = {
  id: string;
  studentId: string;
  internshipId: string;
  status: ApplicationStatus;
  dateApplied: string;
  feedback?: string;
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