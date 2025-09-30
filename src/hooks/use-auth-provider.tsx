'use client';

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import { users } from '@/lib/data';
import { User, Role } from '@prisma/client';

export type AuthUser = Pick<User, 'id' | 'email' | 'name' | 'roles'>;

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (identifier: string, password: string, role: Role) => AuthUser | null;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('internship-flow-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('internship-flow-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    (identifier: string, password: string, selectedRole: Role) => {
      const identifierLower = identifier.toLowerCase();

      const foundUser = users.find((u) => {
        // Students must log in with their student ID (which is the user.id in mock data)
        if (selectedRole === 'student') {
            return u.id.toLowerCase() === identifierLower && u.password === password;
        }

        // Other roles log in with email
        return u.email.toLowerCase() === identifierLower && u.password === password;
      });

      // After finding the user, ensure they actually have the role they're trying to log in with.
      if (foundUser && foundUser.roles.includes(selectedRole)) {
        const authUser: AuthUser = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          roles: foundUser.roles,
        };
        setUser(authUser);
        localStorage.setItem(
          'internship-flow-user',
          JSON.stringify(authUser)
        );
        return authUser;
      }

      // If no user is found with the correct credentials and role
      return null;
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('internship-flow-user');
    router.push('/login');
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
