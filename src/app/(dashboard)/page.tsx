'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const userRoles = Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles || '[]');
      
      // Redirect based on user role
      if (userRoles.includes('admin')) {
        router.replace('/admin');
      } else if (userRoles.includes('staff')) {
        router.replace('/staff');
      } else if (userRoles.includes('student')) {
        router.replace('/student');
      } else if (
        userRoles.includes('courseInstructor') || 
        userRoles.includes('อาจารย์ประจำวิชา') ||
        userRoles.includes('visitor') || 
        userRoles.includes('อาจารย์นิเทศ') ||
        userRoles.includes('committee') ||
        userRoles.includes('กรรมการ')
      ) {
        router.replace('/educator');
      } else {
        // Default fallback
        router.replace('/student');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">กำลังเปลี่ยนเส้นทาง...</h1>
        <p className="text-gray-600">กรุณารอสักครู่</p>
      </div>
    </div>
  );
}