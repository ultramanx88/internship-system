import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type Role = 'admin' | 'staff' | 'courseInstructor' | 'committee' | 'visitor' | 'student';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: Role[];
}

/**
 * Extract user ID from request headers or search params
 */
export function getUserIdFromRequest(request: NextRequest): string | null {
  // Try to get from search params first
  const { searchParams } = new URL(request.url);
  const userIdFromParams = searchParams.get('userId');
  if (userIdFromParams) {
    return userIdFromParams;
  }

  // Try to get from headers
  const userIdFromHeader = request.headers.get('x-user-id');
  if (userIdFromHeader) {
    return userIdFromHeader;
  }

  // Try to get from Authorization header (for future JWT implementation)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // TODO: Implement JWT token parsing
    // For now, return null
    return null;
  }

  return null;
}

/**
 * Get user from database with role validation
 */
export async function getUserWithRoles(userId: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true
      }
    });

    if (!user) {
      return null;
    }

    // Parse roles from JSON string
    let userRoles: Role[];
    try {
      userRoles = JSON.parse(user.roles);
    } catch (e) {
      // If parsing fails, treat as single role
      userRoles = [user.roles as Role];
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: userRoles
    };
  } catch (error) {
    console.error('Error fetching user with roles:', error);
    return null;
  }
}

/**
 * Check if user has specific role
 */
export function hasRole(user: AuthUser | null, role: Role): boolean {
  if (!user) return false;
  return user.roles.includes(role);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: AuthUser | null, roles: Role[]): boolean {
  if (!user) return false;
  return roles.some(role => user.roles.includes(role));
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(user: AuthUser | null, roles: Role[]): boolean {
  if (!user) return false;
  return roles.every(role => user.roles.includes(role));
}

/**
 * Role-based access control functions
 */
export const roleChecks = {
  isAdmin: (user: AuthUser | null) => hasRole(user, 'admin'),
  isStaff: (user: AuthUser | null) => hasRole(user, 'staff'),
  isCourseInstructor: (user: AuthUser | null) => hasRole(user, 'courseInstructor'),
  isCommittee: (user: AuthUser | null) => hasRole(user, 'committee'),
  isVisitor: (user: AuthUser | null) => hasRole(user, 'visitor'),
  isStudent: (user: AuthUser | null) => hasRole(user, 'student'),
  
  // Combined checks
  isEducator: (user: AuthUser | null) => hasAnyRole(user, ['courseInstructor', 'committee', 'visitor']),
  isAdminOrStaff: (user: AuthUser | null) => hasAnyRole(user, ['admin', 'staff']),
  canAccessApplications: (user: AuthUser | null) => hasAnyRole(user, ['courseInstructor', 'committee']),
  canAccessSupervision: (user: AuthUser | null) => hasRole(user, 'visitor'),
  canAccessEvaluation: (user: AuthUser | null) => hasAnyRole(user, ['courseInstructor', 'committee']),
};

/**
 * Middleware function to check authentication and authorization
 */
export async function requireAuth(
  request: NextRequest,
  requiredRoles?: Role[]
): Promise<{ user: AuthUser; error?: never } | { user?: never; error: Response }> {
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return {
      error: new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }

  const user = await getUserWithRoles(userId);
  
  if (!user) {
    return {
      error: new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }

  if (requiredRoles && !hasAnyRole(user, requiredRoles)) {
    return {
      error: new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }

  return { user };
}

/**
 * Cleanup function to disconnect Prisma
 */
export async function cleanup() {
  await prisma.$disconnect();
}
