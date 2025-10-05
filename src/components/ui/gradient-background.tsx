import React from 'react';
import { cn } from '@/lib/utils';

interface GradientBackgroundProps {
  variant?: 'login' | 'dashboard' | 'internship' | 'default';
  className?: string;
  children?: React.ReactNode;
  backgroundUrl?: string; // optional override for background image
}

export function GradientBackground({ 
  variant = 'default', 
  className,
  children,
  backgroundUrl
}: GradientBackgroundProps) {
  return (
    <div 
      className={cn(
        'relative overflow-hidden',
        className
      )}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundUrl || '/assets/images/Background.webp'})`
        }}
      />
      
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(137deg, rgba(216, 153, 103, 0.8) 16.63%, rgba(150, 96, 51, 0.8) 37.95%, rgba(65, 38, 16, 0.8) 88.14%)'
        }}
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}