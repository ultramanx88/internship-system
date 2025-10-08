"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSystemTheme } from './use-system-theme';

const THEME_STORAGE_KEY = "internship-flow-theme";
const DEFAULT_LOGO_URL = "/assets/images/system/garuda-logo.png";

export function useAppTheme() {
  const { logo: systemLogo, background: systemBackground, isLoading: systemLoading } = useSystemTheme();
  const [logo, setLogo] = useState<string | null>(systemLogo);
  const [isThemeLoading, setIsThemeLoading] = useState(true);
  const [loginBackground, setLoginBackground] = useState<string | null>(systemBackground);

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
    if (file) {
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
          const logoPath = data.url || `/assets/images/system/${file.name}`;
          setLogo(logoPath);
          updateFavicon(logoPath);
          alert('อัปโหลดโลโก้สำเร็จ');
          
          // Trigger theme reload
          localStorage.setItem('system-theme-updated', 'true');
          window.dispatchEvent(new StorageEvent('storage', { key: 'system-theme-updated' }));
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Upload failed');
        }
      } catch (error) {
        console.error('Error uploading logo:', error);
        alert(`เกิดข้อผิดพลาดในการอัปโหลดโลโก้: ${error.message}`);
      }
    }
  };

  const handleLoginBgChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
          const bgPath = data.url || `/assets/images/system/${file.name}`;
          setLoginBackground(bgPath);
          alert('อัปโหลดภาพพื้นหลังสำเร็จ');
          
          // Trigger theme reload
          localStorage.setItem('system-theme-updated', 'true');
          window.dispatchEvent(new StorageEvent('storage', { key: 'system-theme-updated' }));
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Upload failed');
        }
      } catch (error) {
        console.error('Error uploading background:', error);
        alert(`เกิดข้อผิดพลาดในการอัปโหลดภาพพื้นหลัง: ${error.message}`);
      }
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

  return { logo, loginBackground, isThemeLoading, handleLogoChange, handleLoginBgChange, saveTheme };
}

type AppTheme = {
  logo: string | null;
  loginBackground?: string | null;
};
