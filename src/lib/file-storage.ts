// File storage utilities

export interface FileUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class FileStorageService {
  private static readonly UPLOAD_DIR = '/uploads';
  private static readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  /**
   * Generate unique filename with user ID
   */
  static generateFileName(userId: string, originalName: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    return `profile_${userId}_${timestamp}.${extension}`;
  }

  /**
   * Generate file path structure
   */
  static getFilePath(userId: string, fileName: string): string {
    // Structure: /uploads/profiles/[year]/[month]/[userId]/filename
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    return `${this.UPLOAD_DIR}/profiles/${year}/${month}/${userId}/${fileName}`;
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'รองรับเฉพาะไฟล์ JPG, PNG, WebP เท่านั้น' };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, error: 'ไฟล์มีขนาดใหญ่เกิน 2MB' };
    }

    return { valid: true };
  }

  /**
   * Upload file to server
   */
  static async uploadFile(file: File, userId: string): Promise<FileUploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('type', 'profile');

      // Upload to server
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true, url: result.url };
      } else {
        return { success: false, error: result.message || 'อัปโหลดไฟล์ไม่สำเร็จ' };
      }
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์' };
    }
  }

  /**
   * Delete old profile image
   */
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath }),
      });

      return response.ok;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }
}

// File path examples:
// /uploads/profiles/2024/10/user123/profile_user123_1696234567890.jpg
// /uploads/profiles/2024/10/user456/profile_user456_1696234567891.png
// /uploads/documents/2024/10/user123/document_user123_1696234567892.pdf