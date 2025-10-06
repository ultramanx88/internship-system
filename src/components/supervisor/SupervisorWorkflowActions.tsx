'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UserCheck, Eye, Calendar, CheckCircle } from 'lucide-react';

interface SupervisorWorkflowActionsProps {
  applicationId: string;
  workflowStatus: any;
  onActionComplete?: () => void;
}

export default function SupervisorWorkflowActions({ 
  applicationId, 
  workflowStatus, 
  onActionComplete 
}: SupervisorWorkflowActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'receive_assignment' | 'confirm_assignment' | 'schedule_appointment' | null>(null);
  const [notes, setNotes] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentLocation, setAppointmentLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: 'receive_assignment' | 'confirm_assignment' | 'schedule_appointment') => {
    setActionType(action);
    setNotes('');
    setAppointmentDate('');
    setAppointmentLocation('');
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!actionType) return;

    // ตรวจสอบว่าต้องใส่ข้อมูลหรือไม่
    if (actionType === 'schedule_appointment' && !appointmentDate.trim()) {
      alert('กรุณาใส่วันที่นัดหมาย');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/supervisor/workflow/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          action: actionType,
          notes: notes.trim() || undefined,
          appointmentDate: appointmentDate.trim() || undefined,
          appointmentLocation: appointmentLocation.trim() || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        setIsDialogOpen(false);
        setActionType(null);
        setNotes('');
        setAppointmentDate('');
        setAppointmentLocation('');
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

  const getActionButton = (action: 'receive_assignment' | 'confirm_assignment' | 'schedule_appointment') => {
    const actions = {
      receive_assignment: {
        label: 'รับมอบหมาย',
        icon: UserCheck,
        color: 'bg-blue-600 hover:bg-blue-700',
        disabled: workflowStatus?.supervisorReceived || false
      },
      confirm_assignment: {
        label: 'ตรวจดูและยืนยัน',
        icon: Eye,
        color: 'bg-yellow-600 hover:bg-yellow-700',
        disabled: !workflowStatus?.supervisorReceived || workflowStatus?.supervisorConfirmed || false
      },
      schedule_appointment: {
        label: 'นัดหมายนิเทศ',
        icon: Calendar,
        color: 'bg-green-600 hover:bg-green-700',
        disabled: !workflowStatus?.supervisorConfirmed || workflowStatus?.appointmentScheduled || false
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
      case 'receive_assignment':
        return 'รับมอบหมายจากอาจารย์ประจำวิชา';
      case 'confirm_assignment':
        return 'ตรวจดูและยืนยันการรับมอบหมาย';
      case 'schedule_appointment':
        return 'นัดหมายนิเทศ';
      default:
        return 'ดำเนินการ';
    }
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'receive_assignment':
        return 'ยืนยันการรับมอบหมายจากอาจารย์ประจำวิชา';
      case 'confirm_assignment':
        return 'ตรวจดูรายละเอียดและยืนยันการรับมอบหมาย';
      case 'schedule_appointment':
        return 'เข้าสู่รายการนัดหมายนิเทศกับนักศึกษา';
      default:
        return 'ดำเนินการตามขั้นตอน';
    }
  };

  if (!workflowStatus) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">การดำเนินการ Supervisor Workflow</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {getActionButton('receive_assignment')}
        {getActionButton('confirm_assignment')}
        {getActionButton('schedule_appointment')}
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
            {actionType === 'schedule_appointment' && (
              <>
                <div>
                  <Label htmlFor="appointmentDate">วันที่นัดหมาย *</Label>
                  <Input
                    id="appointmentDate"
                    type="datetime-local"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="appointmentLocation">สถานที่นัดหมาย (ไม่บังคับ)</Label>
                  <Input
                    id="appointmentLocation"
                    placeholder="ระบุสถานที่นัดหมาย..."
                    value={appointmentLocation}
                    onChange={(e) => setAppointmentLocation(e.target.value)}
                  />
                </div>
              </>
            )}
            
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
              disabled={loading || (actionType === 'schedule_appointment' && !appointmentDate.trim())}
              className={actionType === 'receive_assignment' ? 'bg-blue-600 hover:bg-blue-700' :
                         actionType === 'confirm_assignment' ? 'bg-yellow-600 hover:bg-yellow-700' :
                         actionType === 'schedule_appointment' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {loading ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
