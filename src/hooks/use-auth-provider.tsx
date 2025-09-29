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
      const foundUser = users.find(
        (u) =>
          (u.email.toLowerCase() === identifier.toLowerCase() ||
            u.id.toLowerCase() === identifier.toLowerCase()) &&
          u.password === password
      );

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
