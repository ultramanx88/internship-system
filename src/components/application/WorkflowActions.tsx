'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, User, Users } from 'lucide-react';

interface WorkflowActionsProps {
  applicationId: string;
  userRole: string;
  workflowStatus: any;
  onActionComplete?: () => void;
}

export default function WorkflowActions({ 
  applicationId, 
  userRole, 
  workflowStatus, 
  onActionComplete 
}: WorkflowActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async (type: 'approve' | 'reject') => {
    setActionType(type);
    setFeedback('');
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!actionType) return;

    // ตรวจสอบว่าต้องใส่ feedback หรือไม่
    if (actionType === 'reject' && !feedback.trim()) {
      alert('กรุณาใส่เหตุผลในการปฏิเสธ');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/applications/${applicationId}/workflow`, {
        method: userRole === 'courseInstructor' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: actionType === 'approve' ? 'approved' : 'rejected',
          feedback: feedback.trim() || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        setIsDialogOpen(false);
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

  const canCourseInstructorAct = () => {
    return userRole === 'courseInstructor' && 
           workflowStatus?.currentStep === 'course_instructor_review' &&
           workflowStatus?.courseInstructorStatus === 'pending';
  };

  const canCommitteeAct = () => {
    return userRole === 'committee' && 
           workflowStatus?.currentStep === 'committee_review' &&
           workflowStatus?.committeeStatus === 'pending';
  };

  const canShowActions = () => {
    return canCourseInstructorAct() || canCommitteeAct();
  };

  if (!canShowActions()) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {userRole === 'courseInstructor' ? 'การพิจารณาของอาจารย์ประจำวิชา' : 'การพิจารณาของกรรมการ'}
      </h3>
      
      <div className="flex space-x-4">
        <Button
          onClick={() => handleAction('approve')}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          อนุมัติ
        </Button>
        
        <Button
          onClick={() => handleAction('reject')}
          variant="destructive"
        >
          <XCircle className="h-4 w-4 mr-2" />
          ปฏิเสธ
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'อนุมัติคำขอฝึกงาน' : 'ปฏิเสธคำขอฝึกงาน'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'คุณกำลังจะอนุมัติคำขอฝึกงานนี้'
                : 'คุณกำลังจะปฏิเสธคำขอฝึกงานนี้ กรุณาใส่เหตุผล'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback">
                {actionType === 'approve' ? 'หมายเหตุ (ไม่บังคับ)' : 'เหตุผลในการปฏิเสธ *'}
              </Label>
              <Textarea
                id="feedback"
                placeholder={
                  actionType === 'approve' 
                    ? 'หมายเหตุเพิ่มเติม...'
                    : 'กรุณาใส่เหตุผลในการปฏิเสธ...'
                }
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                required={actionType === 'reject'}
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
              disabled={loading || (actionType === 'reject' && !feedback.trim())}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {loading ? 'กำลังดำเนินการ...' : 
               actionType === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
