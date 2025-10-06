"use client";

import { useState, useEffect } from 'react';

const SYSTEM_LOGO_KEY = 'system-logo';
const DEFAULT_SYSTEM_LOGO = '/assets/images/system/garuda-logo.png';

export function useSystemLogo() {
  const [systemLogo, setSystemLogo] = useState<string>(DEFAULT_SYSTEM_LOGO);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedLogo = localStorage.getItem(SYSTEM_LOGO_KEY);
      if (storedLogo) {
        setSystemLogo(storedLogo);
      }
    } catch (error) {
      console.error('Error loading system logo from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
