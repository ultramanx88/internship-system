import { render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/use-auth';
import ApplicationFormPage from '../page';

// Mock useAuth hook
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('ApplicationFormPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ applications: [] }),
    });
  });

  it('renders loading state initially', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      switchRole: jest.fn(),
    });

    render(<ApplicationFormPage />);
    
    expect(screen.getByText('กำลังโหลด...')).toBeInTheDocument();
  });

  it('renders timeline steps for registered student', async () => {
    const mockUser = {
      id: 'student_123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '0123456789',
      t_name: 'จอห์น',
      t_surname: 'โด',
      facultyId: 'faculty_1',
      majorId: 'major_1',
      roles: 'student',
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      switchRole: jest.fn(),
    });

    render(<ApplicationFormPage />);

    await waitFor(() => {
      expect(screen.getByText('ลงทะเบียนข้อมูลนักศึกษา')).toBeInTheDocument();
      expect(screen.getByText('กรอกข้อมูลสหกิจศึกษาหรือฝึกงาน')).toBeInTheDocument();
      expect(screen.getByText('ยื่นเอกสารให้กับทางบริษัท')).toBeInTheDocument();
    });
  });

  it('shows registration status for incomplete profile', async () => {
    const mockUser = {
      id: 'student_123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: null, // Missing phone
      t_name: null, // Missing t_name
      t_surname: null, // Missing t_surname
      facultyId: null, // Missing facultyId
      majorId: null, // Missing majorId
      roles: 'student',
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      switchRole: jest.fn(),
    });

    render(<ApplicationFormPage />);

    await waitFor(() => {
      expect(screen.getByText('กรุณากรอกข้อมูลนักศึกษาให้ครบถ้วน')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const mockUser = {
      id: 'student_123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '0123456789',
      t_name: 'จอห์น',
      t_surname: 'โด',
      facultyId: 'faculty_1',
      majorId: 'major_1',
      roles: 'student',
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      switchRole: jest.fn(),
    });

    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<ApplicationFormPage />);

    await waitFor(() => {
      expect(screen.getByText('เกิดข้อผิดพลาดในการโหลดข้อมูล')).toBeInTheDocument();
    });
  });
});
