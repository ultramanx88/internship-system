/**
 * API layer for Educator Role Management System
 * ชั้น API สำหรับระบบจัดการบทบาท Educator
 */

import { 
  EducatorRoleAssignment,
  CreateAssignmentData,
  UpdateAssignmentData,
  AssignmentFilters,
  PaginationParams,
  AssignmentListResponse,
  AssignmentResponse,
  Educator,
  AcademicYear,
  Semester,
  RoleOption
} from './types';
import { DEFAULT_CONFIG } from './constants';

export class EducatorRoleAPI {
  private config = DEFAULT_CONFIG;

  constructor(config?: Partial<typeof DEFAULT_CONFIG>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * โหลดรายการการกำหนดบทบาท
   */
  async getAssignments(
    filters?: AssignmentFilters,
    pagination?: PaginationParams
  ): Promise<AssignmentListResponse> {
    try {
      const params = new URLSearchParams();
      
      // Add filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      // Add pagination
      if (pagination) {
        params.append('page', pagination.page.toString());
        params.append('limit', pagination.limit.toString());
        if (pagination.sortBy) {
          params.append('sortBy', pagination.sortBy);
        }
        if (pagination.sortOrder) {
          params.append('sortOrder', pagination.sortOrder);
        }
      }

      const url = `${this.config.endpoints.assignments}?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return {
        success: false,
        assignments: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * สร้างการกำหนดบทบาทใหม่
   */
  async createAssignment(data: CreateAssignmentData): Promise<AssignmentResponse> {
    try {
      const response = await fetch(this.config.endpoints.assignments, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Error creating assignment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * อัปเดตการกำหนดบทบาท
   */
  async updateAssignment(data: UpdateAssignmentData): Promise<AssignmentResponse> {
    try {
      const response = await fetch(`${this.config.endpoints.assignments}/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Error updating assignment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * ลบการกำหนดบทบาท
   */
  async deleteAssignment(id: string): Promise<AssignmentResponse> {
    try {
      const response = await fetch(`${this.config.endpoints.assignments}/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Error deleting assignment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * โหลดรายการ Educator
   */
  async getEducators(): Promise<Educator[]> {
    try {
      const response = await fetch(this.config.endpoints.educators);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.users || data || [];
    } catch (error) {
      console.error('Error fetching educators:', error);
      return [];
    }
  }

  /**
   * โหลดรายการปีการศึกษา
   */
  async getAcademicYears(): Promise<AcademicYear[]> {
    try {
      const response = await fetch(this.config.endpoints.academicYears);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.academicYears || data || [];
    } catch (error) {
      console.error('Error fetching academic years:', error);
      return [];
    }
  }

  /**
   * โหลดรายการภาคเรียน
   */
  async getSemesters(academicYearId?: string): Promise<Semester[]> {
    try {
      let url = this.config.endpoints.semesters;
      if (academicYearId) {
        url += `?academicYearId=${academicYearId}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.semesters || data || [];
    } catch (error) {
      console.error('Error fetching semesters:', error);
      return [];
    }
  }

  /**
   * โหลดรายการตัวเลือกบทบาท
   */
  async getRoleOptions(): Promise<RoleOption[]> {
    try {
      const response = await fetch(this.config.endpoints.roleOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.roles || data || [];
    } catch (error) {
      console.error('Error fetching role options:', error);
      return [];
    }
  }

  /**
   * ตรวจสอบการกำหนดบทบาทซ้ำ
   */
  async checkDuplicateAssignment(
    educatorId: string,
    academicYearId: string,
    semesterId: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const params = new URLSearchParams({
        educatorId,
        academicYearId,
        semesterId
      });

      if (excludeId) {
        params.append('excludeId', excludeId);
      }

      const response = await fetch(`${this.config.endpoints.assignments}/check-duplicate?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.isDuplicate || false;
    } catch (error) {
      console.error('Error checking duplicate assignment:', error);
      return false;
    }
  }

  /**
   * ส่งออกรายงานการกำหนดบทบาท
   */
  async exportAssignments(
    filters?: AssignmentFilters,
    format: 'csv' | 'excel' | 'pdf' = 'csv'
  ): Promise<Blob | null> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      params.append('format', format);

      const response = await fetch(`${this.config.endpoints.assignments}/export?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting assignments:', error);
      return null;
    }
  }

  /**
   * ตรวจสอบสถานะการเชื่อมต่อ
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.endpoints.assignments}/health`);
      return response.ok;
    } catch (error) {
      console.error('Error checking connection:', error);
      return false;
    }
  }

  /**
   * ตั้งค่า API endpoints
   */
  setEndpoints(endpoints: Partial<typeof this.config.endpoints>): void {
    this.config.endpoints = { ...this.config.endpoints, ...endpoints };
  }

  /**
   * ตั้งค่าการกำหนดค่า
   */
  setConfig(config: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * ดึงการกำหนดค่าปัจจุบัน
   */
  getConfig(): typeof this.config {
    return { ...this.config };
  }
}

// Export singleton instance
export const educatorRoleAPI = new EducatorRoleAPI();
