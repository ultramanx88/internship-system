'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  Building,
  Plus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Application {
  id: string;
  dateApplied: string;
  projectTopic?: string;
  supervisorAppointmentDate?: string;
  supervisorAppointmentLocation?: string;
  supervisorAppointmentNotes?: string;
  student: {
    id: string;
    name: string;
    email: string;
    t_name?: string;
    t_surname?: string;
    e_name?: string;
    e_surname?: string;
    phone?: string;
  };
  internship: {
    id: string;
    title: string;
    company: {
      name: string;
      address: string;
    };
  };
}

export default function AppointmentScheduler({ 
  application, 
  onClose, 
  onActionComplete 
}: {
  application: Application;
  onClose: () => void;
  onActionComplete: () => void;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentLocation, setAppointmentLocation] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');

  useEffect(() => {
    // Set default values if appointment already exists
    if (application.supervisorAppointmentDate) {
      const date = new Date(application.supervisorAppointmentDate);
      setAppointmentDate(date.toISOString().slice(0, 16)); // Format for datetime-local input
    }
    if (application.supervisorAppointmentLocation) {
      setAppointmentLocation(application.supervisorAppointmentLocation);
    }
    if (application.supervisorAppointmentNotes) {
      setAppointmentNotes(application.supervisorAppointmentNotes);
    }
  }, [application]);

  const handleScheduleAppointment = async () => {
    if (!appointmentDate) {
      toast({
        variant: 'destructive',
        title: 'กรุณาเลือกวันที่นัดหมาย',
        description: 'ต้องระบุวันที่และเวลานัดหมาย'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/supervisor/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: application.id,
          appointmentDate: appointmentDate,
          appointmentLocation: appointmentLocation.trim() || undefined,
          appointmentNotes: appointmentNotes.trim() || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'กำหนดนัดหมายเรียบร้อย',
          description: 'นัดหมายนิเทศได้รับการกำหนดแล้ว'
        });
        onActionComplete();
      } else {
        toast({
          variant: 'destructive',
          title: 'ไม่สามารถกำหนดนัดหมายได้',
          description: data.error || 'เกิดข้อผิดพลาด'
        });
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast({
        variant: 'destructive',
        title: 'ไม่สามารถกำหนดนัดหมายได้',
        description: 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={!!application} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>กำหนดนัดหมายนิเทศ</DialogTitle>
          <DialogDescription>
            {application.student.t_name || application.student.e_name || application.student.name} - {application.internship.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* ข้อมูลนักศึกษา */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ข้อมูลนักศึกษา</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">ชื่อ-นามสกุล</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {application.student.t_name || application.student.e_name || application.student.name}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">บริษัท</span>
                  </div>
                  <p className="text-sm text-gray-700">{application.internship.company.name}</p>
                </div>
                {application.student.phone && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">เบอร์โทรศัพท์</span>
                    </div>
                    <p className="text-sm text-gray-700">{application.student.phone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ฟอร์มกำหนดนัดหมาย */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">กำหนดนัดหมาย</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="appointmentDate">วันที่และเวลา <span className="text-red-500">*</span></Label>
                  <Input
                    id="appointmentDate"
                    type="datetime-local"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="appointmentLocation">สถานที่นัดหมาย</Label>
                  <Input
                    id="appointmentLocation"
                    placeholder="เช่น ห้องประชุมคณะ, บริษัท ABC, ออนไลน์"
                    value={appointmentLocation}
                    onChange={(e) => setAppointmentLocation(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="appointmentNotes">หมายเหตุ</Label>
                  <Textarea
                    id="appointmentNotes"
                    placeholder="หมายเหตุเพิ่มเติมเกี่ยวกับการนัดหมาย..."
                    value={appointmentNotes}
                    onChange={(e) => setAppointmentNotes(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* แสดงนัดหมายเดิม (ถ้ามี) */}
          {application.supervisorAppointmentDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">นัดหมายปัจจุบัน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">วันที่และเวลา</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      {formatDate(application.supervisorAppointmentDate)}
                    </p>
                    
                    {application.supervisorAppointmentLocation && (
                      <>
                        <div className="flex items-center gap-2 mt-3">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">สถานที่</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          {application.supervisorAppointmentLocation}
                        </p>
                      </>
                    )}
                    
                    {application.supervisorAppointmentNotes && (
                      <>
                        <div className="flex items-center gap-2 mt-3">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">หมายเหตุ</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          {application.supervisorAppointmentNotes}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleScheduleAppointment}
            disabled={loading || !appointmentDate}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึกนัดหมาย'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
