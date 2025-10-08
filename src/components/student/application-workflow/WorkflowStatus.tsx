'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Lock } from 'lucide-react';
import { 
  WorkflowState, 
  WorkflowUtils 
} from '@/lib/student-application-workflow';

interface WorkflowStatusProps {
  state: WorkflowState;
  totalSteps: number;
  className?: string;
  language?: 'th' | 'en';
}

export function WorkflowStatus({ 
  state, 
  totalSteps, 
  className = '',
  language = 'th'
}: WorkflowStatusProps) {
  // ใช้ language prop หรือ detect จาก browser
  const currentLanguage = language || WorkflowUtils.detectLanguage();
  
  const progressPercentage = WorkflowUtils.calculateProgress(
    state.completedSteps.length, 
    totalSteps
  );

  const getStatusIcon = () => {
    if (state.completedSteps.length === totalSteps) {
      return <CheckCircle className="h-6 w-6 text-green-600" />;
    }
    if (state.canProceed) {
      return <Clock className="h-6 w-6 text-blue-600" />;
    }
    if (state.lockedSteps.length > 0) {
      return <Lock className="h-6 w-6 text-gray-400" />;
    }
    return <AlertCircle className="h-6 w-6 text-yellow-600" />;
  };

  const getStatusText = () => {
    if (state.completedSteps.length === totalSteps) {
      return currentLanguage === 'en' ? 'All steps completed' : 'เสร็จสิ้นทุกขั้นตอนแล้ว';
    }
    if (state.canProceed) {
      return currentLanguage === 'en' ? 'Ready to proceed' : 'พร้อมดำเนินการ';
    }
    if (state.lockedSteps.length > 0) {
      return currentLanguage === 'en' ? 'Some steps are locked' : 'มีขั้นตอนที่ยังล็อคอยู่';
    }
    return currentLanguage === 'en' ? 'In progress' : 'กำลังดำเนินการ';
  };

  const getStatusColor = () => {
    if (state.completedSteps.length === totalSteps) {
      return 'text-green-600';
    }
    if (state.canProceed) {
      return 'text-blue-600';
    }
    if (state.lockedSteps.length > 0) {
      return 'text-gray-500';
    }
    return 'text-yellow-600';
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
        <CardTitle className="text-lg">
          {currentLanguage === 'en' ? 'Workflow Status' : 'สถานะการทำงาน'}
        </CardTitle>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {currentLanguage === 'en' ? 'Progress' : 'ความคืบหน้า'}
              </span>
              <span className="font-medium">
                {state.completedSteps.length} / {totalSteps}
              </span>
            </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="text-right text-xs text-muted-foreground">
            {progressPercentage}%
          </div>
        </div>

        {/* Step Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">
                {currentLanguage === 'en' ? 'Completed' : 'เสร็จสิ้น'}
              </span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {state.completedSteps.length}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium">
                {currentLanguage === 'en' ? 'Locked' : 'ล็อค'}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-400">
              {state.lockedSteps.length}
            </div>
          </div>
        </div>

        {/* Current Step Info */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {currentLanguage === 'en' ? 'Current Step' : 'ขั้นตอนปัจจุบัน'}
            </span>
            <Badge variant="secondary">
              {currentLanguage === 'en' ? 'Step' : 'ขั้นตอน'} {state.currentStep}
            </Badge>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground">
          {currentLanguage === 'en' ? 'Last updated' : 'อัปเดตล่าสุด'}: {' '}
          {WorkflowUtils.getTimeAgo(state.lastUpdated, currentLanguage)}
        </div>
      </CardContent>
    </Card>
  );
}
