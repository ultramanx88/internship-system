/**
 * Business logic for Educator Role Assignment Management
 * ตรรกะทางธุรกิจสำหรับการจัดการการกำหนดบทบาท Educator
 */

import { 
  EducatorRoleAssignment,
  CreateAssignmentData,
  UpdateAssignmentData,
  AssignmentFilters,
  PaginationParams,
  Educator,
  AcademicYear,
  Semester,
  RoleOption
} from './types';
import { EducatorRoleAPI } from './api';
import { EducatorRoleValidator } from './validation';
import { ROLE_OPTIONS } from './constants';

export class EducatorRoleAssignmentManager {
  private api: EducatorRoleAPI;
  private assignments: EducatorRoleAssignment[] = [];
  private educators: Educator[] = [];
  private academicYears: AcademicYear[] = [];
  private semesters: Semester[] = [];
  private roleOptions: RoleOption[] = ROLE_OPTIONS;

  constructor(api?: EducatorRoleAPI) {
    this.api = api || new EducatorRoleAPI();
  }

  /**
   * โหลดข้อมูลทั้งหมด
   */
  async loadAllData(): Promise<void> {
    try {
      await Promise.all([
        this.loadAssignments(),
        this.loadEducators(),
        this.loadAcademicYears(),
        this.loadSemesters(),
        this.loadRoleOptions()
      ]);
    } catch (error) {
      console.error('Error loading all data:', error);
      throw error;
    }
  }

  /**
   * โหลดรายการการกำหนดบทบาท
   */
  async loadAssignments(filters?: AssignmentFilters, pagination?: PaginationParams): Promise<EducatorRoleAssignment[]> {
    try {
      const response = await this.api.getAssignments(filters, pagination);
      
      if (response.success) {
        this.assignments = response.assignments;
        return this.assignments;
      } else {
        throw new Error(response.error || 'Failed to load assignments');
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      throw error;
    }
  }

  /**
   * โหลดรายการ Educator
   */
  async loadEducators(): Promise<Educator[]> {
    try {
      this.educators = await this.api.getEducators();
      return this.educators;
    } catch (error) {
      console.error('Error loading educators:', error);
      throw error;
    }
  }

  /**
   * โหลดรายการปีการศึกษา
   */
  async loadAcademicYears(): Promise<AcademicYear[]> {
    try {
      this.academicYears = await this.api.getAcademicYears();
      return this.academicYears;
    } catch (error) {
      console.error('Error loading academic years:', error);
      throw error;
    }
  }

  /**
   * โหลดรายการภาคเรียน
   */
  async loadSemesters(academicYearId?: string): Promise<Semester[]> {
    try {
      this.semesters = await this.api.getSemesters(academicYearId);
      return this.semesters;
    } catch (error) {
      console.error('Error loading semesters:', error);
      throw error;
    }
  }

  /**
   * โหลดรายการตัวเลือกบทบาท
   */
  async loadRoleOptions(): Promise<RoleOption[]> {
    try {
      this.roleOptions = await this.api.getRoleOptions();
      return this.roleOptions;
    } catch (error) {
      console.error('Error loading role options:', error);
      // Fallback to default options
      this.roleOptions = ROLE_OPTIONS;
      return this.roleOptions;
    }
  }

  /**
   * สร้างการกำหนดบทบาทใหม่
   */
  async createAssignment(data: CreateAssignmentData): Promise<EducatorRoleAssignment> {
    try {
      // ตรวจสอบข้อมูล
      const validation = EducatorRoleValidator.validateCreateAssignment(data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      // ตรวจสอบการกำหนดบทบาทซ้ำ
      const isDuplicate = await this.api.checkDuplicateAssignment(
        data.educatorId,
        data.academicYearId,
        data.semesterId
      );

      if (isDuplicate) {
        throw new Error('มีการกำหนดบทบาทสำหรับ Educator นี้ในเทอม/ปีการศึกษานี้แล้ว');
      }

      // สร้างการกำหนดบทบาท
      const response = await this.api.createAssignment(data);
      
      if (response.success && response.assignment) {
        // อัปเดต local state
        this.assignments.unshift(response.assignment);
        return response.assignment;
      } else {
        throw new Error(response.error || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  }

  /**
   * อัปเดตการกำหนดบทบาท
   */
  async updateAssignment(data: UpdateAssignmentData): Promise<EducatorRoleAssignment> {
    try {
      // ตรวจสอบข้อมูล
      const validation = EducatorRoleValidator.validateUpdateAssignment(data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      // ตรวจสอบการกำหนดบทบาทซ้ำ (ถ้ามีการเปลี่ยน educator, year, หรือ semester)
      if (data.educatorId || data.academicYearId || data.semesterId) {
        const existingAssignment = this.assignments.find(a => a.id === data.id);
        if (existingAssignment) {
          const educatorId = data.educatorId || existingAssignment.educatorId;
          const academicYearId = data.academicYearId || existingAssignment.academicYearId;
          const semesterId = data.semesterId || existingAssignment.semesterId;

          const isDuplicate = await this.api.checkDuplicateAssignment(
            educatorId,
            academicYearId,
            semesterId,
            data.id
          );

          if (isDuplicate) {
            throw new Error('มีการกำหนดบทบาทสำหรับ Educator นี้ในเทอม/ปีการศึกษานี้แล้ว');
          }
        }
      }

      // อัปเดตการกำหนดบทบาท
      const response = await this.api.updateAssignment(data);
      
      if (response.success && response.assignment) {
        // อัปเดต local state
        const index = this.assignments.findIndex(a => a.id === data.id);
        if (index !== -1) {
          this.assignments[index] = response.assignment;
        }
        return response.assignment;
      } else {
        throw new Error(response.error || 'Failed to update assignment');
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  }

  /**
   * ลบการกำหนดบทบาท
   */
  async deleteAssignment(id: string): Promise<void> {
    try {
      const response = await this.api.deleteAssignment(id);
      
      if (response.success) {
        // อัปเดต local state
        this.assignments = this.assignments.filter(a => a.id !== id);
      } else {
        throw new Error(response.error || 'Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  }

  /**
   * ค้นหาการกำหนดบทบาท
   */
  searchAssignments(query: string): EducatorRoleAssignment[] {
    if (!query.trim()) {
      return this.assignments;
    }

    const lowercaseQuery = query.toLowerCase();
    return this.assignments.filter(assignment => {
      const educatorName = this.getEducatorName(assignment.educator);
      const academicYearName = assignment.academicYear.name;
      const semesterName = assignment.semester.name;
      const rolesText = assignment.roles.join(' ');

      return (
        educatorName.toLowerCase().includes(lowercaseQuery) ||
        academicYearName.toLowerCase().includes(lowercaseQuery) ||
        semesterName.toLowerCase().includes(lowercaseQuery) ||
        rolesText.toLowerCase().includes(lowercaseQuery) ||
        assignment.notes?.toLowerCase().includes(lowercaseQuery)
      );
    });
  }

  /**
   * กรองการกำหนดบทบาท
   */
  filterAssignments(filters: AssignmentFilters): EducatorRoleAssignment[] {
    let filtered = [...this.assignments];

    if (filters.academicYearId) {
      filtered = filtered.filter(a => a.academicYearId === filters.academicYearId);
    }

    if (filters.semesterId) {
      filtered = filtered.filter(a => a.semesterId === filters.semesterId);
    }

    if (filters.educatorId) {
      filtered = filtered.filter(a => a.educatorId === filters.educatorId);
    }

    if (filters.role) {
      filtered = filtered.filter(a => a.roles.includes(filters.role!));
    }

    if (filters.isActive !== undefined) {
      filtered = filtered.filter(a => a.isActive === filters.isActive);
    }

    if (filters.search) {
      filtered = this.searchAssignments(filters.search);
    }

    return filtered;
  }

  /**
   * เรียงลำดับการกำหนดบทบาท
   */
  sortAssignments(
    assignments: EducatorRoleAssignment[],
    sortBy: string,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): EducatorRoleAssignment[] {
    return [...assignments].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'educator.name':
          aValue = this.getEducatorName(a.educator);
          bValue = this.getEducatorName(b.educator);
          break;
        case 'academicYear.year':
          aValue = a.academicYear.year;
          bValue = b.academicYear.year;
          break;
        case 'semester.name':
          aValue = a.semester.name;
          bValue = b.semester.name;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        default:
          aValue = a[sortBy as keyof EducatorRoleAssignment];
          bValue = b[sortBy as keyof EducatorRoleAssignment];
      }

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * แบ่งหน้าข้อมูล
   */
  paginateAssignments(
    assignments: EducatorRoleAssignment[],
    page: number,
    limit: number
  ): { data: EducatorRoleAssignment[]; total: number; totalPages: number } {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = assignments.slice(startIndex, endIndex);
    const total = assignments.length;
    const totalPages = Math.ceil(total / limit);

    return { data, total, totalPages };
  }

  /**
   * ดึงชื่อ Educator
   */
  getEducatorName(educator: Educator): string {
    if (educator.t_name && educator.t_surname) {
      return `${educator.t_name} ${educator.t_surname}`;
    }
    if (educator.e_name && educator.e_surname) {
      return `${educator.e_name} ${educator.e_surname}`;
    }
    return educator.name;
  }

  /**
   * ดึงชื่อบทบาท
   */
  getRoleNames(roles: string[]): string[] {
    return roles.map(role => {
      const roleOption = this.roleOptions.find(r => r.value === role);
      return roleOption ? roleOption.label : role;
    });
  }

  /**
   * ตรวจสอบว่ามีการกำหนดบทบาทหรือไม่
   */
  hasAssignment(educatorId: string, academicYearId: string, semesterId: string): boolean {
    return this.assignments.some(a => 
      a.educatorId === educatorId &&
      a.academicYearId === academicYearId &&
      a.semesterId === semesterId
    );
  }

  /**
   * ดึงการกำหนดบทบาทตาม ID
   */
  getAssignmentById(id: string): EducatorRoleAssignment | undefined {
    return this.assignments.find(a => a.id === id);
  }

  /**
   * ดึงการกำหนดบทบาทตาม Educator
   */
  getAssignmentsByEducator(educatorId: string): EducatorRoleAssignment[] {
    return this.assignments.filter(a => a.educatorId === educatorId);
  }

  /**
   * ดึงการกำหนดบทบาทตามปีการศึกษา
   */
  getAssignmentsByAcademicYear(academicYearId: string): EducatorRoleAssignment[] {
    return this.assignments.filter(a => a.academicYearId === academicYearId);
  }

  /**
   * ดึงการกำหนดบทบาทตามภาคเรียน
   */
  getAssignmentsBySemester(semesterId: string): EducatorRoleAssignment[] {
    return this.assignments.filter(a => a.semesterId === semesterId);
  }

  /**
   * ดึงข้อมูลปัจจุบัน
   */
  getCurrentData() {
    return {
      assignments: this.assignments,
      educators: this.educators,
      academicYears: this.academicYears,
      semesters: this.semesters,
      roleOptions: this.roleOptions
    };
  }

  /**
   * รีเซ็ตข้อมูล
   */
  reset(): void {
    this.assignments = [];
    this.educators = [];
    this.academicYears = [];
    this.semesters = [];
    this.roleOptions = ROLE_OPTIONS;
  }
}
