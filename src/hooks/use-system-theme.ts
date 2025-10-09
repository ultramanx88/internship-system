"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSystemMedia, SystemMedia } from './use-system-media';

const DEFAULT_LOGO = '/assets/images/system/garuda-logo.png';
const DEFAULT_BACKGROUND = '/assets/images/placeholder-bg.jpg';

export function useSystemTheme() {
  const { getActiveMediaByType, fetchActiveSystemMedia } = useSystemMedia();
  const [logo, setLogo] = useState<string>(DEFAULT_LOGO);
  const [background, setBackground] = useState<string>(DEFAULT_BACKGROUND);
  const [favicon, setFavicon] = useState<string>('/favicon.ico');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);

  // Update favicon
  const updateFavicon = useCallback((faviconUrl: string) => {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href = faviconUrl;
    } else {
      const newFavicon = document.createElement("link");
      newFavicon.rel = "icon";
      newFavicon.href = faviconUrl;
      document.head.appendChild(newFavicon);
    }
  }, []);

  // Load system theme from database
  const loadSystemTheme = useCallback(async () => {
    if (isLoadingTheme) {
      console.log('Already loading theme, skipping...');
      return;
    }

    try {
      setIsLoadingTheme(true);
      setIsLoading(true);
      
      // Get active media directly from the API
      // This prevents infinite loop caused by dependency on systemMedia state
      const response = await fetch('/api/system-media/active');
      const result = await response.json();
      
      if (result.success && result.data) {
        const activeLogo = result.data.find((media: any) => media.type === 'logo' && media.isActive);
        const activeBackground = result.data.find((media: any) => media.type === 'background' && media.isActive);
        const activeFavicon = result.data.find((media: any) => media.type === 'favicon' && media.isActive);

        // Update states
        if (activeLogo) {
          setLogo(activeLogo.filePath);
        }
        if (activeBackground) {
          setBackground(activeBackground.filePath);
        }
        if (activeFavicon) {
          setFavicon(activeFavicon.filePath);
          updateFavicon(activeFavicon.filePath);
        }
      }
    } catch (error) {
      console.error('Error loading system theme:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingTheme(false);
    }
  }, [updateFavicon, isLoadingTheme]);

  // Load theme on mount - only once
  useEffect(() => {
    loadSystemTheme();
  }, []); // Empty dependency array to run only once

  // Listen for theme changes (for real-time updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'system-theme-updated') {
        loadSystemTheme();
        localStorage.removeItem('system-theme-updated');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadSystemTheme]);

  return {
    logo,
    background,
    favicon,
    isLoading,
    loadSystemTheme,
    updateFavicon
  };
}
