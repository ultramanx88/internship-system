import { NextRequest } from 'next/server';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  currentRole?: string;
}

export function requireAuth(allowedRoles?: string[]) {
  return async (request: NextRequest) => {
    // Mock authentication - in a real app, this would verify JWT tokens
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      throw new Error('Authentication required');
    }

    // Mock user data - in a real app, this would come from database
    const user: User = {
      id: userId,
      email: 'user@example.com',
      name: 'Test User',
      roles: ['admin', 'staff', 'educator', 'student', 'committee'],
      currentRole: 'admin'
    };

    if (allowedRoles && !allowedRoles.some(role => user.roles.includes(role))) {
      throw new Error('Insufficient permissions');
    }

    return user;
  };
}
