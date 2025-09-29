import type { User, Internship, Application, ProgressReport } from './types';

export const users: User[] = [
  { id: 'user-1', name: 'Alice Johnson', email: 'student@example.com', password: 'password', role: 'student', skills: 'React, TypeScript, Node.js', statement: 'Eager to apply my web development skills in a real-world setting and contribute to a dynamic team.' },
  { id: 'user-2', name: 'Bob Williams', email: 'teacher@example.com', password: 'password', role: 'teacher' },
  { id: 'user-3', name: 'Charlie Brown', email: 'admin@example.com', password: 'password', role: 'admin' },
  { id: 'user-4', name: 'Diana Prince', email: 'student2@example.com', password: 'password', role: 'student', skills: 'Python, Django, Data Analysis', statement: 'Passionate about data and looking to gain experience in backend development and machine learning.' },
];

export const internships: Internship[] = [
  { id: 'intern-1', title: 'Frontend Developer Intern', company: 'Innovate Inc.', location: 'Remote', description: 'Work with our frontend team to build and maintain our React-based web applications. Experience with TypeScript and Tailwind CSS is a plus.' },
  { id: 'intern-2', title: 'Backend Developer Intern', company: 'DataCorp', location: 'New York, NY', description: 'Join our backend team to develop and optimize our Python/Django services. Focus on API design, database management, and performance.' },
  { id: 'intern-3', title: 'UX/UI Design Intern', company: 'Creative Solutions', location: 'San Francisco, CA', description: 'Help shape the user experience of our products. Create wireframes, mockups, and prototypes. Proficiency in Figma is required.' },
];

export let applications: Application[] = [
  { id: 'app-1', studentId: 'user-1', internshipId: 'intern-1', status: 'pending', dateApplied: '2024-07-20' },
  { id: 'app-2', studentId: 'user-4', internshipId: 'intern-2', status: 'approved', dateApplied: '2024-07-18' },
  { id: 'app-3', studentId: 'user-1', internshipId: 'intern-3', status: 'rejected', dateApplied: '2024-07-15', feedback: 'Lacks required portfolio experience in UX/UI design.' },
  { id: 'app-4', studentId: 'user-4', internshipId: 'intern-1', status: 'pending', dateApplied: '2024-07-21' },
];

export let progressReports: ProgressReport[] = [
  { id: 'report-1', applicationId: 'app-2', report: 'Week 1: Onboarding complete. Met the team and set up my development environment. Started working on my first ticket for API optimization.', date: '2024-07-25' }
];
