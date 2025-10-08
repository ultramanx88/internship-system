import { 
  ApplicationFormData, 
  UserProfile, 
  Application, 
  Document,
  ValidationResult 
} from './types';
import { WorkflowValidator } from './validation';

export class WorkflowAPI {
  /**
   * โหลดโปรไฟล์ผู้ใช้
   */
  static async loadUserProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await fetch(`/api/user/profile`, {
        headers: { 'x-user-id': userId }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load user profile');
      }
      
      const data = await response.json();
      const profile = data?.profile || data;
      
      return {
        id: profile.id || userId,
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        t_name: profile.t_name || '',
        t_surname: profile.t_surname || '',
        t_title: profile.t_title || '',
        facultyId: profile.facultyId || '',
        majorId: profile.majorId || '',
        departmentId: profile.departmentId || '',
        curriculumId: profile.curriculumId || '',
        profileComplete: this.checkProfileComplete(profile)
      };
    } catch (error) {
      console.error('Error loading user profile:', error);
      throw error;
    }
  }

  /**
   * บันทึกโปรไฟล์ผู้ใช้
   */
  static async saveUserProfile(profile: Partial<UserProfile>): Promise<void> {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save user profile');
      }
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  }

  /**
   * โหลดใบสมัครล่าสุด
   */
  static async loadLatestApplication(userId: string): Promise<Application | null> {
    try {
      const response = await fetch(`/api/student/applications?limit=1`, {
        headers: { 'x-user-id': userId }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load applications');
      }
      
      const data = await response.json();
      const applications = data?.data?.applications || [];
      
      return applications[0] || null;
    } catch (error) {
      console.error('Error loading applications:', error);
      return null;
    }
  }

  /**
   * โหลดใบสมัครตาม ID
   */
  static async loadApplication(applicationId: string): Promise<ApplicationFormData | null> {
    try {
      const response = await fetch(`/api/applications/${applicationId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load application');
      }
      
      const data = await response.json();
      return data?.data || null;
    } catch (error) {
      console.error('Error loading application:', error);
      return null;
    }
  }

  /**
   * บันทึกใบสมัคร
   */
  static async saveApplication(applicationData: ApplicationFormData): Promise<Application> {
    try {
      // ตรวจสอบข้อมูลก่อนบันทึก
      const validation = WorkflowValidator.validateApplicationForm(applicationData);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save application');
      }
      
      const data = await response.json();
      return data?.data;
    } catch (error) {
      console.error('Error saving application:', error);
      throw error;
    }
  }

  /**
   * อัปเดตใบสมัคร
   */
  static async updateApplication(applicationId: string, applicationData: Partial<ApplicationFormData>): Promise<Application> {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update application');
      }
      
      const data = await response.json();
      return data?.data;
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  }

  /**
   * ส่งใบสมัคร
   */
  static async submitApplication(applicationId: string): Promise<void> {
    try {
      const response = await fetch(`/api/applications/${applicationId}/submit`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  }

  /**
   * อัปโหลดเอกสาร
   */
  static async uploadDocument(file: File, type: string): Promise<Document> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload document');
      }
      
      const data = await response.json();
      return data?.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  /**
   * ลบเอกสาร
   */
  static async deleteDocument(documentId: string): Promise<void> {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * ตรวจสอบความสมบูรณ์ของโปรไฟล์
   */
  private static checkProfileComplete(profile: any): boolean {
    const required = ['name', 'email', 'phone', 't_name', 't_surname', 'facultyId', 'majorId'];
    return required.every(field => profile[field] && profile[field].trim() !== '');
  }

  /**
   * ตรวจสอบสถานะการทำงาน
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch('/api/health');
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * รับข้อมูลบริษัท
   */
  static async loadCompanies(): Promise<any[]> {
    try {
      const response = await fetch('/api/companies');
      
      if (!response.ok) {
        throw new Error('Failed to load companies');
      }
      
      const data = await response.json();
      return data?.data || [];
    } catch (error) {
      console.error('Error loading companies:', error);
      return [];
    }
  }

  /**
   * รับข้อมูลปีการศึกษา
   */
  static async loadAcademicYears(): Promise<any[]> {
    try {
      const response = await fetch('/api/academic-years');
      
      if (!response.ok) {
        throw new Error('Failed to load academic years');
      }
      
      const data = await response.json();
      return data?.data || [];
    } catch (error) {
      console.error('Error loading academic years:', error);
      return [];
    }
  }

  /**
   * รับข้อมูลภาคการศึกษา
   */
  static async loadSemesters(academicYearId: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/semesters?academicYearId=${academicYearId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load semesters');
      }
      
      const data = await response.json();
      return data?.data || [];
    } catch (error) {
      console.error('Error loading semesters:', error);
      return [];
    }
  }
}
