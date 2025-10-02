'use client';
import { useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthContext } from './use-auth-provider';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('AuthRedirect - user:', user, 'loading:', loading, 'pathname:', pathname);
    
    if (!loading && !user && pathname !== '/login' && pathname !== '/register') {
      console.log('No user found, redirecting to login...');
      router.replace('/login');
      return;
    }

    // Role-based routing redirect
    if (!loading && user) {
      const userRoles = Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles || '[]');
      
      // If staff tries to access /admin, redirect to /staff
      if (userRoles.includes('staff') && pathname.startsWith('/admin')) {
        router.replace('/staff');
        return;
      }
      
      // If admin tries to access /staff, redirect to /admin
      if (userRoles.includes('admin') && !userRoles.includes('staff') && pathname.startsWith('/staff')) {
        router.replace('/admin');
        return;
      }
      
      // If student tries to access admin or staff areas
      if (userRoles.includes('student') && (pathname.startsWith('/admin') || pathname.startsWith('/staff'))) {
        router.replace('/student');
        return;
      }
      
      // If teacher/instructor tries to access admin or staff areas
      if ((userRoles.includes('courseInstructor') || userRoles.includes('visitor') || userRoles.includes('committee')) 
          && (pathname.startsWith('/admin') || pathname.startsWith('/staff'))) {
        router.replace('/teacher');
        return;
      }
    }
  }, [user, loading, router, pathname]);

  if (loading || (!user && pathname !== '/login' && pathname !== '/register')) {
    return null;
  }

  return children;
}
