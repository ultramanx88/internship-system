'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, FileText, Eye, CheckCircle2, XCircle } from 'lucide-react';

interface CommitteeWorkflowStatusProps {
  applicationId: string;
  onStatusChange?: (status: any) => void;
}

interface CommitteeWorkflowStatusData {
  currentStep: 'application_received' | 'committee_reviewed' | 'completed';
  committeeReceived: boolean;
  committeeReviewed: boolean;
  isCompleted: boolean;
}

const steps = [
  {
    id: 'application_received',
    title: 'รับคำขอ',
    description: 'กรรมการรับคำขอหลังจากอาจารย์ประจำวิชาอนุมัติ',
    icon: FileText,
    color: 'bg-blue-500'
  },
  {
    id: 'committee_reviewed',
    title: 'พิจารณา',
    description: 'กรรมการตรวจดูและอนุมัติ/ไม่อนุมัติ',
    icon: Eye,
    color: 'bg-yellow-500'
  },
  {
    id: 'completed',
    title: 'เสร็จสิ้น',
    description: 'Committee Workflow เสร็จสิ้น',
    icon: CheckCircle,
    color: 'bg-green-600'
  }
];

export default function CommitteeWorkflowStatus({ applicationId, onStatusChange }: CommitteeWorkflowStatusProps) {
  const [workflowStatus, setWorkflowStatus] = useState<CommitteeWorkflowStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkflowStatus();
  }, [applicationId]);

  const fetchWorkflowStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/committee/workflow?action=status&applicationId=${applicationId}`);
      const data = await response.json();

      if (data.success) {
        setWorkflowStatus(data.workflowStatus);
        onStatusChange?.(data.workflowStatus);
      } else {
        setError(data.error || 'ไม่สามารถดึงข้อมูลสถานะได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
      console.error('Error fetching workflow status:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepId: string) => {
    if (!workflowStatus) return 'pending';

    if (stepId === 'application_received') {
      return workflowStatus.committeeReceived ? 'completed' : 'current';
    }

    if (stepId === 'committee_reviewed') {
      if (workflowStatus.committeeReceived && !workflowStatus.committeeReviewed) {
        return 'current';
      }
      if (workflowStatus.committeeReviewed) {
        return 'completed';
      }
      return 'pending';
    }

    if (stepId === 'completed') {
      return workflowStatus.isCompleted ? 'completed' : 'pending';
    }

    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'current':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">เสร็จสิ้น</Badge>;
      case 'current':
        return <Badge className="bg-yellow-100 text-yellow-800">กำลังดำเนินการ</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">รอดำเนินการ</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>สถานะ Committee Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>สถานะ Committee Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>สถานะ Committee Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const StepIcon = step.icon;
            const isCurrentStep = status === 'current';
            const isCompleted = status === 'completed';
            
            return (
              <div key={step.id} className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-100' :
                  isCurrentStep ? 'bg-yellow-100' :
                  'bg-gray-100'
                }`}>
                  <StepIcon className={`h-5 w-5 ${
                    isCompleted ? 'text-green-500' :
                    isCurrentStep ? 'text-yellow-500' :
                    'text-gray-400'
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      {step.title}
                    </h4>
                    {getStatusIcon(status)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {step.description}
                  </p>
                  <div className="mt-2">
                    {getStatusBadge(status)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* สถานะโดยรวม */}
        {workflowStatus && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">สถานะโดยรวม</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">รับคำขอ:</span>
                <span className={`ml-2 ${
                  workflowStatus.committeeReceived ? 'text-green-600' : 'text-red-600'
                }`}>
                  {workflowStatus.committeeReceived ? 'รับแล้ว' : 'ยังไม่รับ'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">พิจารณา:</span>
                <span className={`ml-2 ${
                  workflowStatus.committeeReviewed ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {workflowStatus.committeeReviewed ? 'พิจารณาแล้ว' : 'รอพิจารณา'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">สถานะสุดท้าย:</span>
                <span className={`ml-2 ${
                  workflowStatus.isCompleted ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {workflowStatus.isCompleted ? 'เสร็จสิ้น' : 'กำลังดำเนินการ'}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
