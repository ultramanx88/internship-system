'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Lock, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { 
  WorkflowStep as WorkflowStepType, 
  WorkflowUtils 
} from '@/lib/student-application-workflow';

interface WorkflowStepProps {
  step: WorkflowStepType;
  isActive?: boolean;
  showProgress?: boolean;
  onStepClick?: (step: WorkflowStepType) => void;
  className?: string;
}

export function WorkflowStep({ 
  step, 
  isActive = false, 
  showProgress = false,
  onStepClick,
  className = '' 
}: WorkflowStepProps) {
  const language = WorkflowUtils.detectLanguage();

  const getStatusIcon = () => {
    switch (step.status) {
      case 'completed':
        return <Check className="h-5 w-5 text-green-600" />;
      case 'current':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'locked':
        return <Lock className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = () => {
    const statusMap = {
      completed: { variant: 'default' as const, text: 'เสร็จสิ้น' },
      current: { variant: 'secondary' as const, text: 'ปัจจุบัน' },
      pending: { variant: 'outline' as const, text: 'รอดำเนินการ' },
      locked: { variant: 'destructive' as const, text: 'ล็อค' }
    };

    const status = statusMap[step.status] || statusMap.pending;
    
    return (
      <Badge variant={status.variant} className="ml-2">
        {status.text}
      </Badge>
    );
  };

  const getStepClass = () => {
    const baseClass = 'transition-all duration-200';
    
    if (isActive) {
      return `${baseClass} ring-2 ring-blue-500 ring-offset-2`;
    }
    
    if (step.status === 'locked') {
      return `${baseClass} opacity-60 cursor-not-allowed`;
    }
    
    return `${baseClass} hover:shadow-md cursor-pointer`;
  };

  const handleClick = () => {
    if (step.status === 'locked' || !step.canProceed) {
      return;
    }
    
    if (onStepClick) {
      onStepClick(step);
    }
  };

  return (
    <Card 
      className={`${getStepClass()} ${className}`}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              step.status === 'completed' ? 'bg-green-100' :
              step.status === 'current' ? 'bg-blue-100' :
              step.status === 'locked' ? 'bg-gray-100' :
              'bg-yellow-100'
            }`}>
              {getStatusIcon()}
            </div>
            <div>
              <CardTitle className="text-lg">
                {language === 'en' ? step.titleEn : step.title}
                {getStatusBadge()}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'en' ? step.descriptionEn : step.description}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {WorkflowUtils.hasStepAlert(step) && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-amber-800">
                {WorkflowUtils.getStepAlertMessage(step, language)}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step.dependencies.length > 0 && (
              <div className="text-xs text-muted-foreground">
                ต้องมี: {step.dependencies.join(', ')}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {step.status === 'completed' && (
              <Link href={step.route}>
                <Button variant="outline" size="sm">
                  {WorkflowUtils.getLocalizedMessage('edit', language)}
                </Button>
              </Link>
            )}
            {step.status === 'current' && step.canProceed && (
              <Link href={step.route}>
                <Button size="sm">
                  {WorkflowUtils.getLocalizedMessage('proceed', language)}
                </Button>
              </Link>
            )}
            {step.status === 'locked' && (
              <Button variant="outline" size="sm" disabled>
                {WorkflowUtils.getLocalizedMessage('stepLocked', language)}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
