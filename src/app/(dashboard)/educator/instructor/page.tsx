'use client';

import { EducatorGuard } from '@/components/auth/PermissionGuard';
import InstructorDashboard from '@/components/instructor/InstructorDashboard';

export default function EducatorInstructorDashboard() {
  return (
    <EducatorGuard>
      <InstructorDashboard />
    </EducatorGuard>
  );
}
