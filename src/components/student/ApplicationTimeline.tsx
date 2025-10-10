'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, User, Calendar, Users } from 'lucide-react';

interface ApplicationTimelineProps {
  application: {
    id: string;
    status: string;
    dateApplied: string;
    courseInstructorApprovedAt?: string;
    courseInstructorRejectedAt?: string;
    courseInstructorRejectionNote?: string;
    supervisorAssignedAt?: string;
    supervisorAppointmentDate?: string;
    committeeApprovedAt?: string;
    courseInstructor?: {
      name: string;
    };
    supervisor?: {
      name: string;
    };
  };
}

const statusSteps = [
  {
    key: 'submitted',
    title: 'ส่งคำขอ',
    icon: Clock,
    description: 'นักศึกษาส่งคำขอฝึกงาน/สหกิจ'
  },
  {
    key: 'course_instructor_review',
    title: 'อาจารย์ประจำวิชา',
    icon: User,
    description: 'อาจารย์ประจำวิชาพิจารณาคำขอ'
  },
  {
    key: 'supervisor_assignment',
    title: 'อาจารย์นิเทศก์',
    icon: Calendar,
    description: 'มอบหมายและนัดหมายอาจารย์นิเทศก์'
  },
  {
    key: 'committee_review',
    title: 'กรรมการ',
    icon: Users,
    description: 'กรรมการพิจารณาคำขอ'
  },
  {
    key: 'approved',
    title: 'อนุมัติ',
    icon: CheckCircle,
    description: 'คำขอได้รับการอนุมัติ'
  }
];

export default function ApplicationTimeline({ application }: ApplicationTimelineProps) {
  const getStepStatus = (stepKey: string) => {
    switch (stepKey) {
      case 'submitted':
        return 'completed';
      
      case 'course_instructor_review':
        if (application.courseInstructorRejectedAt) return 'rejected';
        if (application.courseInstructorApprovedAt) return 'completed';
        if (['course_instructor_pending', 'course_instructor_approved', 'course_instructor_rejected'].includes(application.status)) {
          return 'current';
        }
        return 'pending';
      
      case 'supervisor_assignment':
        if (application.supervisorAssignedAt) return 'completed';
        if (['assigned_supervisor', 'supervisor_assignment_pending'].includes(application.status)) {
          return 'current';
        }
        return 'pending';
      
      case 'committee_review':
        if (application.committeeApprovedAt) return 'completed';
        if (['assigned_committee', 'committee_approved'].includes(application.status)) {
          return 'current';
        }
        return 'pending';
      
      case 'approved':
        if (application.status === 'approved') return 'completed';
        if (application.status === 'rejected') return 'rejected';
        return 'pending';
      
      default:
        return 'pending';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">เสร็จสิ้น</Badge>;
      case 'current':
        return <Badge className="bg-blue-100 text-blue-800">กำลังดำเนินการ</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">ไม่อนุมัติ</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">รอดำเนินการ</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-amber-700">
          Timeline การอนุมัติคำขอ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusSteps.map((step, index) => {
            const stepStatus = getStepStatus(step.key);
            const Icon = step.icon;
            
            return (
              <div key={step.key} className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  stepStatus === 'completed' ? 'bg-green-500 text-white' :
                  stepStatus === 'current' ? 'bg-blue-500 text-white' :
                  stepStatus === 'rejected' ? 'bg-red-500 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-medium ${
                      stepStatus === 'completed' ? 'text-green-800' :
                      stepStatus === 'current' ? 'text-blue-800' :
                      stepStatus === 'rejected' ? 'text-red-800' :
                      'text-gray-600'
                    }`}>
                      {step.title}
                    </h4>
                    {getStatusBadge(stepStatus)}
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {step.description}
                  </p>
                  
                  {/* แสดงวันที่และรายละเอียดเพิ่มเติม */}
                  {step.key === 'course_instructor_review' && application.courseInstructorApprovedAt && (
                    <p className="text-xs text-green-600 mt-1">
                      อนุมัติเมื่อ: {formatDate(application.courseInstructorApprovedAt)}
                      {application.courseInstructor && ` โดย ${application.courseInstructor.name}`}
                    </p>
                  )}
                  
                  {step.key === 'course_instructor_review' && application.courseInstructorRejectedAt && (
                    <div className="text-xs text-red-600 mt-1">
                      <p>ไม่อนุมัติเมื่อ: {formatDate(application.courseInstructorRejectedAt)}</p>
                      {application.courseInstructorRejectionNote && (
                        <p className="mt-1 p-2 bg-red-50 rounded border">
                          เหตุผล: {application.courseInstructorRejectionNote}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {step.key === 'supervisor_assignment' && application.supervisorAssignedAt && (
                    <p className="text-xs text-green-600 mt-1">
                      มอบหมายเมื่อ: {formatDate(application.supervisorAssignedAt)}
                      {application.supervisor && ` ให้ ${application.supervisor.name}`}
                    </p>
                  )}
                  
                  {step.key === 'supervisor_assignment' && application.supervisorAppointmentDate && (
                    <p className="text-xs text-blue-600 mt-1">
                      นัดหมายเมื่อ: {formatDate(application.supervisorAppointmentDate)}
                    </p>
                  )}
                  
                  {step.key === 'committee_review' && application.committeeApprovedAt && (
                    <p className="text-xs text-green-600 mt-1">
                      อนุมัติเมื่อ: {formatDate(application.committeeApprovedAt)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
