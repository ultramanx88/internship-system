/**
 * Main export file for Educator Role Management System
 * ไฟล์ export หลักสำหรับระบบจัดการบทบาท Educator
 */

// Types
export * from './types';

// Constants
export * from './constants';

// Validation
export * from './validation';

// API
export * from './api';

// Business Logic
export * from './role-assignment-manager';

// Utils
export * from './utils';

// Re-export commonly used items
export { EducatorRoleAPI } from './api';
export { EducatorRoleValidator } from './validation';
export { EducatorRoleAssignmentManager } from './role-assignment-manager';
export { educatorRoleAPI } from './api';
export { ROLE_OPTIONS, DEFAULT_CONFIG } from './constants';
