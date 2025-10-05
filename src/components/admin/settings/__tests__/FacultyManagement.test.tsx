import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FacultyManagement } from '../FacultyManagement';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

// Mock the useAuth hook
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}));

// Mock the useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

describe('FacultyManagement', () => {
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

    mockUseToast.mockReturnValue({
      toast: jest.fn(),
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        faculties: [
          {
            id: 'faculty_1',
            nameTh: 'คณะเทคโนโลยีสารสนเทศ',
            nameEn: 'Faculty of Information Technology',
            code: 'IT',
            isActive: true,
          },
          {
            id: 'faculty_2',
            nameTh: 'คณะบริหารธุรกิจ',
            nameEn: 'Faculty of Business Administration',
            code: 'BUS',
            isActive: true,
          },
        ],
      }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders faculty management component', async () => {
    render(<FacultyManagement />);
    
    expect(screen.getByText('จัดการคณะ')).toBeInTheDocument();
    expect(screen.getByText('เพิ่มคณะ')).toBeInTheDocument();
    expect(screen.getByText('บันทึกการเปลี่ยนแปลง')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    render(<FacultyManagement />);
    
    expect(screen.getByText('กำลังโหลดข้อมูล...')).toBeInTheDocument();
  });

  it('fetches and displays faculties', async () => {
    render(<FacultyManagement />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('คณะเทคโนโลยีสารสนเทศ')).toBeInTheDocument();
      expect(screen.getByDisplayValue('คณะบริหารธุรกิจ')).toBeInTheDocument();
    });
  });

  it('handles add faculty', async () => {
    render(<FacultyManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('เพิ่มคณะ')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('เพิ่มคณะ'));
    
    // Should show new empty row
    const emptyInputs = screen.getAllByDisplayValue('');
    expect(emptyInputs.length).toBeGreaterThan(0);
  });

  it('handles faculty name change', async () => {
    render(<FacultyManagement />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('คณะเทคโนโลยีสารสนเทศ')).toBeInTheDocument();
    });
    
    const nameInput = screen.getByDisplayValue('คณะเทคโนโลยีสารสนเทศ');
    fireEvent.change(nameInput, { target: { value: 'คณะเทคโนโลยีสารสนเทศ (แก้ไข)' } });
    
    expect(nameInput).toHaveValue('คณะเทคโนโลยีสารสนเทศ (แก้ไข)');
  });

  it('handles remove faculty', async () => {
    render(<FacultyManagement />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('คณะเทคโนโลยีสารสนเทศ')).toBeInTheDocument();
    });
    
    const removeButtons = screen.getAllByTitle('ลบคณะ');
    fireEvent.click(removeButtons[0]);
    
    // Faculty should be removed from display
    expect(screen.queryByDisplayValue('คณะเทคโนโลยีสารสนเทศ')).not.toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<FacultyManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('ไม่พบข้อมูลคณะ')).toBeInTheDocument();
    });
  });

  it('handles save changes', async () => {
    const mockToast = jest.fn();
    mockUseToast.mockReturnValue({
      toast: mockToast,
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ faculties: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<FacultyManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('บันทึกการเปลี่ยนแปลง')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('บันทึกการเปลี่ยนแปลง'));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'สำเร็จ',
        description: 'บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว',
      });
    });
  });

  it('handles save error', async () => {
    const mockToast = jest.fn();
    mockUseToast.mockReturnValue({
      toast: mockToast,
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ faculties: [] }),
      })
      .mockRejectedValueOnce(new Error('Save failed'));

    render(<FacultyManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('บันทึกการเปลี่ยนแปลง')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('บันทึกการเปลี่ยนแปลง'));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกการเปลี่ยนแปลงได้',
      });
    });
  });
});
