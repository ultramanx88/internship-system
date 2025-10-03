'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';

export function useProfileImage() {
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfileImage = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Try to get from API first with user ID
      const response = await fetch('/api/user/profile', {
        headers: {
          'x-user-id': user.id
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profileImage) {
          setProfileImage(data.profileImage);
          // Also save to localStorage for faster loading
          localStorage.setItem(`profile-image-${user.id}`, data.profileImage);
          return;
        }
      }
      
      // Fallback to localStorage
      const savedImage = localStorage.getItem(`profile-image-${user.id}`);
      if (savedImage) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
      // Fallback to localStorage
      const savedImage = localStorage.getItem(`profile-image-${user.id}`);
      if (savedImage) {
        setProfileImage(savedImage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileImage = async (newImageUrl: string) => {
    setProfileImage(newImageUrl);
    if (user?.id) {
      // Save to localStorage immediately
      localStorage.setItem(`profile-image-${user.id}`, newImageUrl);
      
      // Also save to API
      try {
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id
          },
          body: JSON.stringify({ profileImage: newImageUrl })
        });
        
        if (!response.ok) {
          console.warn('Failed to save profile image to API, but saved locally');
        }
      } catch (error) {
        console.error('Error saving profile image to API:', error);
      }
    }
  };

  const clearProfileImage = () => {
    setProfileImage(null);
    if (user?.id) {
      localStorage.removeItem(`profile-image-${user.id}`);
    }
  };

  useEffect(() => {
    loadProfileImage();
  }, [user?.id]);

  return {
    profileImage,
    isLoading,
    updateProfileImage,
    clearProfileImage,
    refreshProfileImage: loadProfileImage
  };
}