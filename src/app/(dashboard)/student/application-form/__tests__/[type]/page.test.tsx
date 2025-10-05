import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import ApplicationFormTypePage from '../[type]/page';

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock custom hooks
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

describe('ApplicationFormTypePage', () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseParams.mockReturnValue({ type: 'internship' });
    mockUseRouter.mockReturnValue({ push: mockPush } as any);
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    mockUseToast.mockReturnValue({ toast: mockToast });
    
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ internships: [] }),
    });
  });

  it('renders internship form correctly', () => {
    const mockUser = {
      id: 'student_123',
      name: 'John Doe',
      roles: 'student',
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      switchRole: jest.fn(),
    });

    render(<ApplicationFormTypePage />);

    expect(screen.getByText('ฝึกงาน')).toBeInTheDocument();
    expect(screen.getByText('เหตุผลที่ต้องการฝึกงาน')).toBeInTheDocument();
    expect(screen.getByText('ทักษะที่คาดหวัง')).toBeInTheDocument();
  });

  it('renders co-op form correctly', () => {
    const mockUser = {
      id: 'student_123',
      name: 'John Doe',
      roles: 'student',
    };

    mockUseParams.mockReturnValue({ type: 'co_op' });
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      switchRole: jest.fn(),
    });

    render(<ApplicationFormTypePage />);

    expect(screen.getByText('สหกิจศึกษา')).toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    const mockUser = {
      id: 'student_123',
      name: 'John Doe',
      roles: 'student',
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      switchRole: jest.fn(),
    });

    render(<ApplicationFormTypePage />);

    const submitButton = screen.getByText('ส่งใบสมัคร');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'ข้อมูลไม่ครบถ้วน',
        description: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน',
      });
    });
  });

  it('validates date format', async () => {
    const mockUser = {
      id: 'student_123',
      name: 'John Doe',
      roles: 'student',
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      switchRole: jest.fn(),
    });

    render(<ApplicationFormTypePage />);

    // Fill required fields
    fireEvent.change(screen.getByLabelText('เหตุผลที่ต้องการฝึกงาน'), {
      target: { value: 'Test reason' },
    });
    fireEvent.change(screen.getByLabelText('วันที่ต้องการเริ่มฝึกงาน'), {
      target: { value: 'invalid-date' },
    });

    const submitButton = screen.getByText('ส่งใบสมัคร');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'วันที่ไม่ถูกต้อง',
        description: 'กรุณากรอกวันที่ในรูปแบบ วว/ดด/ปปปป',
      });
    });
  });

  it('submits form successfully', async () => {
    const mockUser = {
      id: 'student_123',
      name: 'John Doe',
      roles: 'student',
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      switchRole: jest.fn(),
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    render(<ApplicationFormTypePage />);

    // Fill form
    fireEvent.change(screen.getByLabelText('เหตุผลที่ต้องการฝึกงาน'), {
      target: { value: 'Test reason' },
    });
    fireEvent.change(screen.getByLabelText('วันที่ต้องการเริ่มฝึกงาน'), {
      target: { value: '01/02/2024' },
    });

    const submitButton = screen.getByText('ส่งใบสมัคร');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('Test reason'),
      });
    });
  });

  it('handles submission errors', async () => {
    const mockUser = {
      id: 'student_123',
      name: 'John Doe',
      roles: 'student',
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      switchRole: jest.fn(),
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'Server error' }),
    });

    render(<ApplicationFormTypePage />);

    // Fill form
    fireEvent.change(screen.getByLabelText('เหตุผลที่ต้องการฝึกงาน'), {
      target: { value: 'Test reason' },
    });
    fireEvent.change(screen.getByLabelText('วันที่ต้องการเริ่มฝึกงาน'), {
      target: { value: '01/02/2024' },
    });

    const submitButton = screen.getByText('ส่งใบสมัคร');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'ไม่สามารถส่งใบสมัครได้',
        description: 'Server error',
      });
    });
  });
});
