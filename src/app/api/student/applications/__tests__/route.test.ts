import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    application: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock auth-utils
jest.mock('@/lib/auth-utils', () => ({
  requireAuth: jest.fn(),
  cleanup: jest.fn(),
}));

// Mock security utils
jest.mock('@/lib/security', () => ({
  sanitizeUserInput: jest.fn(),
  sanitizeString: jest.fn(),
}));

// Mock rate limiter
jest.mock('@/lib/rate-limiter', () => ({
  rateLimitMiddleware: jest.fn(),
  applicationRateLimiter: {},
}));

// Mock CSRF
jest.mock('@/lib/csrf', () => ({
  csrfMiddleware: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRequireAuth = require('@/lib/auth-utils').requireAuth as jest.MockedFunction<any>;
const mockSanitizeUserInput = require('@/lib/security').sanitizeUserInput as jest.MockedFunction<any>;
const mockRateLimitMiddleware = require('@/lib/rate-limiter').rateLimitMiddleware as jest.MockedFunction<any>;
const mockCsrfMiddleware = require('@/lib/csrf').csrfMiddleware as jest.MockedFunction<any>;

describe('/api/student/applications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful auth
    mockRequireAuth.mockResolvedValue({
      user: { id: 'student_123', roles: ['student'] },
    });
    
    // Mock successful sanitization
    mockSanitizeUserInput.mockReturnValue({
      isValid: true,
      sanitized: { internshipId: 'intern_123', studentReason: 'Test reason' },
    });
    
    // Mock middleware
    mockRateLimitMiddleware.mockReturnValue(null);
    mockCsrfMiddleware.mockReturnValue(null);
  });

  describe('GET', () => {
    it('returns applications for authenticated student', async () => {
      const mockApplications = [
        {
          id: 'app_123',
          studentId: 'student_123',
          internshipId: 'intern_123',
          status: 'pending',
          dateApplied: new Date(),
          internship: {
            id: 'intern_123',
            title: 'Test Internship',
            company: { name: 'Test Company' },
          },
        },
      ];

      mockPrisma.application.findMany.mockResolvedValue(mockApplications);

      const request = new NextRequest('http://localhost:3000/api/student/applications');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.applications).toHaveLength(1);
    });

    it('handles pagination correctly', async () => {
      mockPrisma.application.findMany.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/student/applications?page=2&limit=5');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.pagination.page).toBe(2);
      expect(data.data.pagination.limit).toBe(5);
    });

    it('returns 401 for unauthenticated user', async () => {
      mockRequireAuth.mockResolvedValue({
        error: { status: 401, message: 'Unauthorized' },
      });

      const request = new NextRequest('http://localhost:3000/api/student/applications');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe('POST', () => {
    it('creates application successfully', async () => {
      const mockApplication = {
        id: 'app_123',
        studentId: 'student_123',
        internshipId: 'intern_123',
        status: 'pending',
        dateApplied: new Date(),
      };

      mockPrisma.application.findFirst.mockResolvedValue(null); // No existing application
      mockPrisma.application.create.mockResolvedValue(mockApplication);

      const requestBody = {
        internshipId: 'intern_123',
        studentReason: 'Test reason',
        expectedSkills: 'JavaScript, React',
        preferredStartDate: '2024-02-01',
        availableDuration: '6 months',
      };

      const request = new NextRequest('http://localhost:3000/api/student/applications', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('app_123');
    });

    it('returns 400 for missing required fields', async () => {
      mockSanitizeUserInput.mockReturnValue({
        isValid: false,
        errors: ['Missing required field'],
      });

      const requestBody = {
        studentReason: 'Test reason',
        // Missing internshipId
      };

      const request = new NextRequest('http://localhost:3000/api/student/applications', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('returns 409 for duplicate application', async () => {
      const existingApplication = {
        id: 'app_123',
        studentId: 'student_123',
        internshipId: 'intern_123',
      };

      mockPrisma.application.findFirst.mockResolvedValue(existingApplication);

      const requestBody = {
        internshipId: 'intern_123',
        studentReason: 'Test reason',
        preferredStartDate: '2024-02-01',
      };

      const request = new NextRequest('http://localhost:3000/api/student/applications', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Already applied');
    });

    it('handles server errors gracefully', async () => {
      mockPrisma.application.findFirst.mockRejectedValue(new Error('Database error'));

      const requestBody = {
        internshipId: 'intern_123',
        studentReason: 'Test reason',
        preferredStartDate: '2024-02-01',
      };

      const request = new NextRequest('http://localhost:3000/api/student/applications', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });
});