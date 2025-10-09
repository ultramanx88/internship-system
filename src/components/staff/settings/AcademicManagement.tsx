'use client';

import { AcademicCalendar } from '@/components/shared/AcademicCalendar';

export function AcademicManagement() {
  return (
    <AcademicCalendar 
      showHolidays={false}
      title="จัดการปีการศึกษาและภาคเรียน"
      description="เพิ่ม, แก้ไข, และจัดการปีการศึกษาและภาคเรียนต่างๆ"
      userRole="staff"
    />
  );
}
