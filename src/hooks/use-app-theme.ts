"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSystemTheme } from './use-system-theme';

const THEME_STORAGE_KEY = "internship-flow-theme";
const DEFAULT_LOGO_URL = '/favicon.png';

export function useAppTheme() {
  const { logo: systemLogo, background: systemBackground, isLoading: systemLoading } = useSystemTheme();
  const [logo, setLogo] = useState<string | null>(systemLogo);
  const [isThemeLoading, setIsThemeLoading] = useState(true);
  const [loginBackground, setLoginBackground] = useState<string | null>(systemBackground);
  const [isUploading, setIsUploading] = useState({
    logo: false,
    background: false
  });

  useEffect(() => {
    if (!systemLoading) {
      setLogo(systemLogo);
      setLoginBackground(systemBackground);
      if (systemLogo) {
        updateFavicon(systemLogo);
      }
      setIsThemeLoading(false);
    }
  }, [systemLogo, systemBackground, systemLoading]);

  // Fallback to localStorage if database is not available
  useEffect(() => {
    if (isThemeLoading && !systemLoading) {
      try {
        const themeItem = localStorage.getItem(THEME_STORAGE_KEY);
        if (themeItem) {
          const parsedTheme: AppTheme = JSON.parse(themeItem);
          if (parsedTheme.logo) setLogo(parsedTheme.logo);
          if (parsedTheme.loginBackground) setLoginBackground(parsedTheme.loginBackground);
        }
      } catch (error) {
        console.error("Failed to parse theme from localStorage", error);
        localStorage.removeItem(THEME_STORAGE_KEY);
      } finally {
        if (logo) {
          updateFavicon(logo);
        }
        setIsThemeLoading(false);
      }
    }
  }, [isThemeLoading, systemLoading, logo]);

  const updateFavicon = (logoUrl: string) => {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href = logoUrl;
    } else {
      const newFavicon = document.createElement("link");
      newFavicon.rel = "icon";
      newFavicon.href = logoUrl;
      document.head.appendChild(newFavicon);
    }
  };

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return { success: false, message: 'ไม่พบไฟล์' };
    
    setIsUploading(prev => ({ ...prev, logo: true }));
    
    try {
      // Upload to system media API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'logo');
      formData.append('uploadedBy', 'admin'); // TODO: Get actual user ID
      
      const response = await fetch('/api/system-media', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        const logoPath = data.url;
        setLogo(logoPath);
        updateFavicon(logoPath);
        
        // Trigger theme reload
        localStorage.setItem('system-theme-updated', 'true');
        window.dispatchEvent(new StorageEvent('storage', { key: 'system-theme-updated' }));
        
        return { success: true, message: 'อัปโหลดโลโก้สำเร็จ', url: logoPath };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'อัปโหลดล้มเหลว' };
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      return { success: false, message: `เกิดข้อผิดพลาด: ${error.message}` };
    } finally {
      setIsUploading(prev => ({ ...prev, logo: false }));
    }
  };

  const handleLoginBgChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return { success: false, message: 'ไม่พบไฟล์' };
    
    setIsUploading(prev => ({ ...prev, background: true }));
    
    try {
      // Upload to system media API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'background');
      formData.append('uploadedBy', 'admin'); // TODO: Get actual user ID
      
      const response = await fetch('/api/system-media', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        const bgPath = data.url;
        setLoginBackground(bgPath);
        
        // Trigger theme reload
        localStorage.setItem('system-theme-updated', 'true');
        window.dispatchEvent(new StorageEvent('storage', { key: 'system-theme-updated' }));
        
        return { success: true, message: 'อัปโหลดภาพพื้นหลังสำเร็จ', url: bgPath };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'อัปโหลดล้มเหลว' };
      }
    } catch (error) {
      console.error('Error uploading background:', error);
      return { success: false, message: `เกิดข้อผิดพลาด: ${error.message}` };
    } finally {
      setIsUploading(prev => ({ ...prev, background: false }));
    }
  };

  const saveTheme = useCallback(() => {
    try {
      const themeToStore: AppTheme = { logo, loginBackground };
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeToStore));
      if (logo) {
        updateFavicon(logo);
      }
      alert("บันทึกธีมเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Failed to save theme to localStorage", error);
      alert("เกิดข้อผิดพลาดในการบันทึกธีม");
    }
  }, [logo]);

  return { 
    logo, 
    loginBackground, 
    isThemeLoading, 
    isUploading,
    handleLogoChange, 
    handleLoginBgChange, 
    saveTheme 
  };
}

type AppTheme = {
  logo: string | null;
  loginBackground?: string | null;
};
