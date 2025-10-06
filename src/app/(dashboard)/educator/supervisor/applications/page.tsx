'use client';

import { EducatorGuard } from '@/components/auth/PermissionGuard';
import SupervisorDashboard from '@/components/supervisor/SupervisorDashboard';

export default function SupervisorApplicationsPage() {
  return (
    <EducatorGuard>
      <SupervisorDashboard />
    </EducatorGuard>
  );
}