import { useState, useEffect } from 'react';

interface SystemSetting {
  value: string;
  description?: string;
  category?: string;
}

interface SystemSettings {
  [key: string]: SystemSetting;
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      const data = await response.json();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching system settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string, description?: string, category?: string) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value, description, category }),
      });

      if (!response.ok) {
        throw new Error('Failed to update setting');
      }

      const result = await response.json();
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        [key]: {
          value,
          description,
          category
        }
      }));

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error updating setting:', err);
      throw err;
    }
  };

  const getSetting = (key: string, defaultValue: string = '') => {
    return settings[key]?.value || defaultValue;
  };

  const getBooleanSetting = (key: string, defaultValue: boolean = false) => {
    const value = settings[key]?.value;
    if (value === undefined) return defaultValue;
    return value === 'true';
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSetting,
    getSetting,
    getBooleanSetting
  };
}
