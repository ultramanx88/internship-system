'use client';
import { useState, useEffect, useCallback } from 'react';
import { type User, type Role } from '@/lib/types';
import { users as mockUsers } from '@/lib/data';
import { useRouter } from 'next/navigation';

export type AuthUser = Pick<User, 'id' | 'email' | 'name' | 'roles'>;

const USER_STORAGE_KEY = 'internship-flow-user';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const userItem = localStorage.getItem(USER_STORAGE_KEY);
      if (userItem) {
        setUser(JSON.parse(userItem));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((identifier: string, password: string, role: Role) => {
    const foundUser = mockUsers.find(u => 
        (u.email === identifier || u.id === identifier) && u.roles.includes(role) && u.password === password
    );
    if (foundUser) {
        const { password, ...userToStore } = foundUser;
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userToStore));
        setUser(userToStore);
        return userToStore;
    }
    return null;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    router.push('/login');
  }, [router]);

  return { user, loading, login, logout };
}
