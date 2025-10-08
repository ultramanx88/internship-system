/**
 * Validation logic for Educator Role Management System
 * ตรรกะการตรวจสอบข้อมูลสำหรับระบบจัดการบทบาท Educator
 */

import { 
  CreateAssignmentData, 
  UpdateAssignmentData, 
  AssignmentFilters,
  Educator,
  AcademicYear,
  Semester 
} from './types';
import { VALIDATION_RULES } from './constants';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

export class EducatorRoleValidator {
  /**
   * ตรวจสอบข้อมูลการสร้างการกำหนดบทบาท
   */
  static validateCreateAssignment(data: CreateAssignmentData): ValidationResult {
    const errors: Record<string, string> = {};

    // ตรวจสอบ educatorId
    if (!data.educatorId) {
      errors.educatorId = VALIDATION_RULES.educatorId.message;
    }

    // ตรวจสอบ academicYearId
    if (!data.academicYearId) {
      errors.academicYearId = VALIDATION_RULES.academicYearId.message;
    }

    // ตรวจสอบ semesterId
    if (!data.semesterId) {
      errors.semesterId = VALIDATION_RULES.semesterId.message;
    }

    // ตรวจสอบ roles
    if (!data.roles || data.roles.length === 0) {
      errors.roles = VALIDATION_RULES.roles.message;
    }

    // ตรวจสอบ notes
    if (data.notes && data.notes.length > VALIDATION_RULES.notes.maxLength) {
      errors.notes = VALIDATION_RULES.notes.message;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * ตรวจสอบข้อมูลการอัปเดตการกำหนดบทบาท
   */
  static validateUpdateAssignment(data: UpdateAssignmentData): ValidationResult {
    const errors: Record<string, string> = {};

    // ตรวจสอบ id
    if (!data.id) {
      errors.id = 'ID การกำหนดบทบาทไม่ถูกต้อง';
    }

    // ตรวจสอบ roles ถ้ามี
    if (data.roles !== undefined) {
      if (!data.roles || data.roles.length === 0) {
        errors.roles = VALIDATION_RULES.roles.message;
      }
    }

    // ตรวจสอบ notes ถ้ามี
    if (data.notes && data.notes.length > VALIDATION_RULES.notes.maxLength) {
      errors.notes = VALIDATION_RULES.notes.message;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * ตรวจสอบข้อมูลการกรอง
   */
  static validateFilters(filters: AssignmentFilters): ValidationResult {
    const errors: Record<string, string> = {};

    // ตรวจสอบ search length
    if (filters.search && filters.search.length > 100) {
      errors.search = 'คำค้นหาต้องไม่เกิน 100 ตัวอักษร';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * ตรวจสอบ field เดียว
   */
  static validateField(field: string, value: any): FieldValidationResult {
    switch (field) {
      case 'educatorId':
        return this.validateEducatorId(value);
      case 'academicYearId':
        return this.validateAcademicYearId(value);
      case 'semesterId':
        return this.validateSemesterId(value);
      case 'roles':
        return this.validateRoles(value);
      case 'notes':
        return this.validateNotes(value);
      case 'isActive':
        return this.validateIsActive(value);
      default:
        return { isValid: true };
    }
  }

  /**
   * ตรวจสอบ educatorId
   */
  private static validateEducatorId(value: any): FieldValidationResult {
    if (!value) {
      return {
        isValid: false,
        error: VALIDATION_RULES.educatorId.message
      };
    }
    return { isValid: true };
  }

  /**
   * ตรวจสอบ academicYearId
   */
  private static validateAcademicYearId(value: any): FieldValidationResult {
    if (!value) {
      return {
        isValid: false,
        error: VALIDATION_RULES.academicYearId.message
      };
    }
    return { isValid: true };
  }

  /**
   * ตรวจสอบ semesterId
   */
  private static validateSemesterId(value: any): FieldValidationResult {
    if (!value) {
      return {
        isValid: false,
        error: VALIDATION_RULES.semesterId.message
      };
    }
    return { isValid: true };
  }

  /**
   * ตรวจสอบ roles
   */
  private static validateRoles(value: any): FieldValidationResult {
    if (!value || !Array.isArray(value) || value.length === 0) {
      return {
        isValid: false,
        error: VALIDATION_RULES.roles.message
      };
    }
    return { isValid: true };
  }

  /**
   * ตรวจสอบ notes
   */
  private static validateNotes(value: any): FieldValidationResult {
    if (value && value.length > VALIDATION_RULES.notes.maxLength) {
      return {
        isValid: false,
        error: VALIDATION_RULES.notes.message
      };
    }
    return { isValid: true };
  }

  /**
   * ตรวจสอบ isActive
   */
  private static validateIsActive(value: any): FieldValidationResult {
    if (typeof value !== 'boolean') {
      return {
        isValid: false,
        error: 'สถานะการใช้งานต้องเป็น true หรือ false'
      };
    }
    return { isValid: true };
  }

  /**
   * ตรวจสอบความถูกต้องของข้อมูล Educator
   */
  static validateEducator(educator: Educator): ValidationResult {
    const errors: Record<string, string> = {};

    if (!educator.id) {
      errors.id = 'ID Educator ไม่ถูกต้อง';
    }

    if (!educator.name) {
      errors.name = 'ชื่อ Educator ไม่ถูกต้อง';
    }

    if (!educator.email) {
      errors.email = 'อีเมล Educator ไม่ถูกต้อง';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * ตรวจสอบความถูกต้องของข้อมูลปีการศึกษา
   */
  static validateAcademicYear(academicYear: AcademicYear): ValidationResult {
    const errors: Record<string, string> = {};

    if (!academicYear.id) {
      errors.id = 'ID ปีการศึกษาไม่ถูกต้อง';
    }

    if (!academicYear.name) {
      errors.name = 'ชื่อปีการศึกษาไม่ถูกต้อง';
    }

    if (!academicYear.year || academicYear.year < 2000) {
      errors.year = 'ปีการศึกษาไม่ถูกต้อง';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * ตรวจสอบความถูกต้องของข้อมูลภาคเรียน
   */
  static validateSemester(semester: Semester): ValidationResult {
    const errors: Record<string, string> = {};

    if (!semester.id) {
      errors.id = 'ID ภาคเรียนไม่ถูกต้อง';
    }

    if (!semester.name) {
      errors.name = 'ชื่อภาคเรียนไม่ถูกต้อง';
    }

    if (!semester.academicYearId) {
      errors.academicYearId = 'ID ปีการศึกษาไม่ถูกต้อง';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * ตรวจสอบการกำหนดบทบาทซ้ำ
   */
  static validateDuplicateAssignment(
    educatorId: string,
    academicYearId: string,
    semesterId: string,
    existingAssignments: any[]
  ): FieldValidationResult {
    const duplicate = existingAssignments.find(assignment => 
      assignment.educatorId === educatorId &&
      assignment.academicYearId === academicYearId &&
      assignment.semesterId === semesterId
    );

    if (duplicate) {
      return {
        isValid: false,
        error: 'มีการกำหนดบทบาทสำหรับ Educator นี้ในเทอม/ปีการศึกษานี้แล้ว'
      };
    }

    return { isValid: true };
  }

  /**
   * ตรวจสอบความสัมพันธ์ระหว่างภาคเรียนและปีการศึกษา
   */
  static validateSemesterAcademicYearRelation(
    semesterId: string,
    academicYearId: string,
    semesters: Semester[]
  ): FieldValidationResult {
    const semester = semesters.find(s => s.id === semesterId);
    
    if (!semester) {
      return {
        isValid: false,
        error: 'ไม่พบภาคเรียนที่เลือก'
      };
    }

    if (semester.academicYearId !== academicYearId) {
      return {
        isValid: false,
        error: 'ภาคเรียนที่เลือกไม่ตรงกับปีการศึกษา'
      };
    }

    return { isValid: true };
  }

  /**
   * ทำความสะอาดข้อมูล
   */
  static sanitizeData(data: any): any {
    const sanitized = { ...data };

    // ทำความสะอาด string fields
    if (sanitized.notes) {
      sanitized.notes = sanitized.notes.trim();
    }

    if (sanitized.search) {
      sanitized.search = sanitized.search.trim();
    }

    // ตรวจสอบ roles array
    if (sanitized.roles && Array.isArray(sanitized.roles)) {
      sanitized.roles = sanitized.roles.filter(role => 
        typeof role === 'string' && role.trim().length > 0
      );
    }

    return sanitized;
  }

  /**
   * ตรวจสอบสิทธิ์การเข้าถึง
   */
  static validatePermissions(
    action: 'create' | 'update' | 'delete' | 'view',
    userRoles: string[]
  ): FieldValidationResult {
    const hasAdminRole = userRoles.includes('admin');
    const hasStaffRole = userRoles.includes('staff');

    if (!hasAdminRole && !hasStaffRole) {
      return {
        isValid: false,
        error: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้'
      };
    }

    return { isValid: true };
  }
}
