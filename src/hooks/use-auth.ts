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
    if (!loading && !user && pathname !== '/login' && pathname !== '/register') {
      router.replace('/login');
    }
  }, [user, loading, router, pathname]);

  if (loading || (!user && pathname !== '/login' && pathname !== '/register')) {
    return null;
  }

  return children;
}
