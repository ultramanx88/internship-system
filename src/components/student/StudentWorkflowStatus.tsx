'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  User, 
  FileText, 
  Eye,
  Edit
} from 'lucide-react';
import Link from 'next/link';

interface StudentWorkflowStatusProps {
  studentId: string;
  applicationId?: string;
  onStatusChange?: (status: any) => void;
}

interface StudentWorkflowStatusData {
  currentStep: 'profile_incomplete' | 'profile_complete' | 'application_submitted' | 'staff_reviewed' | 'completed';
  profileComplete: boolean;
  applicationSubmitted: boolean;
  staffReviewed: boolean;
  canSubmitApplication: boolean;
  isCompleted: boolean;
}

const steps = [
  {
    id: 'profile_incomplete',
    title: 'กรอกรายละเอียด',
    description: 'กรอกรายละเอียดส่วนตัวให้ครบถ้วน',
    icon: User,
    color: 'bg-blue-500',
    actionText: 'ไปกรอกข้อมูล',
    actionLink: '/student/settings'
  },
  {
    id: 'profile_complete',
    title: 'ข้อมูลครบถ้วน',
    description: 'ข้อมูลส่วนตัวครบถ้วน และส่งคำขอฝึกงานเรียบร้อย',
    icon: CheckCircle,
    color: 'bg-green-500',
    actionText: 'ดูคำขอ',
    actionLink: '/student/applications'
  },
  {
    id: 'application_submitted',
    title: 'ส่งคำขอแล้ว',
    description: 'ส่งคำขอฝึกงานเรียบร้อย รอ Staff ตรวจสอบ',
    icon: FileText,
    color: 'bg-yellow-500',
    actionText: 'ดูรายละเอียด',
    actionLink: '/student/applications'
  },
  {
    id: 'staff_reviewed',
    title: 'Staff ตรวจแล้ว',
    description: 'Staff ตรวจเอกสารและยืนยันเรียบร้อย',
    icon: Eye,
    color: 'bg-purple-500',
    actionText: 'ดูผลลัพธ์',
    actionLink: '/student/applications'
  },
  {
    id: 'completed',
    title: 'เสร็จสิ้น',
    description: 'กระบวนการขอฝึกงานเสร็จสิ้น',
    icon: CheckCircle,
    color: 'bg-green-600',
    actionText: 'ดูรายละเอียด',
    actionLink: '/student/applications'
  }
];

export default function StudentWorkflowStatus({ 
  studentId, 
  applicationId, 
  onStatusChange 
}: StudentWorkflowStatusProps) {
  const [workflowStatus, setWorkflowStatus] = useState<StudentWorkflowStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (applicationId) {
      fetchWorkflowStatus();
    } else {
      checkEligibility();
    }
  }, [applicationId, studentId]);

  const checkEligibility = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/student/workflow?action=eligibility&studentId=${studentId}`);
      const data = await response.json();

      if (data.success) {
        const mockStatus: StudentWorkflowStatusData = {
          currentStep: data.profileComplete ? 'profile_complete' : 'profile_incomplete',
          profileComplete: data.profileComplete,
          applicationSubmitted: false,
          staffReviewed: false,
          canSubmitApplication: data.canSubmitApplication,
          isCompleted: false
        };
        setWorkflowStatus(mockStatus);
        onStatusChange?.(mockStatus);
      } else {
        setError(data.error || 'ไม่สามารถตรวจสอบสิทธิ์ได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์');
      console.error('Error checking eligibility:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflowStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/student/workflow?action=status&applicationId=${applicationId}`);
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

    if (stepId === 'profile_incomplete') {
      return workflowStatus.profileComplete ? 'completed' : 'current';
    }

    if (stepId === 'profile_complete') {
      if (workflowStatus.profileComplete && !workflowStatus.applicationSubmitted) {
        return 'current';
      }
      if (workflowStatus.applicationSubmitted && !workflowStatus.staffReviewed) {
        return 'current'; // แสดงขั้นตอนที่ 2 เป็น active เมื่อส่งคำขอแล้ว
      }
      if (workflowStatus.staffReviewed) {
        return 'completed';
      }
      return 'pending';
    }

    if (stepId === 'application_submitted') {
      if (workflowStatus.applicationSubmitted && !workflowStatus.staffReviewed) {
        return 'completed'; // แสดงขั้นตอนที่ 3 เป็น completed เมื่อส่งคำขอแล้ว
      }
      if (workflowStatus.staffReviewed) {
        return 'completed';
      }
      return 'pending';
    }

    if (stepId === 'staff_reviewed') {
      if (workflowStatus.staffReviewed) {
        return 'current';
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
          <CardTitle>สถานะการขอฝึกงาน</CardTitle>
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
          <CardTitle>สถานะการขอฝึกงาน</CardTitle>
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
        <CardTitle>สถานะการขอฝึกงาน</CardTitle>
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
                  <div className="mt-2 flex items-center space-x-2">
                    {getStatusBadge(status)}
                    {isCurrentStep && (
                      <Link href={step.actionLink}>
                        <Button size="sm" variant="outline">
                          {step.actionText}
                        </Button>
                      </Link>
                    )}
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
                <span className="text-gray-500">ข้อมูลส่วนตัว:</span>
                <span className={`ml-2 ${
                  workflowStatus.profileComplete ? 'text-green-600' : 'text-red-600'
                }`}>
                  {workflowStatus.profileComplete ? 'ครบถ้วน' : 'ไม่ครบถ้วน'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">คำขอฝึกงาน:</span>
                <span className={`ml-2 ${
                  workflowStatus.applicationSubmitted ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {workflowStatus.applicationSubmitted ? 'ส่งแล้ว' : 'ยังไม่ส่ง'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Staff ตรวจสอบ:</span>
                <span className={`ml-2 ${
                  workflowStatus.staffReviewed ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {workflowStatus.staffReviewed ? 'ตรวจแล้ว' : 'รอตรวจสอบ'}
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
