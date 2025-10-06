'use client';

import { CommitteeGuard } from '@/components/auth/PermissionGuard';
import CommitteeDashboard from '@/components/committee/CommitteeDashboard';

export default function CommitteeDashboardPage() {
  return (
    <CommitteeGuard>
      <CommitteeDashboard />
    </CommitteeGuard>
  );
}