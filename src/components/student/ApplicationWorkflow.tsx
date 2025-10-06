'use client';

import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending' | 'rejected';
  completedAt?: string;
  rejectedReason?: string;
}

interface ApplicationWorkflowProps {
  applicationId: string;
  currentStatus: string;
  committeeApprovals?: Array<{
    committeeId: string;
    committeeName: string;
    approvedAt: string;
    status: 'approved' | 'rejected';
    reason?: string;
  }>;
  requiredApprovals: number;
}

export function ApplicationWorkflow({ 
  applicationId, 
  currentStatus, 
  committeeApprovals = [],
  requiredApprovals = 2 
}: ApplicationWorkflowProps) {
  
  const getWorkflowSteps = (): WorkflowStep[] => {
    const steps: WorkflowStep[] = [
      {
        id: 'submitted',
        title: 'ส่งคำขอ',
        description: 'ส่งคำขอสหกิจศึกษา',
        status: 'completed'
      },
      {
        id: 'instructor_review',
        title: 'อาจารย์ประจำวิชาพิจารณา',
        description: 'รอการพิจารณาจากอาจารย์ประจำวิชา',
        status: currentStatus === 'instructor_approved' || currentStatus === 'committee_review' || currentStatus === 'approved' ? 'completed' : 
                currentStatus === 'instructor_rejected' ? 'rejected' : 'current'
      },
      {
        id: 'committee_review',
        title: 'กรรมการพิจารณา',
        description: `รอการพิจารณาจากกรรมการ (${committeeApprovals.filter(a => a.status === 'approved').length}/${requiredApprovals})`,
        status: currentStatus === 'approved' ? 'completed' : 
                currentStatus === 'committee_rejected' ? 'rejected' :
                currentStatus === 'committee_review' ? 'current' : 'pending'
      },
      {
        id: 'approved',
        title: 'อนุมัติแล้ว',
        description: 'คำขอได้รับการอนุมัติเรียบร้อย',
        status: currentStatus === 'approved' ? 'completed' : 'pending'
      }
    ];

    return steps;
  };

  const steps = getWorkflowSteps();

  const getStepIcon = (step: WorkflowStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'current':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepBadge = (step: WorkflowStep) => {
    switch (step.status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">เสร็จสิ้น</Badge>;
      case 'current':
        return <Badge className="bg-blue-100 text-blue-700">กำลังดำเนินการ</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">ปฏิเสธ</Badge>;
      case 'pending':
        return <Badge variant="outline">รอคิว</Badge>;
      default:
        return <Badge variant="outline">รอคิว</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">สถานะการดำเนินการ</h3>
        <p className="text-sm text-gray-600">ติดตามความคืบหน้าของคำขอสหกิจศึกษา</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {getStepIcon(step)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">{step.title}</h4>
                {getStepBadge(step)}
              </div>
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
              
              {step.status === 'completed' && step.completedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  เสร็จสิ้นเมื่อ: {new Date(step.completedAt).toLocaleDateString('th-TH')}
                </p>
              )}
              
              {step.status === 'rejected' && step.rejectedReason && (
                <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                  <p className="text-red-800 font-medium">เหตุผล:</p>
                  <p className="text-red-700">{step.rejectedReason}</p>
                </div>
              )}

              {/* Committee Approval Details */}
              {step.id === 'committee_review' && committeeApprovals.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-gray-700">กรรมการที่พิจารณาแล้ว:</p>
                  {committeeApprovals.map((approval, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className={`w-2 h-2 rounded-full ${
                        approval.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-gray-600">{approval.committeeName}</span>
                      <span className="text-gray-500">
                        ({new Date(approval.approvedAt).toLocaleDateString('th-TH')})
                      </span>
                      {approval.reason && (
                        <span className="text-red-600">- {approval.reason}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className="absolute left-6 mt-6 w-0.5 h-8 bg-gray-200" />
            )}
          </div>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">ความคืบหน้า</span>
          <span className="text-sm text-gray-600">
            {steps.filter(s => s.status === 'completed').length} / {steps.length} ขั้นตอน
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}
