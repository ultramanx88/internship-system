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

  // Load system theme from database
  const loadSystemTheme = useCallback(async () => {
    try {
      setIsLoading(true);
      await fetchActiveSystemMedia();
      
      // Get active media
      const activeLogo = getActiveMediaByType('logo');
      const activeBackground = getActiveMediaByType('background');
      const activeFavicon = getActiveMediaByType('favicon');

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
    } catch (error) {
      console.error('Error loading system theme:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchActiveSystemMedia, getActiveMediaByType]);

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

  // Load theme on mount
  useEffect(() => {
    loadSystemTheme();
  }, [loadSystemTheme]);

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
