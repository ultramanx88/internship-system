'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Eye, CheckCircle, XCircle, UserCheck } from 'lucide-react';

interface InstructorWorkflowActionsProps {
  applicationId: string;
  workflowStatus: any;
  onActionComplete?: () => void;
}

export default function InstructorWorkflowActions({ 
  applicationId, 
  workflowStatus, 
  onActionComplete 
}: InstructorWorkflowActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'receive_application' | 'review_application' | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: 'receive_application' | 'review_application', status?: 'approved' | 'rejected') => {
    setActionType(action);
    setReviewStatus(status || null);
    setFeedback('');
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!actionType) return;

    // ตรวจสอบว่าต้องใส่ feedback หรือไม่
    if (actionType === 'review_application' && reviewStatus === 'rejected' && !feedback.trim()) {
      alert('กรุณาใส่เหตุผลในการปฏิเสธ');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/instructor/workflow/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          action: actionType,
          status: reviewStatus,
          feedback: feedback.trim() || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        setIsDialogOpen(false);
        setActionType(null);
        setReviewStatus(null);
        setFeedback('');
        onActionComplete?.();
      } else {
        alert(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error submitting action:', error);
      alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const getActionButton = (action: 'receive_application' | 'review_application', status?: 'approved' | 'rejected') => {
    const actions = {
      receive_application: {
        label: 'รับคำขอ',
        icon: FileText,
        color: 'bg-blue-600 hover:bg-blue-700',
        disabled: workflowStatus?.instructorReceived || false
      },
      review_application: {
        label: status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ',
        icon: status === 'approved' ? CheckCircle : XCircle,
        color: status === 'approved' 
          ? 'bg-green-600 hover:bg-green-700' 
          : 'bg-red-600 hover:bg-red-700',
        disabled: !workflowStatus?.instructorReceived || workflowStatus?.instructorReviewed || false
      }
    };

    const actionConfig = actions[action];
    const ActionIcon = actionConfig.icon;

    return (
      <Button
        onClick={() => handleAction(action, status)}
        disabled={actionConfig.disabled}
        className={actionConfig.color}
      >
        <ActionIcon className="h-4 w-4 mr-2" />
        {actionConfig.label}
      </Button>
    );
  };

  const getActionTitle = (action: string) => {
    switch (action) {
      case 'receive_application':
        return 'รับคำขอฝึกงาน';
      case 'review_application':
        return reviewStatus === 'approved' ? 'อนุมัติคำขอฝึกงาน' : 'ปฏิเสธคำขอฝึกงาน';
      default:
        return 'ดำเนินการ';
    }
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'receive_application':
        return 'ยืนยันการรับคำขอฝึกงานจาก Student';
      case 'review_application':
        return reviewStatus === 'approved' 
          ? 'อนุมัติคำขอฝึกงานและกำหนดอาจารย์นิเทศก์'
          : 'ปฏิเสธคำขอฝึกงานและส่งกลับให้ Student แก้ไข';
      default:
        return 'ดำเนินการตามขั้นตอน';
    }
  };

  if (!workflowStatus) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">การดำเนินการ Instructor Workflow</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {getActionButton('receive_application')}
        {getActionButton('review_application', 'approved')}
        {getActionButton('review_application', 'rejected')}
      </div>

      {/* Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType ? getActionTitle(actionType) : 'ดำเนินการ'}
            </DialogTitle>
            <DialogDescription>
              {actionType ? getActionDescription(actionType) : 'กรุณาเลือกการดำเนินการ'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {actionType === 'review_application' && (
              <div>
                <Label htmlFor="status">สถานะการพิจารณา</Label>
                <div className="flex space-x-4 mt-2">
                  <Button
                    type="button"
                    variant={reviewStatus === 'approved' ? 'default' : 'outline'}
                    onClick={() => setReviewStatus('approved')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    อนุมัติ
                  </Button>
                  <Button
                    type="button"
                    variant={reviewStatus === 'rejected' ? 'default' : 'outline'}
                    onClick={() => setReviewStatus('rejected')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    ปฏิเสธ
                  </Button>
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="feedback">
                {actionType === 'receive_application' ? 'หมายเหตุ (ไม่บังคับ)' : 
                 reviewStatus === 'rejected' ? 'เหตุผลในการปฏิเสธ *' : 'หมายเหตุ (ไม่บังคับ)'}
              </Label>
              <Textarea
                id="feedback"
                placeholder={
                  actionType === 'receive_application' 
                    ? 'หมายเหตุเพิ่มเติม...'
                    : reviewStatus === 'rejected'
                    ? 'กรุณาใส่เหตุผลในการปฏิเสธ...'
                    : 'หมายเหตุเพิ่มเติม...'
                }
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                required={actionType === 'review_application' && reviewStatus === 'rejected'}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || (actionType === 'review_application' && !reviewStatus) || 
                        (actionType === 'review_application' && reviewStatus === 'rejected' && !feedback.trim())}
              className={actionType === 'receive_application' ? 'bg-blue-600 hover:bg-blue-700' :
                         reviewStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                         reviewStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {loading ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
