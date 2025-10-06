'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('Home page - user:', user, 'loading:', loading);
    
    if (!loading) {
      if (user) {
        console.log('User is logged in, redirecting based on role...');
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
          userRoles.includes('visitor') || 
          userRoles.includes('committee')
        ) {
          router.replace('/educator');
        } else {
          // Default fallback
          router.replace('/student');
        }
      } else {
        console.log('User not logged in, redirecting to login...');
        router.replace('/login');
      }
    }
  }, [router, user, loading]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Show redirecting state
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">กำลังเปลี่ยนเส้นทาง...</p>
        <div className="mt-4 space-y-2">
          <a href="/login" className="block text-blue-600 hover:underline">ไปหน้า Login</a>
          <a href="/dashboard" className="block text-blue-600 hover:underline">ไปหน้า Dashboard</a>
        </div>
      </div>
    </div>
  );
}
