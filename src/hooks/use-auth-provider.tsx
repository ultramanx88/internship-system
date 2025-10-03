'use client';

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import { User, Role } from '@prisma/client';

export type AuthUser = Pick<User, 'id' | 'email' | 'name' | 'roles'> & {
  currentRole?: Role;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (identifier: string, password: string, role: Role) => Promise<AuthUser | null>;
  logout: () => void;
  switchRole: (role: Role) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_VERSION = '1.0';
const STORAGE_KEY = 'internship-flow-user';
const VERSION_KEY = 'internship-flow-version';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      // ตรวจสอบว่าอยู่ใน browser environment
      if (typeof window !== 'undefined') {
        const storedVersion = localStorage.getItem(VERSION_KEY);
        const storedUser = localStorage.getItem(STORAGE_KEY);
        
        // Check version compatibility
        if (storedVersion !== STORAGE_VERSION) {
          console.log('Storage version mismatch, clearing localStorage...');
          localStorage.clear();
          localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
          return;
        }
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // Validate user data structure
          if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.name) {
            setUser(parsedUser);
          } else {
            console.warn('Invalid user data in localStorage, clearing...');
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      if (typeof window !== 'undefined') {
        console.log('Clearing corrupted localStorage data...');
        localStorage.clear();
        localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (identifier: string, password: string, selectedRole: Role) => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            identifier,
            password,
            role: selectedRole,
          }),
        });

        const data = await response.json();

        if (response.ok && data.user) {
          const authUser: AuthUser = {
            ...data.user,
            currentRole: selectedRole
          };
          setUser(authUser);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
            localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
          }
          return authUser;
        } else {
          // แสดง error message ที่ได้จาก API
          const errorMessage = data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
          console.error('Login failed:', errorMessage);
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error('Login error:', error);
        return null;
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      // Keep version for next login
    }
    router.push('/login');
  }, [router]);

  const switchRole = useCallback((role: Role) => {
    if (user && user.roles.includes(role)) {
      const updatedUser = { ...user, currentRole: role };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      }
      
      // Navigate to appropriate dashboard
      if (role === 'admin' || role === 'staff') {
        router.push('/admin');
      } else if (role === 'courseInstructor' || role === 'committee' || role === 'visitor') {
        router.push('/teacher');
      } else if (role === 'student') {
        router.push('/student');
      }
    }
  }, [user, router]);

  const value = useMemo(
    () => ({ user, loading, login, logout, switchRole }),
    [user, loading, login, logout, switchRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
