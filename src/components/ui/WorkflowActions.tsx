'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormDialog } from './FormDialog';
import { StatusBadge } from './StatusBadge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Send, 
  Eye, 
  FileText,
  UserCheck,
  Mail,
  Phone,
  Building2,
  Loader2
} from 'lucide-react';

export type WorkflowAction = 
  | 'receive_document'
  | 'review_document' 
  | 'approve_document'
  | 'reject_document'
  | 'send_to_company'
  | 'send_to_supervisor'
  | 'send_to_committee'
  | 'send_to_instructor'
  | 'assign_supervisor'
  | 'assign_advisor'
  | 'send_reminder'
  | 'request_feedback'
  | 'schedule_meeting'
  | 'generate_report'
  | 'archive_document';

export interface WorkflowActionConfig {
  key: WorkflowAction;
  label: string;
  description: string;
  icon: React.ReactNode;
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  color: string;
  requiresNotes?: boolean;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface WorkflowActionsProps {
  // Workflow state
  applicationId: string;
  currentStatus: string;
  userRole: string;
  
  // Available actions
  availableActions: WorkflowAction[];
  
  // Callbacks
  onActionComplete: (action: WorkflowAction, notes?: string) => Promise<void>;
  
  // UI customization
  className?: string;
  showStatus?: boolean;
  compact?: boolean;
  
  // Loading state
  isLoading?: boolean;
}

const workflowActionConfigs: Record<WorkflowAction, WorkflowActionConfig> = {
  receive_document: {
    key: 'receive_document',
    label: 'รับเอกสาร',
    description: 'ยืนยันการรับเอกสารจากนักศึกษา',
    icon: <FileText className="h-4 w-4" />,
    variant: 'default',
    color: 'bg-blue-600 hover:bg-blue-700',
    requiresNotes: false,
  },
  review_document: {
    key: 'review_document',
    label: 'ตรวจสอบเอกสาร',
    description: 'ตรวจสอบความถูกต้องของเอกสาร',
    icon: <Eye className="h-4 w-4" />,
    variant: 'default',
    color: 'bg-yellow-600 hover:bg-yellow-700',
    requiresNotes: true,
  },
  approve_document: {
    key: 'approve_document',
    label: 'อนุมัติเอกสาร',
    description: 'อนุมัติเอกสารให้ผ่าน',
    icon: <CheckCircle className="h-4 w-4" />,
    variant: 'default',
    color: 'bg-green-600 hover:bg-green-700',
    requiresNotes: false,
    requiresConfirmation: true,
    confirmationMessage: 'คุณแน่ใจหรือไม่ที่จะอนุมัติเอกสารนี้?',
  },
  reject_document: {
    key: 'reject_document',
    label: 'ปฏิเสธเอกสาร',
    description: 'ปฏิเสธเอกสารและส่งกลับให้นักศึกษาแก้ไข',
    icon: <XCircle className="h-4 w-4" />,
    variant: 'destructive',
    color: 'bg-red-600 hover:bg-red-700',
    requiresNotes: true,
    requiresConfirmation: true,
    confirmationMessage: 'คุณแน่ใจหรือไม่ที่จะปฏิเสธเอกสารนี้?',
  },
  send_to_company: {
    key: 'send_to_company',
    label: 'ส่งให้บริษัท',
    description: 'ส่งเอกสารให้บริษัทเพื่อพิจารณา',
    icon: <Building2 className="h-4 w-4" />,
    variant: 'default',
    color: 'bg-purple-600 hover:bg-purple-700',
    requiresNotes: false,
  },
  send_to_supervisor: {
    key: 'send_to_supervisor',
    label: 'ส่งให้ผู้ควบคุม',
    description: 'ส่งเอกสารให้ผู้ควบคุมงาน',
    icon: <UserCheck className="h-4 w-4" />,
    variant: 'default',
    color: 'bg-indigo-600 hover:bg-indigo-700',
    requiresNotes: false,
  },
  send_to_committee: {
    key: 'send_to_committee',
    label: 'ส่งให้คณะกรรมการ',
    description: 'ส่งเอกสารให้คณะกรรมการพิจารณา',
    icon: <UserCheck className="h-4 w-4" />,
    variant: 'default',
    color: 'bg-orange-600 hover:bg-orange-700',
    requiresNotes: false,
  },
  send_to_instructor: {
    key: 'send_to_instructor',
    label: 'ส่งให้อาจารย์',
    description: 'ส่งเอกสารให้อาจารย์ที่ปรึกษา',
    icon: <UserCheck className="h-4 w-4" />,
    variant: 'default',
    color: 'bg-teal-600 hover:bg-teal-700',
    requiresNotes: false,
  },
  assign_supervisor: {
    key: 'assign_supervisor',
    label: 'มอบหมายผู้ควบคุม',
    description: 'มอบหมายผู้ควบคุมงานให้กับนักศึกษา',
    icon: <UserCheck className="h-4 w-4" />,
    variant: 'default',
    color: 'bg-cyan-600 hover:bg-cyan-700',
    requiresNotes: true,
  },
  assign_advisor: {
    key: 'assign_advisor',
    label: 'มอบหมายที่ปรึกษา',
    description: 'มอบหมายอาจารย์ที่ปรึกษาให้กับนักศึกษา',
    icon: <UserCheck className="h-4 w-4" />,
    variant: 'default',
    color: 'bg-emerald-600 hover:bg-emerald-700',
    requiresNotes: true,
  },
  send_reminder: {
    key: 'send_reminder',
    label: 'ส่งการแจ้งเตือน',
    description: 'ส่งการแจ้งเตือนให้ผู้เกี่ยวข้อง',
    icon: <AlertCircle className="h-4 w-4" />,
    variant: 'outline',
    color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    requiresNotes: true,
  },
  request_feedback: {
    key: 'request_feedback',
    label: 'ขอความคิดเห็น',
    description: 'ขอความคิดเห็นจากผู้เกี่ยวข้อง',
    icon: <Mail className="h-4 w-4" />,
    variant: 'outline',
    color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    requiresNotes: true,
  },
  schedule_meeting: {
    key: 'schedule_meeting',
    label: 'นัดหมายประชุม',
    description: 'นัดหมายการประชุมกับผู้เกี่ยวข้อง',
    icon: <Clock className="h-4 w-4" />,
    variant: 'outline',
    color: 'bg-green-100 text-green-800 hover:bg-green-200',
    requiresNotes: true,
  },
  generate_report: {
    key: 'generate_report',
    label: 'สร้างรายงาน',
    description: 'สร้างรายงานสรุปผลการดำเนินงาน',
    icon: <FileText className="h-4 w-4" />,
    variant: 'outline',
    color: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    requiresNotes: false,
  },
  archive_document: {
    key: 'archive_document',
    label: 'เก็บเอกสาร',
    description: 'เก็บเอกสารเข้าสถานะเสร็จสิ้น',
    icon: <FileText className="h-4 w-4" />,
    variant: 'outline',
    color: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    requiresNotes: false,
  },
};

const statusLabels: Record<string, string> = {
  'pending': 'รอดำเนินการ',
  'received': 'รับเอกสารแล้ว',
  'under_review': 'กำลังตรวจสอบ',
  'approved': 'อนุมัติแล้ว',
  'rejected': 'ปฏิเสธ',
  'sent_to_company': 'ส่งให้บริษัทแล้ว',
  'sent_to_supervisor': 'ส่งให้ผู้ควบคุมแล้ว',
  'sent_to_committee': 'ส่งให้คณะกรรมการแล้ว',
  'sent_to_instructor': 'ส่งให้อาจารย์แล้ว',
  'supervisor_assigned': 'มอบหมายผู้ควบคุมแล้ว',
  'advisor_assigned': 'มอบหมายที่ปรึกษาแล้ว',
  'completed': 'เสร็จสิ้น',
  'cancelled': 'ยกเลิก',
};

export function WorkflowActions({
  applicationId,
  currentStatus,
  userRole,
  availableActions,
  onActionComplete,
  className,
  showStatus = true,
  compact = false,
  isLoading = false,
}: WorkflowActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<WorkflowAction | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleActionClick = (action: WorkflowAction) => {
    const config = workflowActionConfigs[action];
    setSelectedAction(action);
    setNotes('');
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedAction) return;

    try {
      setIsSubmitting(true);
      await onActionComplete(selectedAction, notes);
      setIsDialogOpen(false);
      setSelectedAction(null);
      setNotes('');
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionButton = (action: WorkflowAction) => {
    const config = workflowActionConfigs[action];
    if (!config) return null;

    return (
      <Button
        key={action}
        variant={config.variant}
        size={compact ? 'sm' : 'default'}
        onClick={() => handleActionClick(action)}
        disabled={isLoading}
        className={`${config.color} ${compact ? 'text-xs' : ''}`}
      >
        {config.icon}
        {!compact && <span className="ml-2">{config.label}</span>}
      </Button>
    );
  };

  const selectedConfig = selectedAction ? workflowActionConfigs[selectedAction] : null;

  return (
    <div className={className}>
      {/* Status Display */}
      {showStatus && (
        <div className="mb-4">
          <StatusBadge 
            status={currentStatus} 
            label={statusLabels[currentStatus] || currentStatus}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className={`flex flex-wrap gap-2 ${compact ? 'gap-1' : 'gap-2'}`}>
        {availableActions.map(getActionButton)}
      </div>

      {/* Action Dialog */}
      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={selectedConfig?.label || 'ดำเนินการ'}
        description={selectedConfig?.description || 'กรุณาเลือกการดำเนินการ'}
        onSubmit={handleSubmit}
        onCancel={() => setIsDialogOpen(false)}
        submitLabel="ยืนยัน"
        cancelLabel="ยกเลิก"
        isSubmitting={isSubmitting}
        submitVariant={selectedConfig?.variant || 'default'}
        size="md"
      >
        {selectedConfig?.requiresNotes && (
          <div className="space-y-2">
            <Label htmlFor="notes">หมายเหตุ (ไม่บังคับ)</Label>
            <Textarea
              id="notes"
              placeholder="ระบุหมายเหตุเพิ่มเติม..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        )}

        {selectedConfig?.requiresConfirmation && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  {selectedConfig.confirmationMessage}
                </p>
              </div>
            </div>
          </div>
        )}
      </FormDialog>
    </div>
  );
}

// Specialized workflow actions for different roles
export function StaffWorkflowActions(props: Omit<WorkflowActionsProps, 'availableActions'>) {
  const staffActions: WorkflowAction[] = [
    'receive_document',
    'review_document',
    'approve_document',
    'reject_document',
    'send_to_company',
    'assign_supervisor',
    'send_reminder',
  ];

  return <WorkflowActions {...props} availableActions={staffActions} />;
}

export function SupervisorWorkflowActions(props: Omit<WorkflowActionsProps, 'availableActions'>) {
  const supervisorActions: WorkflowAction[] = [
    'review_document',
    'approve_document',
    'reject_document',
    'send_reminder',
    'request_feedback',
    'schedule_meeting',
  ];

  return <WorkflowActions {...props} availableActions={supervisorActions} />;
}

export function CommitteeWorkflowActions(props: Omit<WorkflowActionsProps, 'availableActions'>) {
  const committeeActions: WorkflowAction[] = [
    'review_document',
    'approve_document',
    'reject_document',
    'send_reminder',
    'request_feedback',
    'schedule_meeting',
  ];

  return <WorkflowActions {...props} availableActions={committeeActions} />;
}

export function InstructorWorkflowActions(props: Omit<WorkflowActionsProps, 'availableActions'>) {
  const instructorActions: WorkflowAction[] = [
    'review_document',
    'approve_document',
    'reject_document',
    'assign_advisor',
    'send_reminder',
    'request_feedback',
  ];

  return <WorkflowActions {...props} availableActions={instructorActions} />;
}
