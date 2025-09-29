export type Role = 'student' | 'teacher' | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string; // Should be handled securely, present for mock data
  role: Role;
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
