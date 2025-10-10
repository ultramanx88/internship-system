"use client";

import { useEffect } from 'react';

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const controller = new AbortController();
      const register = async () => {
        try {
          await navigator.serviceWorker.register('/sw.js');
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('SW registration failed:', err);
          }
        }
      };
      register();
      return () => controller.abort();
    }
  }, []);

  return null;
}


