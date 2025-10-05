'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { AdminMenu } from '@/components/admin/AdminMenu';
import { StaffMenu } from '@/components/staff/StaffMenu';
import { StudentMenu } from '@/components/student/StudentMenu';
import { EducatorMenu } from '@/components/educator/EducatorMenu';
import { useEducatorRole } from '@/hooks/useEducatorRole';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const { educatorRole } = useEducatorRole();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
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

  if (!user) {
    return null;
  }

  const userRoles = Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles || '[]');

  const renderSidebar = () => {
    if (userRoles.includes('admin')) {
      return <AdminMenu />;
    } else if (userRoles.includes('staff')) {
      return <StaffMenu />;
    } else if (userRoles.includes('student')) {
      return <StudentMenu />;
    } else if (
      userRoles.includes('courseInstructor') || 
      userRoles.includes('อาจารย์ประจำวิชา') ||
      userRoles.includes('visitor') || 
      userRoles.includes('อาจารย์นิเทศ') ||
      userRoles.includes('committee') ||
      userRoles.includes('กรรมการ')
    ) {
      return (
        <EducatorMenu 
          userRole={userRoles[0] || 'courseInstructor'} 
          educatorRole={educatorRole?.name}
        />
      );
    }
    return <StudentMenu />; // Default fallback
  };

  return (
    <SidebarProvider>
      <Sidebar>
        {renderSidebar()}
      </Sidebar>
      <SidebarInset>
        <DashboardHeader />
        <div className="p-6 space-y-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
