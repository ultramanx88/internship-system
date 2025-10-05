import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    report: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
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

import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockCleanup = cleanup as jest.MockedFunction<typeof cleanup>;

describe('/api/reports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue({
      user: {
        id: 'admin_user',
        name: 'Admin User',
        roles: ['admin'],
      },
    });
  });

  describe('GET', () => {
    it('should return reports successfully', async () => {
      const mockReports = [
        {
          id: 'report_1',
          title: 'Test Report',
          status: 'submitted',
          student: { name: 'Student 1', id: 'student_1' },
          supervisor: { name: 'Supervisor 1', id: 'supervisor_1' },
          application: {
            internship: {
              company: { name: 'Company 1' }
            }
          },
        }
      ];

      mockPrisma.report.findMany.mockResolvedValue(mockReports);
      mockPrisma.report.count.mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/reports');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.reports).toHaveLength(1);
      expect(data.total).toBe(1);
    });

    it('should handle authentication error', async () => {
      mockRequireAuth.mockResolvedValue({
        error: new Response('Unauthorized', { status: 401 }),
      });

      const request = new NextRequest('http://localhost:3000/api/reports');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should handle database error', async () => {
      mockPrisma.report.findMany.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/reports');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch reports');
    });
  });

  describe('POST', () => {
    it('should create report successfully', async () => {
      const mockReport = {
        id: 'report_1',
        title: 'New Report',
        content: 'Report content',
        status: 'draft',
        applicationId: 'app_1',
        studentId: 'student_1',
        supervisorId: 'supervisor_1',
      };

      mockPrisma.report.create.mockResolvedValue(mockReport as any);

      const request = new NextRequest('http://localhost:3000/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          applicationId: 'app_1',
          studentId: 'student_1',
          supervisorId: 'supervisor_1',
          title: 'New Report',
          content: 'Report content',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.report).toBeDefined();
    });

    it('should handle missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Report',
          // Missing required fields
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Missing required fields');
    });
  });
});
