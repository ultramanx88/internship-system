import { render, screen, waitFor } from '@testing-library/react';
import StudentPage from '../page';
import { useAuth } from '@/hooks/use-auth';

// Mock the useAuth hook
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('StudentPage', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'student_user',
        name: 'Student User',
        email: 'student@test.com',
        roles: ['student'],
      },
      loading: false,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          user: {
            id: 'student_user',
            name: 'Student User',
            email: 'student@test.com',
            roles: ['student'],
          },
          applications: [],
          approvedApplication: null,
          upcomingDeadlines: [],
          recentActivities: [],
          stats: {
            totalApplications: 0,
            approvedApplications: 0,
            pendingApplications: 0,
            completedApplications: 0,
          },
        },
      }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<StudentPage />);
    
    expect(screen.getByText('กำลังโหลดข้อมูล...')).toBeInTheDocument();
  });

  it('renders dashboard data after loading', async () => {
    render(<StudentPage />);
    
    await waitFor(() => {
      expect(screen.getByText('หน้าแรก')).toBeInTheDocument();
      expect(screen.getByText('ยินดีต้อนรับ, Student User!')).toBeInTheDocument();
    });
  });

  it('renders error state when API fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<StudentPage />);
    
    await waitFor(() => {
      expect(screen.getByText('เกิดข้อผิดพลาด: API Error')).toBeInTheDocument();
      expect(screen.getByText('ลองใหม่')).toBeInTheDocument();
    });
  });

  it('renders no data state when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(<StudentPage />);
    
    await waitFor(() => {
      expect(screen.getByText('ไม่พบข้อมูล')).toBeInTheDocument();
    });
  });

  it('displays user statistics', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          user: {
            id: 'student_user',
            name: 'Student User',
            email: 'student@test.com',
            roles: ['student'],
          },
          applications: [],
          approvedApplication: null,
          upcomingDeadlines: [],
          recentActivities: [],
          stats: {
            totalApplications: 5,
            approvedApplications: 2,
            pendingApplications: 1,
            completedApplications: 2,
          },
        },
      }),
    });

    render(<StudentPage />);
    
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // totalApplications
      expect(screen.getByText('2')).toBeInTheDocument(); // approvedApplications
    });
  });

  it('displays upcoming deadlines', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          user: {
            id: 'student_user',
            name: 'Student User',
            email: 'student@test.com',
            roles: ['student'],
          },
          applications: [],
          approvedApplication: null,
          upcomingDeadlines: [
            {
              id: '1',
              title: 'ส่งรายงานความคืบหน้า',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              type: 'report',
              priority: 'high',
            },
          ],
          recentActivities: [],
          stats: {
            totalApplications: 0,
            approvedApplications: 0,
            pendingApplications: 0,
            completedApplications: 0,
          },
        },
      }),
    });

    render(<StudentPage />);
    
    await waitFor(() => {
      expect(screen.getByText('ส่งรายงานความคืบหน้า')).toBeInTheDocument();
    });
  });

  it('displays recent activities', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          user: {
            id: 'student_user',
            name: 'Student User',
            email: 'student@test.com',
            roles: ['student'],
          },
          applications: [],
          approvedApplication: null,
          upcomingDeadlines: [],
          recentActivities: [
            {
              id: '1',
              type: 'application',
              message: 'ส่งใบสมัครฝึกงานเรียบร้อยแล้ว',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              status: 'success',
            },
          ],
          stats: {
            totalApplications: 0,
            approvedApplications: 0,
            pendingApplications: 0,
            completedApplications: 0,
          },
        },
      }),
    });

    render(<StudentPage />);
    
    await waitFor(() => {
      expect(screen.getByText('ส่งใบสมัครฝึกงานเรียบร้อยแล้ว')).toBeInTheDocument();
    });
  });

  it('handles retry button click', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<StudentPage />);
    
    await waitFor(() => {
      expect(screen.getByText('เกิดข้อผิดพลาด: API Error')).toBeInTheDocument();
    });

    // Mock successful retry
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          user: {
            id: 'student_user',
            name: 'Student User',
            email: 'student@test.com',
            roles: ['student'],
          },
          applications: [],
          approvedApplication: null,
          upcomingDeadlines: [],
          recentActivities: [],
          stats: {
            totalApplications: 0,
            approvedApplications: 0,
            pendingApplications: 0,
            completedApplications: 0,
          },
        },
      }),
    });

    const retryButton = screen.getByText('ลองใหม่');
    retryButton.click();

    await waitFor(() => {
      expect(screen.getByText('หน้าแรก')).toBeInTheDocument();
    });
  });
});
