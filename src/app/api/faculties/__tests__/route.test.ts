import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    faculty: {
      findMany: jest.fn(),
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

import { prisma } from '@/lib/prisma';
import { requireAuth, cleanup } from '@/lib/auth-utils';
import { sanitizeUserInput, sanitizeString } from '@/lib/security';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockCleanup = cleanup as jest.MockedFunction<typeof cleanup>;
const mockSanitizeUserInput = sanitizeUserInput as jest.MockedFunction<typeof sanitizeUserInput>;
const mockSanitizeString = sanitizeString as jest.MockedFunction<typeof sanitizeString>;

describe('/api/faculties', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue({
      user: {
        id: 'admin_user',
        name: 'Admin User',
        roles: ['admin'],
      },
    });
    mockSanitizeUserInput.mockReturnValue({
      isValid: true,
      sanitized: { nameTh: 'Test Faculty', nameEn: 'Test Faculty EN', code: 'TEST' },
      errors: [],
    });
    mockSanitizeString.mockImplementation((input) => input);
  });

  describe('GET', () => {
    it('should return faculties successfully', async () => {
      const mockFaculties = [
        {
          id: 'faculty_1',
          nameTh: 'คณะเทคโนโลยีสารสนเทศ',
          nameEn: 'Faculty of Information Technology',
          code: 'IT',
          isActive: true,
        },
      ];

      mockPrisma.faculty.findMany.mockResolvedValue(mockFaculties);

      const request = new NextRequest('http://localhost:3000/api/faculties', {
        headers: {
          'x-user-id': 'admin_user',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.faculties).toEqual(mockFaculties);
      expect(mockRequireAuth).toHaveBeenCalledWith(request, ['admin', 'staff']);
      expect(mockCleanup).toHaveBeenCalled();
    });

    it('should handle authentication error', async () => {
      mockRequireAuth.mockResolvedValue({
        error: new Response('Unauthorized', { status: 401 }),
      });

      const request = new NextRequest('http://localhost:3000/api/faculties');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should handle database error', async () => {
      mockPrisma.faculty.findMany.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/faculties', {
        headers: {
          'x-user-id': 'admin_user',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(mockCleanup).toHaveBeenCalled();
    });
  });

  describe('POST', () => {
    it('should create faculty successfully', async () => {
      const mockFaculty = {
        id: 'faculty_1',
        nameTh: 'คณะเทคโนโลยีสารสนเทศ',
        nameEn: 'Faculty of Information Technology',
        code: 'IT',
        isActive: true,
      };

      mockPrisma.faculty.findFirst.mockResolvedValue(null);
      mockPrisma.faculty.create.mockResolvedValue(mockFaculty as any);

      const request = new NextRequest('http://localhost:3000/api/faculties', {
        method: 'POST',
        headers: {
          'x-user-id': 'admin_user',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nameTh: 'คณะเทคโนโลยีสารสนเทศ',
          nameEn: 'Faculty of Information Technology',
          code: 'IT',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockFaculty);
      expect(mockSanitizeUserInput).toHaveBeenCalled();
      expect(mockCleanup).toHaveBeenCalled();
    });

    it('should handle missing required fields', async () => {
      mockSanitizeUserInput.mockReturnValue({
        isValid: true,
        sanitized: { nameTh: '', nameEn: '', code: '' },
        errors: [],
      });

      const request = new NextRequest('http://localhost:3000/api/faculties', {
        method: 'POST',
        headers: {
          'x-user-id': 'admin_user',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nameTh: '',
          nameEn: 'Faculty of Information Technology',
          code: 'IT',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ชื่อคณะ (ภาษาไทย) เป็นข้อมูลที่จำเป็น');
    });

    it('should handle duplicate faculty name', async () => {
      mockPrisma.faculty.findFirst.mockResolvedValue({
        id: 'existing_faculty',
        nameTh: 'คณะเทคโนโลยีสารสนเทศ',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/faculties', {
        method: 'POST',
        headers: {
          'x-user-id': 'admin_user',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nameTh: 'คณะเทคโนโลยีสารสนเทศ',
          nameEn: 'Faculty of Information Technology',
          code: 'IT',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('คณะนี้มีอยู่ในระบบแล้ว');
    });

    it('should handle input sanitization error', async () => {
      mockSanitizeUserInput.mockReturnValue({
        isValid: false,
        sanitized: {},
        errors: ['Potentially malicious content detected'],
      });

      const request = new NextRequest('http://localhost:3000/api/faculties', {
        method: 'POST',
        headers: {
          'x-user-id': 'admin_user',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nameTh: '<script>alert("xss")</script>',
          nameEn: 'Faculty of Information Technology',
          code: 'IT',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ข้อมูลไม่ถูกต้อง');
      expect(data.details).toEqual(['Potentially malicious content detected']);
    });

    it('should handle database error during creation', async () => {
      mockPrisma.faculty.findFirst.mockResolvedValue(null);
      mockPrisma.faculty.create.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/faculties', {
        method: 'POST',
        headers: {
          'x-user-id': 'admin_user',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nameTh: 'คณะเทคโนโลยีสารสนเทศ',
          nameEn: 'Faculty of Information Technology',
          code: 'IT',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(mockCleanup).toHaveBeenCalled();
    });
  });
});
