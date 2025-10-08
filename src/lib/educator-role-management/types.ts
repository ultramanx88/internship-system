/**
 * Types for Educator Role Management System
 * ระบบจัดการบทบาท Educator ที่เชื่อมต่อกับปีการศึกษาและภาคเรียน
 */

export interface Educator {
  id: string;
  name: string;
  email: string;
  t_name?: string;
  t_surname?: string;
  e_name?: string;
  e_surname?: string;
  roles: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicYear {
  id: string;
  year: number;
  name: string;
  nameEn?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Semester {
  id: string;
  name: string;
  nameEn?: string;
  academicYearId: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  academicYear?: AcademicYear;
}

export interface EducatorRoleAssignment {
  id: string;
  educatorId: string;
  academicYearId: string;
  semesterId: string;
  roles: string[]; // JSON array of roles
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  educator: Educator;
  academicYear: AcademicYear;
  semester: Semester;
}

export interface RoleOption {
  value: string;
  label: string;
  labelEn: string;
  description: string;
  descriptionEn: string;
  isActive: boolean;
}

export interface CreateAssignmentData {
  educatorId: string;
  academicYearId: string;
  semesterId: string;
  roles: string[];
  isActive: boolean;
  notes?: string;
}

export interface UpdateAssignmentData extends Partial<CreateAssignmentData> {
  id: string;
}

export interface AssignmentFilters {
  academicYearId?: string;
  semesterId?: string;
  educatorId?: string;
  role?: string;
  isActive?: boolean;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AssignmentListResponse {
  success: boolean;
  assignments: EducatorRoleAssignment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  error?: string;
}

export interface AssignmentResponse {
  success: boolean;
  assignment?: EducatorRoleAssignment;
  message?: string;
  error?: string;
}

export interface EducatorRoleManagementState {
  // Data
  assignments: EducatorRoleAssignment[];
  educators: Educator[];
  academicYears: AcademicYear[];
  semesters: Semester[];
  roleOptions: RoleOption[];
  
  // UI State
  loading: boolean;
  error: string | null;
  selectedAssignment: EducatorRoleAssignment | null;
  
  // Filters
  filters: AssignmentFilters;
  pagination: PaginationParams;
  
  // Form State
  isFormOpen: boolean;
  isEditing: boolean;
  formData: Partial<CreateAssignmentData>;
}

export interface EducatorRoleManagementActions {
  // Data Management
  loadAssignments: (filters?: AssignmentFilters) => Promise<void>;
  loadEducators: () => Promise<void>;
  loadAcademicYears: () => Promise<void>;
  loadSemesters: (academicYearId?: string) => Promise<void>;
  loadRoleOptions: () => Promise<void>;
  
  // Assignment Management
  createAssignment: (data: CreateAssignmentData) => Promise<AssignmentResponse>;
  updateAssignment: (data: UpdateAssignmentData) => Promise<AssignmentResponse>;
  deleteAssignment: (id: string) => Promise<AssignmentResponse>;
  
  // UI Management
  setSelectedAssignment: (assignment: EducatorRoleAssignment | null) => void;
  openForm: (assignment?: EducatorRoleAssignment) => void;
  closeForm: () => void;
  setFilters: (filters: Partial<AssignmentFilters>) => void;
  setPagination: (pagination: Partial<PaginationParams>) => void;
  
  // Form Management
  setFormData: (data: Partial<CreateAssignmentData>) => void;
  resetForm: () => void;
  validateForm: () => boolean;
}

export interface EducatorRoleManagementConfig {
  // API Endpoints
  endpoints: {
    assignments: string;
    educators: string;
    academicYears: string;
    semesters: string;
    roleOptions: string;
  };
  
  // Default Settings
  defaults: {
    pageSize: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    showInactive: boolean;
  };
  
  // Permissions
  permissions: {
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canViewInactive: boolean;
  };
  
  // UI Settings
  ui: {
    showSearch: boolean;
    showFilters: boolean;
    showPagination: boolean;
    showBulkActions: boolean;
  };
}

export interface EducatorRoleManagementProps {
  // Data
  assignments?: EducatorRoleAssignment[];
  educators?: Educator[];
  academicYears?: AcademicYear[];
  semesters?: Semester[];
  
  // Configuration
  config?: Partial<EducatorRoleManagementConfig>;
  
  // Callbacks
  onAssignmentCreate?: (assignment: EducatorRoleAssignment) => void;
  onAssignmentUpdate?: (assignment: EducatorRoleAssignment) => void;
  onAssignmentDelete?: (id: string) => void;
  onError?: (error: string) => void;
  
  // UI Props
  className?: string;
  readOnly?: boolean;
  showCreateButton?: boolean;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
}
