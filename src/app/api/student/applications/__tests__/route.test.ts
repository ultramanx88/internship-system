import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    application: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock auth-utils
jest.mock('@/lib/auth-utils', () => ({
  requireAuth: jest.fn(),
  cleanup: jest.fn(),
}));

// Mock security
jest.mock('@/lib/security', () => ({
  sanitizeUserInput: jest.fn(),
  sanitizeString: jest.fn(),
}));

// Mock rate limiter
jest.mock('@/lib/rate-limiter', () => ({
  rateLimitMiddleware: jest.fn(),
  applicationRateLimiter: jest.fn(),
}));

// Mock CSRF
jest.mock('@/lib/csrf', () => ({
  csrfMiddleware: jest.fn(),
}));

// Mock cache
jest.mock('@/lib/cache', () => ({
  studentCache: {
    get: jest.fn(),
    set: jest.fn(),
  },
  cacheKeys: {
    studentApplications: jest.fn(),
  },
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  PerformanceMonitor: {
    start: jest.fn(),
    end: jest.fn(),
  },
}));

import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { sanitizeUserInput, sanitizeString } from '@/lib/security';
import { rateLimitMiddleware } from '@/lib/rate-limiter';
import { csrfMiddleware } from '@/lib/csrf';
import { studentCache, cacheKeys } from '@/lib/cache';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockCleanup = cleanup as jest.MockedFunction<typeof cleanup>;
const mockSanitizeUserInput = sanitizeUserInput as jest.MockedFunction<typeof sanitizeUserInput>;
const mockSanitizeString = sanitizeString as jest.MockedFunction<typeof sanitizeString>;
const mockRateLimitMiddleware = rateLimitMiddleware as jest.MockedFunction<typeof rateLimitMiddleware>;
const mockCsrfMiddleware = csrfMiddleware as jest.MockedFunction<typeof csrfMiddleware>;
const mockStudentCache = studentCache as jest.Mocked<typeof studentCache>;
const mockCacheKeys = cacheKeys as jest.Mocked<typeof cacheKeys>;

describe('/api/student/applications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue({
      user: {
        id: 'student_user',
        name: 'Student User',
        roles: ['student'],
      },
    });
    mockSanitizeUserInput.mockReturnValue({
      isValid: true,
      sanitized: { internshipId: 'internship_1', studentReason: 'Test reason' },
      errors: [],
    });
    mockSanitizeString.mockImplementation((input) => input);
    mockRateLimitMiddleware.mockReturnValue(null);
    mockCsrfMiddleware.mockReturnValue(null);
    mockStudentCache.get.mockReturnValue(null);
    mockCacheKeys.studentApplications.mockReturnValue('cache_key');
  });

  describe('GET', () => {
    it('should return applications successfully', async () => {
      const mockApplications = [
        {
          id: 'app_1',
          studentId: 'student_user',
          internshipId: 'internship_1',
          status: 'pending',
          dateApplied: new Date(),
          internship: {
            id: 'internship_1',
            title: 'Test Internship',
            company: {
              id: 'company_1',
              name: 'Test Company',
            },
          },
        },
      ];

      mockPrisma.application.findMany.mockResolvedValue(mockApplications);
      mockPrisma.application.count.mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/student/applications', {
        headers: {
          'x-user-id': 'student_user',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.applications).toHaveLength(1);
      expect(mockRequireAuth).toHaveBeenCalledWith(request, ['student']);
      expect(mockCleanup).toHaveBeenCalled();
    });

    it('should handle authentication error', async () => {
      mockRequireAuth.mockResolvedValue({
        error: new Response('Unauthorized', { status: 401 }),
      });

      const request = new NextRequest('http://localhost:3000/api/student/applications');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should return cached data when available', async () => {
      const cachedData = {
        success: true,
        data: {
          applications: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      };

      mockStudentCache.get.mockReturnValue(cachedData);

      const request = new NextRequest('http://localhost:3000/api/student/applications', {
        headers: {
          'x-user-id': 'student_user',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(cachedData);
      expect(mockPrisma.application.findMany).not.toHaveBeenCalled();
    });

    it('should handle database error', async () => {
      mockPrisma.application.findMany.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/student/applications', {
        headers: {
          'x-user-id': 'student_user',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
      expect(mockCleanup).toHaveBeenCalled();
    });
  });

  describe('POST', () => {
    it('should create application successfully', async () => {
      const mockApplication = {
        id: 'app_1',
        studentId: 'student_user',
        internshipId: 'internship_1',
        status: 'pending',
        dateApplied: new Date(),
        feedback: 'Test reason',
        projectTopic: 'Test project',
        internship: {
          id: 'internship_1',
          title: 'Test Internship',
          company: {
            id: 'company_1',
            name: 'Test Company',
          },
        },
      };

      mockPrisma.application.findFirst.mockResolvedValue(null);
      mockPrisma.application.create.mockResolvedValue(mockApplication as any);

      const request = new NextRequest('http://localhost:3000/api/student/applications', {
        method: 'POST',
        headers: {
          'x-user-id': 'student_user',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          internshipId: 'internship_1',
          studentReason: 'Test reason',
          preferredStartDate: '2024-01-01',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockApplication);
      expect(mockSanitizeUserInput).toHaveBeenCalled();
      expect(mockCleanup).toHaveBeenCalled();
    });

    it('should handle rate limiting', async () => {
      mockRateLimitMiddleware.mockReturnValue(
        new Response('Rate limit exceeded', { status: 429 })
      );

      const request = new NextRequest('http://localhost:3000/api/student/applications', {
        method: 'POST',
        headers: {
          'x-user-id': 'student_user',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          internshipId: 'internship_1',
          studentReason: 'Test reason',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(429);
    });

    it('should handle CSRF protection', async () => {
      mockCsrfMiddleware.mockReturnValue(
        new Response('CSRF token required', { status: 400 })
      );

      const request = new NextRequest('http://localhost:3000/api/student/applications', {
        method: 'POST',
        headers: {
          'x-user-id': 'student_user',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          internshipId: 'internship_1',
          studentReason: 'Test reason',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should handle input sanitization error', async () => {
      mockSanitizeUserInput.mockReturnValue({
        isValid: false,
        sanitized: {},
        errors: ['Potentially malicious content detected'],
      });

      const request = new NextRequest('http://localhost:3000/api/student/applications', {
        method: 'POST',
        headers: {
          'x-user-id': 'student_user',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          internshipId: 'internship_1',
          studentReason: '<script>alert("xss")</script>',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid input data');
      expect(data.details).toEqual(['Potentially malicious content detected']);
    });

    it('should handle duplicate application', async () => {
      mockPrisma.application.findFirst.mockResolvedValue({
        id: 'existing_app',
        studentId: 'student_user',
        internshipId: 'internship_1',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/student/applications', {
        method: 'POST',
        headers: {
          'x-user-id': 'student_user',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          internshipId: 'internship_1',
          studentReason: 'Test reason',
          preferredStartDate: '2024-01-01',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Already applied to this internship');
    });

    it('should handle missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/student/applications', {
        method: 'POST',
        headers: {
          'x-user-id': 'student_user',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          internshipId: 'internship_1',
          // Missing studentReason and preferredStartDate
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Missing required fields: internshipId, studentReason, preferredStartDate');
    });
  });
});
