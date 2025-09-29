import { Role } from './types';

export const modules = [
    { id: 'dashboard', label: 'แดชบอร์ด', description: 'เข้าถึงหน้าแดชบอร์ดหลัก' },
    { id: 'users', label: 'จัดการผู้ใช้', description: 'ดู, สร้าง, แก้ไข, และลบผู้ใช้ทั้งหมด' },
    { id: 'applications', label: 'เอกสารขอฝึกงาน', description: 'ดูและจัดการใบสมัครฝึกงานทั้งหมด' },
    { id: 'review-applications', label: 'ตรวจสอบใบสมัคร', description: 'ตรวจสอบและอนุมัติ/ปฏิเสธใบสมัคร' },
    { id: 'assign-visitor', label: 'มอบหมายอาจารย์นิเทศ', description: 'มอบหมายอาจารย์นิเทศให้กับนักศึกษา' },
    { id: 'schedules', label: 'นัดหมายนิเทศ (Admin)', description: 'จัดการการนัดหมายนิเทศทั้งหมด' },
    { id: 'visitor-schedule', label: 'ตารางนิเทศ (Visitor)', description: 'ดูและจัดการตารางนิเทศของตนเอง' },
    { id: 'reports', label: 'รายงานผลการนิเทศ', description: 'ดูและดาวน์โหลดรายงานผลการนิเทศ' },
    { id: 'companies', label: 'ข้อมูลสถานประกอบการ', description: 'ดูและจัดการข้อมูลสถานประกอบการ' },
    { id: 'summary', label: 'รายงานสรุป', description: 'ดูรายงานสรุปและสถิติต่างๆ' },
    { id: 'settings', label: 'ตั้งค่าระบบ', description: 'เข้าถึงและแก้ไขการตั้งค่าระบบทั้งหมด' },
    { id: 'student-internships', label: 'การฝึกงาน (นักศึกษา)', description: 'ดูและสมัครการฝึกงาน' },
    { id: 'student-applications', label: 'ใบสมัครของฉัน (นักศึกษา)', description: 'ดูสถานะใบสมัครของตนเอง' },
];

export const roles: { id: Role; label: string }[] = [
    { id: 'admin', label: 'ผู้ดูแลระบบ' },
    { id: 'staff', label: 'เจ้าหน้าที่ธุรการ' },
    { id: 'courseInstructor', label: 'อาจารย์ประจำวิชา' },
    { id: 'committee', label: 'กรรมการ' },
    { id: 'visitor', label: 'อาจารย์นิเทศ' },
    { id: 'student', label: 'นักศึกษา' },
];

export const initialPermissions: Record<Role, string[]> = {
    admin: ['dashboard', 'users', 'applications', 'schedules', 'reports', 'companies', 'summary', 'settings', 'review-applications', 'assign-visitor'],
    staff: ['users', 'applications'],
    courseInstructor: ['dashboard', 'review-applications', 'assign-visitor'],
    committee: ['review-applications'],
    visitor: ['visitor-schedule', 'reports'],
    student: ['dashboard', 'student-internships', 'student-applications'],
};
