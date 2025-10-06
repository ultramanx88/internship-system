'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type Role = 'admin' | 'staff' | 'courseInstructor' | 'committee' | 'visitor' | 'student' | 'supervisor';

interface PermissionGuardProps {
  children: ReactNode;
  requiredRoles?: Role[];
  fallbackPath?: string;
  showLoading?: boolean;
}

export function PermissionGuard({ 
  children, 
  requiredRoles = [], 
  fallbackPath = '/login',
  showLoading = true 
}: PermissionGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(fallbackPath);
      return;
    }

    if (!loading && user && requiredRoles.length > 0) {
      const userRoles = Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles || '[]');
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        // Redirect to appropriate dashboard based on user's actual roles
        if (userRoles.includes('admin')) {
          router.replace('/admin');
        } else if (userRoles.includes('staff')) {
          router.replace('/staff');
        } else if (userRoles.includes('student')) {
          router.replace('/student');
        } else if (userRoles.includes('courseInstructor') || userRoles.includes('visitor') || userRoles.includes('committee') || userRoles.includes('supervisor')) {
          router.replace('/educator');
        } else {
          router.replace(fallbackPath);
        }
        return;
      }
    }
  }, [user, loading, requiredRoles, fallbackPath, router]);

  if (loading && showLoading) {
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

  if (requiredRoles.length > 0) {
    const userRoles = Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles || '[]');
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return null;
    }
  }

  return <>{children}</>;
}

// Convenience components for specific roles
export function AdminGuard({ children, fallbackPath = '/login' }: { children: ReactNode; fallbackPath?: string }) {
  return (
    <PermissionGuard requiredRoles={['admin']} fallbackPath={fallbackPath}>
      {children}
    </PermissionGuard>
  );
}

export function StaffGuard({ children, fallbackPath = '/login' }: { children: ReactNode; fallbackPath?: string }) {
  return (
    <PermissionGuard requiredRoles={['staff']} fallbackPath={fallbackPath}>
      {children}
    </PermissionGuard>
  );
}

export function EducatorGuard({ children, fallbackPath = '/login' }: { children: ReactNode; fallbackPath?: string }) {
  return (
    <PermissionGuard requiredRoles={['courseInstructor', 'committee', 'visitor']} fallbackPath={fallbackPath}>
      {children}
    </PermissionGuard>
  );
}

export function StudentGuard({ children, fallbackPath = '/login' }: { children: ReactNode; fallbackPath?: string }) {
  return (
    <PermissionGuard requiredRoles={['student']} fallbackPath={fallbackPath}>
      {children}
    </PermissionGuard>
  );
}

export function CourseInstructorGuard({ children, fallbackPath = '/login' }: { children: ReactNode; fallbackPath?: string }) {
  return (
    <PermissionGuard requiredRoles={['courseInstructor']} fallbackPath={fallbackPath}>
      {children}
    </PermissionGuard>
  );
}

export function CommitteeGuard({ children, fallbackPath = '/login' }: { children: ReactNode; fallbackPath?: string }) {
  return (
    <PermissionGuard requiredRoles={['committee']} fallbackPath={fallbackPath}>
      {children}
    </PermissionGuard>
  );
}

export function VisitorGuard({ children, fallbackPath = '/login' }: { children: ReactNode; fallbackPath?: string }) {
  return (
    <PermissionGuard requiredRoles={['visitor']} fallbackPath={fallbackPath}>
      {children}
    </PermissionGuard>
  );
}

// SupervisorGuard removed - supervisor is now part of educator role
