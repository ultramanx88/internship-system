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
  Download, 
  Upload, 
  Calendar, 
  FileText, 
  CheckCircle,
  Clock,
  Building,
  User,
  Plus,
  Edit
} from 'lucide-react';

interface Application {
  id: string;
  status: string;
  preferredStartDate?: string;
  createdAt: string;
  updatedAt: string;
  internship: {
    id: string;
    title: string;
    company: {
      id: string;
      name: string;
    };
  };
  companyResponses: Array<{
    id: string;
    status: string;
    responseDate?: string;
    responseNote?: string;
  }>;
  internshipDocuments: Array<{
    id: string;
    type: string;
    title: string;
    fileUrl?: string;
    generatedAt: string;
  }>;
  weeklyReports: Array<{
    id: string;
    weekNumber: number;
    reportDate: string;
    content: string;
    attachments: string[];
  }>;
}

export default function StudentPostApprovalDashboard() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showStartDateForm, setShowStartDateForm] = useState(false);
  const [showWeeklyReportForm, setShowWeeklyReportForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [weeklyReportData, setWeeklyReportData] = useState({
    weekNumber: '',
    reportDate: '',
    content: '',
    attachments: [] as string[]
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/student/applications/post-approval');
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.applications);
      } else {
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถดึงข้อมูลคำขอฝึกงานได้'
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

  const handleStartInternship = async (applicationId: string) => {
    if (!startDate) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'กรุณาระบุวันเริ่มฝึกงาน'
      });
      return;
    }

    try {
      const response = await fetch('/api/student/internship-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          applicationId, 
          startDate 
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'บันทึกวันเริ่มฝึกงานเรียบร้อย',
          description: 'บันทึกวันเริ่มฝึกงานเรียบร้อยแล้ว'
        });
        setShowStartDateForm(false);
        setStartDate('');
        fetchApplications();
      } else {
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: data.error || 'ไม่สามารถบันทึกวันเริ่มฝึกงานได้'
        });
      }
    } catch (error) {
      console.error('Error starting internship:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
      });
    }
  };

  const handleSubmitWeeklyReport = async (applicationId: string) => {
    if (!weeklyReportData.weekNumber || !weeklyReportData.reportDate || !weeklyReportData.content) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'กรุณากรอกข้อมูลครบถ้วน'
      });
      return;
    }

    try {
      const response = await fetch('/api/student/weekly-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          applicationId, 
          ...weeklyReportData 
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'ส่งรายงานประจำสัปดาห์เรียบร้อย',
          description: 'ส่งรายงานประจำสัปดาห์เรียบร้อยแล้ว'
        });
        setShowWeeklyReportForm(false);
        setWeeklyReportData({
          weekNumber: '',
          reportDate: '',
          content: '',
          attachments: []
        });
        fetchApplications();
      } else {
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: data.error || 'ไม่สามารถส่งรายงานประจำสัปดาห์ได้'
        });
      }
    } catch (error) {
      console.error('Error submitting weekly report:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'company_accepted': { label: 'ได้รับการตอบรับ', variant: 'default' as const },
      'internship_started': { label: 'เริ่มฝึกงาน', variant: 'default' as const },
      'internship_ongoing': { label: 'กำลังฝึกงาน', variant: 'default' as const },
      'internship_completed': { label: 'จบการฝึกงาน', variant: 'default' as const },
      'completed': { label: 'เสร็จสิ้น', variant: 'default' as const },
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
          <h1 className="text-2xl font-bold text-amber-700">การฝึกงานของฉัน</h1>
          <p className="text-gray-600">จัดการการฝึกงานและส่งรายงานประจำสัปดาห์</p>
        </div>
        <Button onClick={fetchApplications} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          รีเฟรชข้อมูล
        </Button>
      </div>

      {/* ตารางคำขอฝึกงาน */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            รายการการฝึกงาน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>สถานประกอบการ</TableHead>
                <TableHead>ตำแหน่งงาน</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>วันเริ่มฝึกงาน</TableHead>
                <TableHead>รายงานสัปดาห์</TableHead>
                <TableHead>เอกสาร</TableHead>
                <TableHead>การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => {
                const hasIntroductionLetter = application.internshipDocuments.some(doc => doc.type === 'student_introduction_letter');
                const hasAcceptanceLetter = application.internshipDocuments.some(doc => doc.type === 'company_acceptance_letter');
                const hasCertificate = application.internshipDocuments.some(doc => doc.type === 'internship_certificate');
                
                return (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{application.internship.company.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{application.internship.title}</p>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(application.status)}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-500">
                        {application.preferredStartDate 
                          ? new Date(application.preferredStartDate).toLocaleDateString('th-TH')
                          : '-'
                        }
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-500">
                        {application.weeklyReports.length} รายงาน
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {hasIntroductionLetter && (
                          <Badge variant="outline" className="text-xs">หนังสือส่งตัว</Badge>
                        )}
                        {hasAcceptanceLetter && (
                          <Badge variant="outline" className="text-xs">หนังสือตอบรับ</Badge>
                        )}
                        {hasCertificate && (
                          <Badge variant="outline" className="text-xs">หนังสือรับรอง</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {application.status === 'company_accepted' && !application.preferredStartDate && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(application);
                              setShowStartDateForm(true);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            บันทึกวันเริ่ม
                          </Button>
                        )}
                        
                        {['internship_started', 'internship_ongoing'].includes(application.status) && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(application);
                              setShowWeeklyReportForm(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            ส่งรายงาน
                          </Button>
                        )}
                        
                        {hasIntroductionLetter && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const doc = application.internshipDocuments.find(doc => doc.type === 'student_introduction_letter');
                              if (doc?.fileUrl) {
                                window.open(doc.fileUrl, '_blank');
                              }
                            }}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            ดาวน์โหลด
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
              <p className="text-gray-500">ไม่มีข้อมูลการฝึกงาน</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal สำหรับบันทึกวันเริ่มฝึกงาน */}
      {showStartDateForm && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>บันทึกวันเริ่มฝึกงาน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="startDate">วันเริ่มฝึกงาน</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleStartInternship(selectedApplication.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  บันทึก
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowStartDateForm(false);
                    setSelectedApplication(null);
                    setStartDate('');
                  }}
                >
                  ยกเลิก
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal สำหรับส่งรายงานประจำสัปดาห์ */}
      {showWeeklyReportForm && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>ส่งรายงานประจำสัปดาห์</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weekNumber">สัปดาห์ที่</Label>
                  <Input
                    id="weekNumber"
                    type="number"
                    value={weeklyReportData.weekNumber}
                    onChange={(e) => setWeeklyReportData(prev => ({ ...prev, weekNumber: e.target.value }))}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label htmlFor="reportDate">วันที่รายงาน</Label>
                  <Input
                    id="reportDate"
                    type="date"
                    value={weeklyReportData.reportDate}
                    onChange={(e) => setWeeklyReportData(prev => ({ ...prev, reportDate: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="content">เนื้อหารายงาน</Label>
                <Textarea
                  id="content"
                  value={weeklyReportData.content}
                  onChange={(e) => setWeeklyReportData(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  placeholder="รายงานการทำงานในสัปดาห์นี้..."
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleSubmitWeeklyReport(selectedApplication.id)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  ส่งรายงาน
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowWeeklyReportForm(false);
                    setSelectedApplication(null);
                    setWeeklyReportData({
                      weekNumber: '',
                      reportDate: '',
                      content: '',
                      attachments: []
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
