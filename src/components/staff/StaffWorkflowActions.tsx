'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Eye, CheckCircle, Send, Package } from 'lucide-react';

interface StaffWorkflowActionsProps {
  applicationId: string;
  workflowStatus: any;
  onActionComplete?: () => void;
}

export default function StaffWorkflowActions({ 
  applicationId, 
  workflowStatus, 
  onActionComplete 
}: StaffWorkflowActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'receive_document' | 'review_document' | 'approve_document' | 'send_to_company' | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: 'receive_document' | 'review_document' | 'approve_document' | 'send_to_company') => {
    setActionType(action);
    setNotes('');
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!actionType) return;

    setLoading(true);
    try {
      const response = await fetch('/api/staff/workflow/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          action: actionType,
          notes: notes.trim() || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        setIsDialogOpen(false);
        setActionType(null);
        setNotes('');
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

  const getActionButton = (action: 'receive_document' | 'review_document' | 'approve_document' | 'send_to_company') => {
    const actions = {
      receive_document: {
        label: 'รับเอกสาร',
        icon: FileText,
        color: 'bg-blue-600 hover:bg-blue-700',
        disabled: workflowStatus?.documentReceived || false
      },
      review_document: {
        label: 'ตรวจเอกสาร',
        icon: Eye,
        color: 'bg-yellow-600 hover:bg-yellow-700',
        disabled: !workflowStatus?.documentReceived || workflowStatus?.documentReviewed || false
      },
      approve_document: {
        label: 'อนุมัติเอกสาร',
        icon: CheckCircle,
        color: 'bg-green-600 hover:bg-green-700',
        disabled: !workflowStatus?.documentReviewed || workflowStatus?.documentApproved || false
      },
      send_to_company: {
        label: 'ส่งให้บริษัท',
        icon: Send,
        color: 'bg-purple-600 hover:bg-purple-700',
        disabled: !workflowStatus?.documentApproved || workflowStatus?.documentSentToCompany || false
      }
    };

    const actionConfig = actions[action];
    const ActionIcon = actionConfig.icon;

    return (
      <Button
        onClick={() => handleAction(action)}
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
      case 'receive_document':
        return 'รับเอกสารจาก Student';
      case 'review_document':
        return 'ตรวจเอกสาร';
      case 'approve_document':
        return 'อนุมัติเอกสาร';
      case 'send_to_company':
        return 'ส่งเอกสารให้บริษัท';
      default:
        return 'ดำเนินการ';
    }
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'receive_document':
        return 'ยืนยันการรับเอกสารจาก Student';
      case 'review_document':
        return 'ตรวจสอบเอกสารที่ได้รับ';
      case 'approve_document':
        return 'อนุมัติเอกสารและยืนยันความถูกต้อง';
      case 'send_to_company':
        return 'ส่งเอกสารให้บริษัทเพื่อดำเนินการต่อ';
      default:
        return 'ดำเนินการตามขั้นตอน';
    }
  };

  if (!workflowStatus) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">การดำเนินการ Staff Workflow</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {getActionButton('receive_document')}
        {getActionButton('review_document')}
        {getActionButton('approve_document')}
        {getActionButton('send_to_company')}
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
            <div>
              <Label htmlFor="notes">หมายเหตุ (ไม่บังคับ)</Label>
              <Textarea
                id="notes"
                placeholder="ระบุหมายเหตุเพิ่มเติม..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
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
              disabled={loading}
              className={actionType === 'receive_document' ? 'bg-blue-600 hover:bg-blue-700' :
                         actionType === 'review_document' ? 'bg-yellow-600 hover:bg-yellow-700' :
                         actionType === 'approve_document' ? 'bg-green-600 hover:bg-green-700' :
                         actionType === 'send_to_company' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              {loading ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
