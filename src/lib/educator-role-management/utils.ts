/**
 * Utility functions for Educator Role Management System
 * ฟังก์ชันยูทิลิตี้สำหรับระบบจัดการบทบาท Educator
 */

import { 
  EducatorRoleAssignment,
  Educator,
  AcademicYear,
  Semester,
  AssignmentFilters,
  PaginationParams
} from './types';

/**
 * สร้างข้อมูลเริ่มต้นสำหรับการกำหนดบทบาท
 */
export function createEmptyAssignmentData() {
  return {
    educatorId: '',
    academicYearId: '',
    semesterId: '',
    roles: [],
    isActive: true,
    notes: ''
  };
}

/**
 * สร้างข้อมูลเริ่มต้นสำหรับการกรอง
 */
export function createEmptyFilters(): AssignmentFilters {
  return {
    academicYearId: undefined,
    semesterId: undefined,
    educatorId: undefined,
    role: undefined,
    isActive: undefined,
    search: undefined
  };
}

/**
 * สร้างข้อมูลเริ่มต้นสำหรับการแบ่งหน้า
 */
export function createEmptyPagination(): PaginationParams {
  return {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };
}

/**
 * คัดลอกข้อมูลการกำหนดบทบาท
 */
export function cloneAssignment(assignment: EducatorRoleAssignment): EducatorRoleAssignment {
  return {
    ...assignment,
    roles: [...assignment.roles]
  };
}

/**
 * เปรียบเทียบการกำหนดบทบาทสองตัว
 */
export function compareAssignments(a: EducatorRoleAssignment, b: EducatorRoleAssignment): boolean {
  return (
    a.id === b.id &&
    a.educatorId === b.educatorId &&
    a.academicYearId === b.academicYearId &&
    a.semesterId === b.semesterId &&
    JSON.stringify(a.roles) === JSON.stringify(b.roles) &&
    a.isActive === b.isActive &&
    a.notes === b.notes
  );
}

/**
 * ตรวจสอบว่าการกำหนดบทบาทมีการเปลี่ยนแปลงหรือไม่
 */
export function hasAssignmentChanged(
  original: EducatorRoleAssignment,
  updated: Partial<EducatorRoleAssignment>
): boolean {
  const fieldsToCheck: (keyof EducatorRoleAssignment)[] = [
    'educatorId',
    'academicYearId',
    'semesterId',
    'isActive',
    'notes'
  ];

  for (const field of fieldsToCheck) {
    if (updated[field] !== undefined && updated[field] !== original[field]) {
      return true;
    }
  }

  // ตรวจสอบ roles array
  if (updated.roles && JSON.stringify(updated.roles) !== JSON.stringify(original.roles)) {
    return true;
  }

  return false;
}

/**
 * สร้าง URL สำหรับการส่งออกรายงาน
 */
export function createExportUrl(
  baseUrl: string,
  filters?: AssignmentFilters,
  format: 'csv' | 'excel' | 'pdf' = 'csv'
): string {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
  }

  params.append('format', format);
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * สร้าง URL สำหรับการดาวน์โหลดไฟล์
 */
export function createDownloadUrl(blob: Blob, filename: string): string {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  return url;
}

/**
 * ดาวน์โหลดไฟล์
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = createDownloadUrl(blob, filename);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * สร้างชื่อไฟล์สำหรับการส่งออก
 */
export function generateExportFilename(
  prefix: string = 'educator-role-assignments',
  format: 'csv' | 'excel' | 'pdf' = 'csv',
  timestamp?: Date
): string {
  const date = timestamp || new Date();
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
  
  const extension = format === 'excel' ? 'xlsx' : format;
  return `${prefix}_${dateStr}_${timeStr}.${extension}`;
}

/**
 * แปลงข้อมูลเป็น CSV
 */
export function convertToCSV(
  assignments: EducatorRoleAssignment[],
  includeHeaders: boolean = true
): string {
  if (assignments.length === 0) {
    return '';
  }

  const headers = [
    'ID',
    'Educator Name',
    'Academic Year',
    'Semester',
    'Roles',
    'Status',
    'Notes',
    'Created At',
    'Updated At'
  ];

  const rows = assignments.map(assignment => [
    assignment.id,
    getEducatorDisplayName(assignment.educator),
    assignment.academicYear.name,
    assignment.semester.name,
    assignment.roles.join(', '),
    assignment.isActive ? 'Active' : 'Inactive',
    assignment.notes || '',
    new Date(assignment.createdAt).toLocaleString('th-TH'),
    new Date(assignment.updatedAt).toLocaleString('th-TH')
  ]);

  let csv = '';
  
  if (includeHeaders) {
    csv += headers.join(',') + '\n';
  }
  
  csv += rows.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  return csv;
}

/**
 * สร้างข้อมูลสำหรับตาราง
 */
export function createTableData(assignments: EducatorRoleAssignment[]) {
  return assignments.map(assignment => ({
    id: assignment.id,
    educator: {
      id: assignment.educator.id,
      name: getEducatorDisplayName(assignment.educator),
      email: assignment.educator.email
    },
    academicYear: {
      id: assignment.academicYear.id,
      name: assignment.academicYear.name,
      year: assignment.academicYear.year
    },
    semester: {
      id: assignment.semester.id,
      name: assignment.semester.name
    },
    roles: assignment.roles,
    isActive: assignment.isActive,
    notes: assignment.notes,
    createdAt: assignment.createdAt,
    updatedAt: assignment.updatedAt
  }));
}

/**
 * สร้างข้อมูลสำหรับกราฟ
 */
export function createChartData(assignments: EducatorRoleAssignment[]) {
  // สถิติตามบทบาท
  const roleStats = assignments.reduce((acc, assignment) => {
    assignment.roles.forEach(role => {
      acc[role] = (acc[role] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // สถิติตามปีการศึกษา
  const yearStats = assignments.reduce((acc, assignment) => {
    const year = assignment.academicYear.year;
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // สถิติตามภาคเรียน
  const semesterStats = assignments.reduce((acc, assignment) => {
    const semester = assignment.semester.name;
    acc[semester] = (acc[semester] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    roles: Object.entries(roleStats).map(([role, count]) => ({ role, count })),
    years: Object.entries(yearStats).map(([year, count]) => ({ year: parseInt(year), count })),
    semesters: Object.entries(semesterStats).map(([semester, count]) => ({ semester, count }))
  };
}

/**
 * สร้างข้อมูลสำหรับการกรอง
 */
export function createFilterOptions(
  assignments: EducatorRoleAssignment[],
  educators: Educator[],
  academicYears: AcademicYear[],
  semesters: Semester[]
) {
  return {
    educators: educators.map(educator => ({
      value: educator.id,
      label: getEducatorDisplayName(educator)
    })),
    academicYears: academicYears.map(year => ({
      value: year.id,
      label: year.name
    })),
    semesters: semesters.map(semester => ({
      value: semester.id,
      label: semester.name,
      academicYearId: semester.academicYearId
    })),
    roles: [
      { value: 'courseInstructor', label: 'อาจารย์ประจำวิชา' },
      { value: 'supervisor', label: 'อาจารย์นิเทศ' },
      { value: 'committee', label: 'กรรมการ' },
      { value: 'visitor', label: 'ผู้เยี่ยมชม' }
    ],
    status: [
      { value: 'active', label: 'ใช้งาน' },
      { value: 'inactive', label: 'ไม่ใช้งาน' }
    ]
  };
}

/**
 * ดึงชื่อแสดงผลของ Educator
 */
export function getEducatorDisplayName(educator: Educator): string {
  if (educator.t_name && educator.t_surname) {
    return `${educator.t_name} ${educator.t_surname}`;
  }
  if (educator.e_name && educator.e_surname) {
    return `${educator.e_name} ${educator.e_surname}`;
  }
  return educator.name;
}

/**
 * ดึงชื่อแสดงผลของบทบาท
 */
export function getRoleDisplayName(role: string): string {
  const roleMap: Record<string, string> = {
    courseInstructor: 'อาจารย์ประจำวิชา',
    supervisor: 'อาจารย์นิเทศ',
    committee: 'กรรมการ',
    visitor: 'ผู้เยี่ยมชม'
  };
  
  return roleMap[role] || role;
}

/**
 * ตรวจสอบว่าข้อมูลถูกต้องหรือไม่
 */
export function isValidAssignmentData(data: any): boolean {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.educatorId === 'string' &&
    typeof data.academicYearId === 'string' &&
    typeof data.semesterId === 'string' &&
    Array.isArray(data.roles) &&
    data.roles.length > 0 &&
    typeof data.isActive === 'boolean'
  );
}

/**
 * สร้างข้อมูลสำหรับการทดสอบ
 */
export function createMockAssignmentData(): Partial<EducatorRoleAssignment> {
  return {
    educatorId: 'mock-educator-id',
    academicYearId: 'mock-year-id',
    semesterId: 'mock-semester-id',
    roles: ['courseInstructor'],
    isActive: true,
    notes: 'Mock assignment for testing'
  };
}

/**
 * สร้างข้อมูลสำหรับการทดสอบหลายตัว
 */
export function createMockAssignments(count: number = 5): Partial<EducatorRoleAssignment>[] {
  return Array.from({ length: count }, (_, index) => ({
    ...createMockAssignmentData(),
    id: `mock-assignment-${index + 1}`,
    notes: `Mock assignment ${index + 1} for testing`
  }));
}

/**
 * ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * รอให้เวลาผ่านไป
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * สร้าง unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * ตรวจสอบว่าข้อมูลเป็น empty หรือไม่
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string') {
    return value.trim().length === 0;
  }
  
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  
  return false;
}

/**
 * ลบข้อมูลที่ว่างออกจาก object
 */
export function removeEmptyFields(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    if (!isEmpty(value)) {
      result[key] = value;
    }
  });
  
  return result;
}

/**
 * สร้างข้อมูลสำหรับการส่งออก Excel
 */
export function createExcelData(assignments: EducatorRoleAssignment[]) {
  const headers = [
    'ID',
    'Educator Name',
    'Academic Year',
    'Semester',
    'Roles',
    'Status',
    'Notes',
    'Created At',
    'Updated At'
  ];

  const data = assignments.map(assignment => [
    assignment.id,
    getEducatorDisplayName(assignment.educator),
    assignment.academicYear.name,
    assignment.semester.name,
    assignment.roles.join(', '),
    assignment.isActive ? 'Active' : 'Inactive',
    assignment.notes || '',
    new Date(assignment.createdAt).toLocaleString('th-TH'),
    new Date(assignment.updatedAt).toLocaleString('th-TH')
  ]);

  return {
    headers,
    data
  };
}
