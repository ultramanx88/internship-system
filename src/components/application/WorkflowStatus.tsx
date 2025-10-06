'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle, User, Users, FileText } from 'lucide-react';

interface WorkflowStatusProps {
  applicationId: string;
  onStatusChange?: (status: any) => void;
}

interface WorkflowStatusData {
  currentStep: 'submitted' | 'course_instructor_review' | 'supervisor_assignment' | 'committee_review' | 'completed' | 'rejected';
  courseInstructorStatus: 'pending' | 'approved' | 'rejected';
  supervisorStatus: 'pending' | 'assigned' | 'completed';
  committeeStatus: 'pending' | 'approved' | 'rejected';
  isCompleted: boolean;
  isRejected: boolean;
}

const steps = [
  {
    id: 'submitted',
    title: 'ส่งคำขอ',
    description: 'นักศึกษาส่งคำขอฝึกงาน',
    icon: FileText,
    color: 'bg-blue-500'
  },
  {
    id: 'course_instructor_review',
    title: 'อาจารย์ประจำวิชาพิจารณา',
    description: 'อาจารย์ประจำวิชาตรวจสอบและพิจารณา',
    icon: User,
    color: 'bg-yellow-500'
  },
  {
    id: 'supervisor_assignment',
    title: 'กำหนดอาจารย์นิเทศ',
    description: 'ระบบกำหนดอาจารย์นิเทศให้',
    icon: User,
    color: 'bg-purple-500'
  },
  {
    id: 'committee_review',
    title: 'กรรมการพิจารณา',
    description: 'กรรมการพิจารณาและอนุมัติ',
    icon: Users,
    color: 'bg-orange-500'
  },
  {
    id: 'completed',
    title: 'เสร็จสิ้น',
    description: 'คำขอได้รับการอนุมัติเรียบร้อย',
    icon: CheckCircle,
    color: 'bg-green-500'
  },
  {
    id: 'rejected',
    title: 'ถูกปฏิเสธ',
    description: 'คำขอถูกปฏิเสธ',
    icon: XCircle,
    color: 'bg-red-500'
  }
];

export default function WorkflowStatus({ applicationId, onStatusChange }: WorkflowStatusProps) {
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkflowStatus();
  }, [applicationId]);

  const fetchWorkflowStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/applications/${applicationId}/workflow`);
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

    if (stepId === 'submitted') {
      return 'completed';
    }

    if (stepId === 'course_instructor_review') {
      if (workflowStatus.courseInstructorStatus === 'approved') return 'completed';
      if (workflowStatus.courseInstructorStatus === 'rejected') return 'rejected';
      return workflowStatus.currentStep === 'course_instructor_review' ? 'current' : 'pending';
    }

    if (stepId === 'supervisor_assignment') {
      if (workflowStatus.supervisorStatus === 'assigned' || workflowStatus.supervisorStatus === 'completed') return 'completed';
      return workflowStatus.currentStep === 'supervisor_assignment' ? 'current' : 'pending';
    }

    if (stepId === 'committee_review') {
      if (workflowStatus.committeeStatus === 'approved') return 'completed';
      if (workflowStatus.committeeStatus === 'rejected') return 'rejected';
      return workflowStatus.currentStep === 'committee_review' ? 'current' : 'pending';
    }

    if (stepId === 'completed') {
      return workflowStatus.isCompleted ? 'completed' : 'pending';
    }

    if (stepId === 'rejected') {
      return workflowStatus.isRejected ? 'rejected' : 'pending';
    }

    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
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
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">ถูกปฏิเสธ</Badge>;
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
          <CardTitle>สถานะการดำเนินงาน</CardTitle>
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
          <CardTitle>สถานะการดำเนินงาน</CardTitle>
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
        <CardTitle>สถานะการดำเนินงาน</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const StepIcon = step.icon;
            
            return (
              <div key={step.id} className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  status === 'completed' ? 'bg-green-100' :
                  status === 'rejected' ? 'bg-red-100' :
                  status === 'current' ? 'bg-yellow-100' :
                  'bg-gray-100'
                }`}>
                  <StepIcon className={`h-5 w-5 ${
                    status === 'completed' ? 'text-green-500' :
                    status === 'rejected' ? 'text-red-500' :
                    status === 'current' ? 'text-yellow-500' :
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
                <span className="text-gray-500">อาจารย์ประจำวิชา:</span>
                <span className={`ml-2 ${
                  workflowStatus.courseInstructorStatus === 'approved' ? 'text-green-600' :
                  workflowStatus.courseInstructorStatus === 'rejected' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {workflowStatus.courseInstructorStatus === 'approved' ? 'อนุมัติ' :
                   workflowStatus.courseInstructorStatus === 'rejected' ? 'ปฏิเสธ' :
                   'รอพิจารณา'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">อาจารย์นิเทศ:</span>
                <span className={`ml-2 ${
                  workflowStatus.supervisorStatus === 'assigned' || workflowStatus.supervisorStatus === 'completed' ? 'text-green-600' :
                  'text-yellow-600'
                }`}>
                  {workflowStatus.supervisorStatus === 'assigned' ? 'กำหนดแล้ว' :
                   workflowStatus.supervisorStatus === 'completed' ? 'เสร็จสิ้น' :
                   'รอกำหนด'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">กรรมการ:</span>
                <span className={`ml-2 ${
                  workflowStatus.committeeStatus === 'approved' ? 'text-green-600' :
                  workflowStatus.committeeStatus === 'rejected' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {workflowStatus.committeeStatus === 'approved' ? 'อนุมัติ' :
                   workflowStatus.committeeStatus === 'rejected' ? 'ปฏิเสธ' :
                   'รอพิจารณา'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">สถานะสุดท้าย:</span>
                <span className={`ml-2 ${
                  workflowStatus.isCompleted ? 'text-green-600' :
                  workflowStatus.isRejected ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {workflowStatus.isCompleted ? 'เสร็จสิ้น' :
                   workflowStatus.isRejected ? 'ถูกปฏิเสธ' :
                   'กำลังดำเนินการ'}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
