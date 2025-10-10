'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  FileText, 
  User, 
  Building,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  MapPin,
  MessageSquare
} from 'lucide-react';

interface Application {
  id: string;
  status: string;
  preferredStartDate?: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  internship: {
    id: string;
    title: string;
    company: {
      id: string;
      name: string;
      address?: string;
    };
  };
  weeklyReports: Array<{
    id: string;
    weekNumber: number;
    reportDate: string;
    content: string;
    attachments: string[];
  }>;
  supervisorAppointments: Array<{
    id: string;
    appointmentDate: string;
    location?: string;
    notes?: string;
    status: string;
    completedAt?: string;
    reportContent?: string;
  }>;
}

export default function SupervisorDashboard() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    appointmentDate: '',
    location: '',
    notes: ''
  });
  const [evaluationData, setEvaluationData] = useState({
    finalScore: '',
    finalComments: '',
    completionDate: ''
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/supervisor/appointments?action=assigned');
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.applications);
      } else {
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถดึงข้อมูลนักศึกษาได้'
        });
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (applicationId: string) => {
    if (!appointmentData.appointmentDate) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'กรุณาระบุวันนัดหมาย'
      });
      return;
    }

    try {
      const response = await fetch('/api/supervisor/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          applicationId, 
          ...appointmentData 
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'สร้างนัดหมายนิเทศเรียบร้อย',
          description: 'สร้างนัดหมายนิเทศเรียบร้อยแล้ว'
        });
        setShowAppointmentForm(false);
        setAppointmentData({
          appointmentDate: '',
          location: '',
          notes: ''
        });
        fetchApplications();
      } else {
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: data.error || 'ไม่สามารถสร้างนัดหมายนิเทศได้'
        });
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
      });
    }
  };

  const handleCompleteEvaluation = async (applicationId: string) => {
    if (!evaluationData.finalScore) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'กรุณาระบุคะแนนประเมิน'
      });
      return;
    }

    try {
      const response = await fetch('/api/supervisor/final-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          applicationId, 
          ...evaluationData 
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'บันทึกการประเมินผลรวมเรียบร้อย',
          description: 'บันทึกการประเมินผลรวมและจบการฝึกงานเรียบร้อยแล้ว'
        });
        setShowEvaluationForm(false);
        setEvaluationData({
          finalScore: '',
          finalComments: '',
          completionDate: ''
        });
        fetchApplications();
      } else {
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: data.error || 'ไม่สามารถบันทึกการประเมินผลรวมได้'
        });
      }
    } catch (error) {
      console.error('Error completing evaluation:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'company_accepted': { label: 'ได้รับการตอบรับ', variant: 'secondary' as const },
      'internship_started': { label: 'เริ่มฝึกงาน', variant: 'default' as const },
      'internship_ongoing': { label: 'กำลังฝึกงาน', variant: 'default' as const },
      'internship_completed': { label: 'จบการฝึกงาน', variant: 'default' as const },
      'completed': { label: 'เสร็จสิ้น', variant: 'default' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getAppointmentStatusBadge = (status: string) => {
    const statusConfig = {
      'scheduled': { label: 'นัดหมายแล้ว', variant: 'secondary' as const },
      'completed': { label: 'เสร็จสิ้น', variant: 'default' as const },
      'cancelled': { label: 'ยกเลิก', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-700">Dashboard อาจารย์นิเทศก์</h1>
          <p className="text-gray-600">จัดการนักศึกษาที่ได้รับมอบหมายให้นิเทศ</p>
        </div>
        <Button onClick={fetchApplications} variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          รีเฟรชข้อมูล
        </Button>
      </div>

      {/* สถิติรวม */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">นักศึกษาทั้งหมด</p>
                <p className="text-2xl font-bold text-blue-600">{applications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">กำลังฝึกงาน</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {applications.filter(app => ['internship_started', 'internship_ongoing'].includes(app.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">นัดหมายนิเทศ</p>
                <p className="text-2xl font-bold text-green-600">
                  {applications.reduce((total, app) => total + app.supervisorAppointments.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">จบการฝึกงาน</p>
                <p className="text-2xl font-bold text-purple-600">
                  {applications.filter(app => ['internship_completed', 'completed'].includes(app.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ตารางนักศึกษา */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            รายการนักศึกษาที่ได้รับมอบหมาย
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>นักศึกษา</TableHead>
                <TableHead>สถานประกอบการ</TableHead>
                <TableHead>ตำแหน่งงาน</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>รายงานสัปดาห์</TableHead>
                <TableHead>นัดหมายนิเทศ</TableHead>
                <TableHead>การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => {
                const latestReport = application.weeklyReports[0];
                const latestAppointment = application.supervisorAppointments[0];
                
                return (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{application.student.name}</p>
                        <p className="text-sm text-gray-500">{application.student.email}</p>
                        {application.student.phone && (
                          <p className="text-sm text-gray-500">{application.student.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{application.internship.company.name}</p>
                        {application.internship.company.address && (
                          <p className="text-sm text-gray-500">{application.internship.company.address}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{application.internship.title}</p>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(application.status)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-gray-500">
                          {application.weeklyReports.length} รายงาน
                        </p>
                        {latestReport && (
                          <p className="text-xs text-gray-400">
                            ล่าสุด: สัปดาห์ที่ {latestReport.weekNumber}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-gray-500">
                          {application.supervisorAppointments.length} ครั้ง
                        </p>
                        {latestAppointment && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-400">
                              {new Date(latestAppointment.appointmentDate).toLocaleDateString('th-TH')}
                            </span>
                            {getAppointmentStatusBadge(latestAppointment.status)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {['internship_started', 'internship_ongoing'].includes(application.status) && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(application);
                              setShowAppointmentForm(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            นัดหมายนิเทศ
                          </Button>
                        )}
                        
                        {application.status === 'internship_ongoing' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(application);
                              setShowEvaluationForm(true);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            ประเมินผลรวม
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {applications.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">ไม่มีนักศึกษาที่ได้รับมอบหมายให้นิเทศ</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal สำหรับสร้างนัดหมายนิเทศ */}
      {showAppointmentForm && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>สร้างนัดหมายนิเทศ</CardTitle>
              <p className="text-sm text-gray-600">
                นักศึกษา: {selectedApplication.student.name}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="appointmentDate">วันนัดหมาย</Label>
                <Input
                  id="appointmentDate"
                  type="datetime-local"
                  value={appointmentData.appointmentDate}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="location">สถานที่</Label>
                <Input
                  id="location"
                  value={appointmentData.location}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="สถานที่นัดหมาย"
                />
              </div>
              <div>
                <Label htmlFor="notes">หมายเหตุ</Label>
                <Textarea
                  id="notes"
                  value={appointmentData.notes}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="หมายเหตุเพิ่มเติม..."
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleCreateAppointment(selectedApplication.id)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  สร้างนัดหมาย
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAppointmentForm(false);
                    setSelectedApplication(null);
                    setAppointmentData({
                      appointmentDate: '',
                      location: '',
                      notes: ''
                    });
                  }}
                >
                  ยกเลิก
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal สำหรับประเมินผลรวม */}
      {showEvaluationForm && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>ประเมินผลรวมการฝึกงาน</CardTitle>
              <p className="text-sm text-gray-600">
                นักศึกษา: {selectedApplication.student.name}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="finalScore">คะแนนประเมิน (0-100)</Label>
                  <Input
                    id="finalScore"
                    type="number"
                    min="0"
                    max="100"
                    value={evaluationData.finalScore}
                    onChange={(e) => setEvaluationData(prev => ({ ...prev, finalScore: e.target.value }))}
                    placeholder="85"
                  />
                </div>
                <div>
                  <Label htmlFor="completionDate">วันจบการฝึกงาน</Label>
                  <Input
                    id="completionDate"
                    type="date"
                    value={evaluationData.completionDate}
                    onChange={(e) => setEvaluationData(prev => ({ ...prev, completionDate: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="finalComments">ความคิดเห็นการประเมิน</Label>
                <Textarea
                  id="finalComments"
                  value={evaluationData.finalComments}
                  onChange={(e) => setEvaluationData(prev => ({ ...prev, finalComments: e.target.value }))}
                  rows={6}
                  placeholder="ความคิดเห็นเกี่ยวกับการฝึกงานของนักศึกษา..."
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleCompleteEvaluation(selectedApplication.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  บันทึกการประเมิน
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEvaluationForm(false);
                    setSelectedApplication(null);
                    setEvaluationData({
                      finalScore: '',
                      finalComments: '',
                      completionDate: ''
                    });
                  }}
                >
                  ยกเลิก
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
