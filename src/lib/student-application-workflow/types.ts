export interface WorkflowStep {
  id: number;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  route: string;
  status: 'completed' | 'current' | 'pending' | 'locked';
  canProceed: boolean;
  dependencies: string[];
  icon: string;
}

export interface ApplicationFormData {
  // Basic Info
  studentId: string;
  type: 'internship' | 'coop';
  
  // Academic Info
  academicYearId: string;
  semesterId: string;
  
  // Company Info
  companyId: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  
  // Internship Details
  position: string;
  startDate: string;
  endDate: string;
  workingDays: string;
  workingHours: string;
  salary: string;
  
  // Project Info
  projectTopic: string;
  projectDescription: string;
  projectObjectives: string;
  projectScope: string;
  
  // Additional Info
  feedback: string;
  expectations: string;
  skills: string;
  
  // Location
  address: {
    province: string;
    district: string;
    subdistrict: string;
    postalCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  
  // Documents
  documents: Document[];
  
  // Status
  status: 'draft' | 'submitted' | 'instructor_review' | 'committee_review' | 'approved' | 'rejected';
  submittedAt?: string;
  reviewedAt?: string;
}

export interface Document {
  id: string;
  type: string;
  name: string;
  url: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface WorkflowState {
  currentStep: number;
  completedSteps: number[];
  lockedSteps: number[];
  canProceed: boolean;
  lastUpdated: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  t_name: string;
  t_surname: string;
  t_title: string;
  facultyId: string;
  majorId: string;
  departmentId: string;
  curriculumId: string;
  profileComplete: boolean;
}

export interface Application {
  id: string;
  studentId: string;
  type: 'internship' | 'coop';
  status: string;
  projectTopic?: string;
  feedback?: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowConfig {
  steps: WorkflowStep[];
  validationRules: Record<string, any>;
  navigationRules: Record<string, any>;
  uiConfig: Record<string, any>;
}
