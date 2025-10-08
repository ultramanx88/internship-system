/**
 * Constants for Educator Role Management System
 * ค่าคงที่สำหรับระบบจัดการบทบาท Educator
 */

import { RoleOption, EducatorRoleManagementConfig } from './types';

// Role Options
export const ROLE_OPTIONS: RoleOption[] = [
  {
    value: 'courseInstructor',
    label: 'อาจารย์ประจำวิชา',
    labelEn: 'Course Instructor',
    description: 'รับผิดชอบการสอนและประเมินผลนักศึกษา',
    descriptionEn: 'Responsible for teaching and evaluating students',
    isActive: true
  },
  {
    value: 'supervisor',
    label: 'อาจารย์นิเทศ',
    labelEn: 'Supervisor',
    description: 'ดูแลและให้คำแนะนำนักศึกษาในการฝึกงาน',
    descriptionEn: 'Supervise and guide students during internship',
    isActive: true
  },
  {
    value: 'committee',
    label: 'กรรมการ',
    labelEn: 'Committee Member',
    description: 'พิจารณาและอนุมัติใบสมัครฝึกงาน',
    descriptionEn: 'Review and approve internship applications',
    isActive: true
  },
  {
    value: 'visitor',
    label: 'ผู้เยี่ยมชม',
    labelEn: 'Visitor',
    description: 'เยี่ยมชมและประเมินสถานประกอบการ',
    descriptionEn: 'Visit and evaluate companies',
    isActive: true
  }
];

// Default Configuration
export const DEFAULT_CONFIG: EducatorRoleManagementConfig = {
  endpoints: {
    assignments: '/api/educator-role-assignments',
    educators: '/api/users?role=educator',
    academicYears: '/api/academic-years',
    semesters: '/api/semesters',
    roleOptions: '/api/educator-roles'
  },
  defaults: {
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    showInactive: false
  },
  permissions: {
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canViewInactive: true
  },
  ui: {
    showSearch: true,
    showFilters: true,
    showPagination: true,
    showBulkActions: true
  }
};

// Validation Rules
export const VALIDATION_RULES = {
  educatorId: {
    required: true,
    message: 'กรุณาเลือก Educator'
  },
  academicYearId: {
    required: true,
    message: 'กรุณาเลือกปีการศึกษา'
  },
  semesterId: {
    required: true,
    message: 'กรุณาเลือกภาคเรียน'
  },
  roles: {
    required: true,
    minLength: 1,
    message: 'กรุณาเลือกบทบาทอย่างน้อย 1 บทบาท'
  },
  notes: {
    maxLength: 500,
    message: 'หมายเหตุต้องไม่เกิน 500 ตัวอักษร'
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์',
  VALIDATION_ERROR: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
  NOT_FOUND: 'ไม่พบข้อมูลที่ต้องการ',
  UNAUTHORIZED: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้',
  CONFLICT: 'มีการกำหนดบทบาทซ้ำในเทอมเดียวกัน',
  SERVER_ERROR: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์',
  UNKNOWN_ERROR: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'สร้างการกำหนดบทบาทสำเร็จ',
  UPDATED: 'อัปเดตการกำหนดบทบาทสำเร็จ',
  DELETED: 'ลบการกำหนดบทบาทสำเร็จ',
  LOADED: 'โหลดข้อมูลสำเร็จ'
};

// UI Constants
export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  MAX_SEARCH_LENGTH: 100,
  MAX_NOTES_LENGTH: 500,
  PAGINATION_SIZES: [5, 10, 20, 50],
  SORT_OPTIONS: [
    { value: 'createdAt', label: 'วันที่สร้าง' },
    { value: 'updatedAt', label: 'วันที่อัปเดต' },
    { value: 'educator.name', label: 'ชื่อ Educator' },
    { value: 'academicYear.year', label: 'ปีการศึกษา' },
    { value: 'semester.name', label: 'ภาคเรียน' }
  ]
};

// API Response Status
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
  IDLE: 'idle'
} as const;

// Form States
export const FORM_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

// Table Columns
export const TABLE_COLUMNS = [
  { key: 'educator', label: 'Educator', sortable: true },
  { key: 'academicYear', label: 'ปีการศึกษา', sortable: true },
  { key: 'semester', label: 'ภาคเรียน', sortable: true },
  { key: 'roles', label: 'บทบาท', sortable: false },
  { key: 'isActive', label: 'สถานะ', sortable: true },
  { key: 'createdAt', label: 'วันที่สร้าง', sortable: true },
  { key: 'actions', label: 'การดำเนินการ', sortable: false }
];

// Filter Options
export const FILTER_OPTIONS = {
  STATUS: [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'active', label: 'ใช้งาน' },
    { value: 'inactive', label: 'ไม่ใช้งาน' }
  ],
  ROLES: ROLE_OPTIONS.map(role => ({
    value: role.value,
    label: role.label
  }))
};

// Local Storage Keys
export const STORAGE_KEYS = {
  FILTERS: 'educator-role-filters',
  PAGINATION: 'educator-role-pagination',
  SELECTED_ASSIGNMENT: 'educator-role-selected'
};

// Event Names
export const EVENTS = {
  ASSIGNMENT_CREATED: 'educator-role-assignment-created',
  ASSIGNMENT_UPDATED: 'educator-role-assignment-updated',
  ASSIGNMENT_DELETED: 'educator-role-assignment-deleted',
  FILTERS_CHANGED: 'educator-role-filters-changed',
  PAGINATION_CHANGED: 'educator-role-pagination-changed'
} as const;
