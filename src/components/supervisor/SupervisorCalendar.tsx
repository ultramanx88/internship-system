'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  FileText,
  Plus,
  Edit,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface SupervisorAppointment {
  id: string;
  appointmentDate: string;
  location?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  completedAt?: string;
  reportContent?: string;
  attachments: string[];
  application: {
    id: string;
    student: {
      id: string;
      name: string;
      email: string;
    };
    internship: {
      title: string;
      company: {
        name: string;
      };
    };
  };
}

interface Application {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  internship: {
    title: string;
    company: {
      name: string;
    };
  };
  status: string;
}

export function SupervisorCalendar() {
  const [appointments, setAppointments] = useState<SupervisorAppointment[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<SupervisorAppointment | null>(null);
  const [formData, setFormData] = useState({
    applicationId: '',
    appointmentDate: new Date(),
    location: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsRes, applicationsRes] = await Promise.all([
        fetch('/api/supervisor/appointments'),
        fetch('/api/supervisor/applications')
      ]);

      const [appointmentsData, applicationsData] = await Promise.all([
        appointmentsRes.json(),
        applicationsRes.json()
      ]);

      if (appointmentsData.success) {
        setAppointments(appointmentsData.appointments);
      }

      if (applicationsData.success) {
        setApplications(applicationsData.applications);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async () => {
    try {
      const response = await fetch('/api/supervisor/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationId: formData.applicationId,
          appointmentDate: formData.appointmentDate,
          location: formData.location,
          notes: formData.notes
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsCreateDialogOpen(false);
        setFormData({
          applicationId: '',
          appointmentDate: new Date(),
          location: '',
          notes: ''
        });
        fetchData();
      } else {
        alert(data.error || 'ไม่สามารถสร้างการนัดหมายได้');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการสร้างการนัดหมาย');
    }
  };

  const handleCompleteAppointment = async (appointmentId: string, reportContent: string) => {
    try {
      const response = await fetch(`/api/supervisor/appointments/${appointmentId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportContent
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsEditDialogOpen(false);
        setSelectedAppointment(null);
        fetchData();
      } else {
        alert(data.error || 'ไม่สามารถบันทึกผลการนิเทศได้');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกผลการนิเทศ');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'scheduled': { label: 'นัดหมายแล้ว', variant: 'default' as const },
      'completed': { label: 'เสร็จสิ้น', variant: 'default' as const },
      'cancelled': { label: 'ยกเลิก', variant: 'destructive' as const },
      'rescheduled': { label: 'เลื่อนนัด', variant: 'secondary' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      variant: 'outline' as const 
    };

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ปฏิทินการนิเทศ</h1>
          <p className="text-muted-foreground">
            จัดการการนัดหมายและบันทึกผลการนิเทศนักศึกษา
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              นัดหมายใหม่
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>สร้างการนัดหมายใหม่</DialogTitle>
              <DialogDescription>
                เลือกนักศึกษาและกำหนดเวลาการนัดหมาย
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="application">นักศึกษา</Label>
                <Select
                  value={formData.applicationId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, applicationId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกนักศึกษา" />
                  </SelectTrigger>
                  <SelectContent>
                    {applications.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.student.name} - {app.internship.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">วันที่นัดหมาย</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.appointmentDate ? format(formData.appointmentDate, 'PPP', { locale: th }) : 'เลือกวันที่'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.appointmentDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, appointmentDate: date || new Date() }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="location">สถานที่</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="ระบุสถานที่นัดหมาย"
                />
              </div>
              <div>
                <Label htmlFor="notes">หมายเหตุ</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="หมายเหตุเพิ่มเติม"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleCreateAppointment}>
                สร้างการนัดหมาย
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>ปฏิทินการนัดหมาย</CardTitle>
              <CardDescription>
                เลือกวันที่เพื่อดูการนัดหมาย
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>

        {/* Appointments for selected date */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>การนัดหมาย</CardTitle>
              <CardDescription>
                {selectedDate ? format(selectedDate, 'PPP', { locale: th }) : 'เลือกวันที่'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedDate && getAppointmentsForDate(selectedDate).length === 0 ? (
                  <p className="text-muted-foreground text-sm">ไม่มีการนัดหมายในวันนี้</p>
                ) : (
                  selectedDate && getAppointmentsForDate(selectedDate).map((appointment) => (
                    <Card key={appointment.id} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{appointment.application.student.name}</h4>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {appointment.application.internship.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.application.internship.company.name}
                        </p>
                        {appointment.location && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3 mr-1" />
                            {appointment.location}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          {format(new Date(appointment.appointmentDate), 'HH:mm')}
                        </div>
                        {appointment.status === 'scheduled' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setIsEditDialogOpen(true);
                            }}
                            className="w-full"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            บันทึกผลการนิเทศ
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Complete appointment dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>บันทึกผลการนิเทศ</DialogTitle>
            <DialogDescription>
              บันทึกผลการนิเทศสำหรับ {selectedAppointment?.application.student.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="report">รายงานผลการนิเทศ</Label>
              <Textarea
                id="report"
                placeholder="บันทึกผลการนิเทศ..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button 
              onClick={() => {
                const reportContent = (document.getElementById('report') as HTMLTextAreaElement)?.value;
                if (reportContent && selectedAppointment) {
                  handleCompleteAppointment(selectedAppointment.id, reportContent);
                }
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              บันทึกผลการนิเทศ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
