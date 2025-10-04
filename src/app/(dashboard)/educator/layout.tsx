'use client';

import { EducatorMenu } from '@/components/educator/EducatorMenu';
import { useEducatorRole } from '@/hooks/useEducatorRole';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function EducatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, educatorRole, isLoading, error, hasMultipleRoles } = useEducatorRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            เกิดข้อผิดพลาด: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            กรุณาเข้าสู่ระบบก่อน
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <EducatorMenu 
        userRole={user.roles} 
        educatorRole={educatorRole?.name} 
        className="flex-shrink-0"
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {hasMultipleRoles() && (
            <Alert className="mb-4">
              <AlertDescription>
                คุณมีหลายบทบาทในระบบ สามารถเปลี่ยนบทบาทได้ที่เมนู "เปลี่ยนบทบาท"
              </AlertDescription>
            </Alert>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
