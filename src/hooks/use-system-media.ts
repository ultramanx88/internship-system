"use client";

import { useState, useEffect, useCallback } from 'react';

export interface SystemMedia {
  id: string;
  type: 'logo' | 'background' | 'favicon';
  name: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  isActive: boolean;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemMediaResponse {
  success: boolean;
  data?: SystemMedia[];
  message?: string;
}

export function useSystemMedia() {
  const [systemMedia, setSystemMedia] = useState<SystemMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ดึงข้อมูลไฟล์ระบบทั้งหมด
  const fetchSystemMedia = useCallback(async (type?: string, activeOnly: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (activeOnly) params.append('activeOnly', 'true');

      const response = await fetch(`/api/system-media?${params.toString()}`);
      const result: SystemMediaResponse = await response.json();

      if (result.success && result.data) {
        setSystemMedia(result.data);
      } else {
        setError(result.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      console.error('Fetch system media error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ดึงข้อมูลไฟล์ระบบที่ใช้งานอยู่
  const fetchActiveSystemMedia = useCallback(async (type?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (type) params.append('type', type);

      const response = await fetch(`/api/system-media/active?${params.toString()}`);
      const result: SystemMediaResponse = await response.json();

      if (result.success && result.data) {
        setSystemMedia(result.data);
      } else {
        setError(result.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      console.error('Fetch active system media error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // อัปโหลดไฟล์ระบบ
  const uploadSystemMedia = useCallback(async (
    file: File, 
    type: 'logo' | 'background' | 'favicon', 
    uploadedBy: string
  ) => {
    try {
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('uploadedBy', uploadedBy);

      const response = await fetch('/api/system-media', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the list
        await fetchSystemMedia();
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      setError(errorMessage);
      console.error('Upload system media error:', err);
      return { success: false, message: errorMessage };
    }
  }, [fetchSystemMedia]);

  // ลบไฟล์ระบบ
  const deleteSystemMedia = useCallback(async (id: string) => {
    try {
      setError(null);

      const response = await fetch('/api/system-media', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the list
        await fetchSystemMedia();
        return { success: true, message: result.message };
      } else {
        setError(result.message || 'เกิดข้อผิดพลาดในการลบ');
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      setError(errorMessage);
      console.error('Delete system media error:', err);
      return { success: false, message: errorMessage };
    }
  }, [fetchSystemMedia]);

  // เปิดใช้งานไฟล์ระบบ
  const activateSystemMedia = useCallback(async (id: string) => {
    try {
      setError(null);

      const response = await fetch('/api/system-media/active', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the list
        await fetchSystemMedia();
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.message || 'เกิดข้อผิดพลาดในการเปิดใช้งาน');
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      setError(errorMessage);
      console.error('Activate system media error:', err);
      return { success: false, message: errorMessage };
    }
  }, [fetchSystemMedia]);

  // ดึงไฟล์ที่ใช้งานอยู่ตามประเภท
  const getActiveMediaByType = useCallback((type: 'logo' | 'background' | 'favicon') => {
    return systemMedia.find(media => media.type === type && media.isActive);
  }, [systemMedia]);

  // ดึงไฟล์ทั้งหมดตามประเภท
  const getMediaByType = useCallback((type: 'logo' | 'background' | 'favicon') => {
    return systemMedia.filter(media => media.type === type);
  }, [systemMedia]);

  // Load data on mount
  useEffect(() => {
    fetchSystemMedia();
  }, [fetchSystemMedia]);

  return {
    systemMedia,
    isLoading,
    error,
    fetchSystemMedia,
    fetchActiveSystemMedia,
    uploadSystemMedia,
    deleteSystemMedia,
    activateSystemMedia,
    getActiveMediaByType,
    getMediaByType,
    clearError: () => setError(null)
  };
}
