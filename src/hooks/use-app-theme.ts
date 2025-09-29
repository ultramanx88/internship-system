'use client';

import { useState, useEffect, useCallback } from 'react';

const THEME_STORAGE_KEY = 'internship-flow-theme';

type AppTheme = {
  logo: string | null;
};

export function useAppTheme() {
  const [logo, setLogo] = useState<string | null>(null);
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  useEffect(() => {
    try {
      const themeItem = localStorage.getItem(THEME_STORAGE_KEY);
      if (themeItem) {
        const parsedTheme: AppTheme = JSON.parse(themeItem);
        if (parsedTheme.logo) {
          setLogo(parsedTheme.logo);
          updateFavicon(parsedTheme.logo);
        }
      }
    } catch (error) {
      console.error('Failed to parse theme from localStorage', error);
      localStorage.removeItem(THEME_STORAGE_KEY);
    } finally {
      setIsThemeLoading(false);
    }
  }, []);

  const updateFavicon = (logoUrl: string) => {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href = logoUrl;
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.href = logoUrl;
      document.head.appendChild(newFavicon);
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setLogo(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const saveTheme = useCallback(() => {
    try {
        const themeToStore: AppTheme = { logo };
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeToStore));
        if (logo) {
            updateFavicon(logo);
        }
        alert('บันทึกธีมเรียบร้อยแล้ว');
    } catch (error) {
        console.error('Failed to save theme to localStorage', error);
        alert('เกิดข้อผิดพลาดในการบันทึกธีม');
    }
  }, [logo]);


  return { logo, isThemeLoading, handleLogoChange, saveTheme };
}
