'use client';

import { EducatorGuard } from '@/components/auth/PermissionGuard';
import SupervisorDashboard from '@/components/supervisor/SupervisorDashboard';

export default function SupervisorSchedulePage() {
  return (
    <EducatorGuard>
      <SupervisorDashboard />
    </EducatorGuard>
  );
}
