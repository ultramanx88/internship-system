'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Home, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  WorkflowStep, 
  WorkflowNavigation as WorkflowNavigationClass,
  WorkflowUtils 
} from '@/lib/student-application-workflow';

interface WorkflowNavigationProps {
  currentStep: number;
  totalSteps: number;
  canGoBack?: boolean;
  canGoForward?: boolean;
  onBack?: () => void;
  onForward?: () => void;
  onHome?: () => void;
  onRefresh?: () => void;
  className?: string;
}

export function WorkflowNavigation({ 
  currentStep, 
  totalSteps,
  canGoBack = true,
  canGoForward = true,
  onBack,
  onForward,
  onHome,
  onRefresh,
  className = '' 
}: WorkflowNavigationProps) {
  const router = useRouter();
  const language = WorkflowUtils.detectLanguage();

  const isFirstStep = WorkflowNavigationClass.isFirstStep(currentStep);
  const isLastStep = WorkflowNavigationClass.isLastStep(currentStep);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      const previousStep = WorkflowNavigationClass.getPreviousAllowedStep(currentStep);
      if (previousStep) {
        const route = WorkflowNavigationClass.getStepRoute(previousStep);
        router.push(route);
      }
    }
  };

  const handleForward = () => {
    if (onForward) {
      onForward();
    } else {
      const nextStep = WorkflowNavigationClass.getNextAllowedStep(currentStep);
      if (nextStep) {
        const route = WorkflowNavigationClass.getStepRoute(nextStep);
        router.push(route);
      }
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      router.push('/student/application-form');
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      router.refresh();
    }
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Left Side - Back Button */}
      <div className="flex items-center gap-2">
        {!isFirstStep && (
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={!canGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {WorkflowUtils.getLocalizedMessage('back', language)}
          </Button>
        )}
        
        <Button
          variant="ghost"
          onClick={handleHome}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          {language === 'en' ? 'Home' : 'หน้าแรก'}
        </Button>
      </div>

      {/* Center - Step Indicator */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {language === 'en' ? 'Step' : 'ขั้นตอน'} {currentStep} {language === 'en' ? 'of' : 'จาก'} {totalSteps}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i + 1}
              className={`h-2 w-2 rounded-full ${
                i + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right Side - Forward Button and Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          {language === 'en' ? 'Refresh' : 'รีเฟรช'}
        </Button>
        
        {!isLastStep && (
          <Button
            onClick={handleForward}
            disabled={!canGoForward}
            className="flex items-center gap-2"
          >
            {WorkflowUtils.getLocalizedMessage('next', language)}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
