'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { 
  WorkflowStep, 
  WorkflowManager, 
  WorkflowUtils 
} from '@/lib/student-application-workflow';

interface WorkflowTimelineProps {
  steps: WorkflowStep[];
  currentStep: number;
  onStepClick?: (step: WorkflowStep) => void;
  className?: string;
  language?: 'th' | 'en';
}

export function WorkflowTimeline({ 
  steps, 
  currentStep, 
  onStepClick,
  className = '',
  language = 'th'
}: WorkflowTimelineProps) {
  // ใช้ language prop หรือ detect จาก browser
  const currentLanguage = language || WorkflowUtils.detectLanguage();

  const getStepIcon = (step: WorkflowStep) => {
    if (step.status === 'completed') {
      return <Check className="h-4 w-4" />;
    }
    if (step.status === 'locked') {
      return <Lock className="h-4 w-4" />;
    }
    return <span className="text-sm font-bold">{step.id}</span>;
  };

  const getStepColor = (step: WorkflowStep) => {
    switch (step.status) {
      case 'completed':
        return 'bg-green-600 text-white';
      case 'current':
        return 'bg-blue-600 text-white';
      case 'locked':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-yellow-500 text-white';
    }
  };

  const getStepClass = (step: WorkflowStep) => {
    const baseClass = 'flex items-center justify-between rounded-xl px-4 py-5 mb-4 border';
    
    if (step.status === 'locked') {
      return `${baseClass} bg-gray-100 cursor-not-allowed`;
    }
    
    return `${baseClass} bg-white hover:bg-gray-50 cursor-pointer transition-colors`;
  };

  const handleStepClick = (step: WorkflowStep) => {
    if (step.status === 'locked' || !step.canProceed) {
      return;
    }
    
    if (onStepClick) {
      onStepClick(step);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={getStepClass(step)}
          onClick={() => handleStepClick(step)}
        >
          <div className="flex items-center gap-4">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getStepColor(step)}`}>
              {getStepIcon(step)}
            </div>
            <div className="flex-1">
              <div className="text-lg font-medium">
                {currentLanguage === 'en' ? step.titleEn : step.title}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {currentLanguage === 'en' ? step.descriptionEn : step.description}
              </div>
              {WorkflowUtils.hasStepAlert(step) && (
                <div className="text-sm text-amber-600 mt-1">
                  {WorkflowUtils.getStepAlertMessage(step, currentLanguage)}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {step.status === 'completed' && (
              <Link href={step.route}>
                <Button variant="outline" size="sm">
                  {WorkflowUtils.getLocalizedMessage('edit', currentLanguage)}
                </Button>
              </Link>
            )}
            {step.status === 'current' && step.canProceed && (
              <Link href={step.route}>
                <Button size="sm">
                  {WorkflowUtils.getLocalizedMessage('proceed', currentLanguage)}
                </Button>
              </Link>
            )}
            {step.status === 'locked' && (
              <Button variant="outline" size="sm" disabled>
                {WorkflowUtils.getLocalizedMessage('stepLocked', currentLanguage)}
              </Button>
            )}
            {index < steps.length - 1 && (
              <ArrowRight className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
