'use client';

import { AcademicCalendar } from '@/components/shared/AcademicCalendar';

export function AcademicCalendarSettings() {
  return (
    <AcademicCalendar 
      showHolidays={true}
      title="ปฏิทินการศึกษา"
      description="จัดการภาคการศึกษา, ระยะเวลา, และวันหยุดต่างๆ ของมหาวิทยาลัย"
      userRole="admin"
    />
  );
}
