import { render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/use-auth';
import AdminReportsPage from '../page';

// Mock the useAuth hook
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}));

// Mock the useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

// Mock fetch
global.fetch = jest.fn();

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('AdminReportsPage', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'admin_user',
        name: 'Admin User',
        email: 'admin@test.com',
        roles: ['admin'],
      },
      loading: false,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        reports: [
          {
            id: 'report_1',
            title: 'Test Report 1',
            student: { name: 'Student 1', id: 'student_1' },
            supervisor: { name: 'Supervisor 1', id: 'supervisor_1' },
            application: {
              internship: {
                company: { name: 'Company 1' }
              }
            },
            status: 'submitted',
            createdAt: '2024-01-01T00:00:00Z',
          }
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders reports page with correct title', async () => {
    render(<AdminReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('รายงานผลการนิเทศ')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    render(<AdminReportsPage />);
    
    expect(screen.getByText('กำลังโหลดข้อมูล...')).toBeInTheDocument();
  });

  it('renders reports table when data is loaded', async () => {
    render(<AdminReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Student 1')).toBeInTheDocument();
      expect(screen.getByText('Company 1')).toBeInTheDocument();
      expect(screen.getByText('Supervisor 1')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<AdminReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('ไม่พบข้อมูล')).toBeInTheDocument();
    });
  });

  it('shows empty state when no reports', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        reports: [],
        total: 0,
        page: 1,
        totalPages: 0,
      }),
    });

    render(<AdminReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('ไม่พบข้อมูล')).toBeInTheDocument();
    });
  });
});
