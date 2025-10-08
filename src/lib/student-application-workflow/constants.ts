import { WorkflowStep, WorkflowConfig } from './types';

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 1,
    title: 'ลงทะเบียนข้อมูลนักศึกษา',
    titleEn: 'Student Registration',
    description: 'กรอกข้อมูลส่วนตัวและข้อมูลทางวิชาการให้ครบถ้วน',
    descriptionEn: 'Complete personal and academic information',
    route: '/student/settings',
    status: 'pending',
    canProceed: false,
    dependencies: [],
    icon: 'user'
  },
  {
    id: 2,
    title: 'กรอกข้อมูลสหกิจศึกษาหรือฝึกงาน',
    titleEn: 'Application Form',
    description: 'กรอกรายละเอียดการฝึกงานและบริษัทที่ต้องการ',
    descriptionEn: 'Fill in internship details and preferred company',
    route: '/student/application-form/internship-form',
    status: 'pending',
    canProceed: false,
    dependencies: ['profile_complete'],
    icon: 'file-text'
  },
  {
    id: 3,
    title: 'ยื่นเอกสารให้กับทางบริษัท',
    titleEn: 'Document Submission',
    description: 'อัปโหลดเอกสารที่จำเป็นสำหรับการฝึกงาน',
    descriptionEn: 'Upload required documents for internship',
    route: '/student/documents',
    status: 'pending',
    canProceed: false,
    dependencies: ['application_submitted'],
    icon: 'upload'
  },
  {
    id: 4,
    title: 'ช่วงสหกิจศึกษา / ฝึกงาน',
    titleEn: 'Internship Period',
    description: 'ติดตามความคืบหน้าการฝึกงาน',
    descriptionEn: 'Track internship progress',
    route: '/student/internships',
    status: 'pending',
    canProceed: false,
    dependencies: ['application_approved'],
    icon: 'briefcase'
  },
  {
    id: 5,
    title: 'กรอกหัวข้อโปรเจกต์',
    titleEn: 'Project Details',
    description: 'กรอกรายละเอียดโปรเจกต์ที่ทำระหว่างฝึกงาน',
    descriptionEn: 'Fill in project details during internship',
    route: '/student/project-details',
    status: 'pending',
    canProceed: false,
    dependencies: ['internship_active'],
    icon: 'target'
  }
];

export const VALIDATION_RULES = {
  profile: {
    required: ['name', 'email', 'phone', 't_name', 't_surname', 'facultyId', 'majorId'],
    minLength: {
      name: 2,
      email: 5,
      phone: 10
    },
    maxLength: {
      name: 100,
      email: 100,
      phone: 20
    }
  },
  application: {
    required: ['companyId', 'position', 'startDate', 'endDate', 'projectTopic'],
    minLength: {
      position: 5,
      projectTopic: 10
    },
    maxLength: {
      position: 200,
      projectTopic: 500
    }
  },
  documents: {
    required: ['resume', 'transcript'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
  }
};

export const NAVIGATION_RULES = {
  step1: {
    canProceed: 'profile_complete',
    nextStep: 2
  },
  step2: {
    canProceed: 'application_submitted',
    nextStep: 3,
    previousStep: 1
  },
  step3: {
    canProceed: 'documents_uploaded',
    nextStep: 4,
    previousStep: 2
  },
  step4: {
    canProceed: 'internship_active',
    nextStep: 5,
    previousStep: 3
  },
  step5: {
    canProceed: 'project_completed',
    previousStep: 4
  }
};

export const UI_CONFIG = {
  theme: {
    primary: 'blue',
    success: 'green',
    warning: 'yellow',
    error: 'red'
  },
  icons: {
    user: 'User',
    'file-text': 'FileText',
    upload: 'Upload',
    briefcase: 'Briefcase',
    target: 'Target',
    check: 'Check',
    lock: 'Lock',
    arrow: 'ArrowRight'
  },
  messages: {
    th: {
      profileIncomplete: 'กรุณากรอกโปรไฟล์ให้ครบก่อน',
      applicationIncomplete: 'กรุณากรอกข้อมูลการฝึกงานให้ครบก่อน',
      documentsIncomplete: 'กรุณาอัปโหลดเอกสารที่จำเป็นก่อน',
      internshipNotActive: 'ยังไม่สามารถเข้าสู่ช่วงฝึกงานได้',
      projectIncomplete: 'กรุณากรอกข้อมูลโปรเจกต์ให้ครบก่อน'
    },
    en: {
      profileIncomplete: 'Please complete your profile first',
      applicationIncomplete: 'Please complete the internship application first',
      documentsIncomplete: 'Please upload required documents first',
      internshipNotActive: 'Cannot proceed to internship period yet',
      projectIncomplete: 'Please complete project details first'
    }
  }
};

export const WORKFLOW_CONFIG: WorkflowConfig = {
  steps: WORKFLOW_STEPS,
  validationRules: VALIDATION_RULES,
  navigationRules: NAVIGATION_RULES,
  uiConfig: UI_CONFIG
};
