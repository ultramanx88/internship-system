"use client";

import { useState, useEffect } from 'react';
import { useSystemTheme } from './use-system-theme';

const SYSTEM_LOGO_KEY = 'system-logo';
const DEFAULT_SYSTEM_LOGO = '/favicon.png';

export function useSystemLogo() {
  const { logo, isLoading: themeLoading } = useSystemTheme();
  const [systemLogo, setSystemLogo] = useState<string>(DEFAULT_SYSTEM_LOGO);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!themeLoading) {
      setSystemLogo(logo);
      setIsLoading(false);
    }
  }, [logo, themeLoading]);

  // Fallback to localStorage if database is not available
  useEffect(() => {
    if (isLoading && !themeLoading) {
      try {
        const storedLogo = localStorage.getItem(SYSTEM_LOGO_KEY);
        if (storedLogo && storedLogo !== DEFAULT_SYSTEM_LOGO) {
          setSystemLogo(storedLogo);
        }
      } catch (error) {
        console.error('Error loading system logo from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isLoading, themeLoading]);

  const updateSystemLogo = (logoUrl: string) => {
    try {
      setSystemLogo(logoUrl);
      localStorage.setItem(SYSTEM_LOGO_KEY, logoUrl);
    } catch (error) {
      console.error('Error saving system logo to localStorage:', error);
    }
  };

  const resetSystemLogo = () => {
    updateSystemLogo(DEFAULT_SYSTEM_LOGO);
  };

  return {
    systemLogo,
    isLoading,
    updateSystemLogo,
    resetSystemLogo
  };
}
