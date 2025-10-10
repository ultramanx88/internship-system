'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  FileText,
  User,
  Building
} from 'lucide-react';

interface Application {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
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
}

export default function StaffPostApprovalDashboard() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingToCompany, setSendingToCompany] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/applications/post-approval');
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

  const handleSendToCompany = async (applicationId: string) => {
    setSendingToCompany(applicationId);
    
    try {
      const response = await fetch('/api/staff/send-to-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'ส่งคำขอเรียบร้อย',
          description: 'ส่งคำขอไปยังสถานประกอบการเรียบร้อยแล้ว'
        });
        fetchApplications(); // รีเฟรชข้อมูล
      } else {
        toast({
          variant: 'destructive',
          title: 'เกิดข้อผิดพลาด',
          description: data.error || 'ไม่สามารถส่งคำขอได้'
        });
      }
    } catch (error) {
      console.error('Error sending to company:', error);
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
      });
    } finally {
      setSendingToCompany(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'waiting_company_response': { label: 'รอการตอบรับ', variant: 'secondary' as const },
      'company_accepted': { label: 'ได้รับการตอบรับ', variant: 'default' as const },
      'internship_started': { label: 'เริ่มฝึกงาน', variant: 'default' as const },
      'internship_ongoing': { label: 'กำลังฝึกงาน', variant: 'default' as const },
      'internship_completed': { label: 'จบการฝึกงาน', variant: 'default' as const },
      'completed': { label: 'เสร็จสิ้น', variant: 'default' as const },
      'rejected': { label: 'ถูกปฏิเสธ', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCompanyResponseStatus = (responses: Application['companyResponses']) => {
    if (responses.length === 0) return { label: 'ยังไม่ตอบรับ', variant: 'secondary' as const };
    
    const response = responses[0];
    switch (response.status) {
      case 'accepted':
        return { label: 'ตอบรับ', variant: 'default' as const };
      case 'rejected':
        return { label: 'ปฏิเสธ', variant: 'destructive' as const };
      default:
        return { label: 'รอการตอบรับ', variant: 'secondary' as const };
    }
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
          <h1 className="text-2xl font-bold text-amber-700">จัดการคำขอฝึกงานหลังการอนุมัติ</h1>
          <p className="text-gray-600">จัดการคำขอฝึกงานที่ได้รับการอนุมัติจากกรรมการแล้ว</p>
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
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">รอการตอบรับ</p>
                <p className="text-2xl font-bold text-blue-600">
                  {applications.filter(app => app.status === 'waiting_company_response').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ได้รับการตอบรับ</p>
                <p className="text-2xl font-bold text-green-600">
                  {applications.filter(app => app.status === 'company_accepted').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">กำลังฝึกงาน</p>
                <p className="text-2xl font-bold text-purple-600">
                  {applications.filter(app => ['internship_started', 'internship_ongoing'].includes(app.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">จบการฝึกงาน</p>
                <p className="text-2xl font-bold text-amber-600">
                  {applications.filter(app => ['internship_completed', 'completed'].includes(app.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ตารางคำขอฝึกงาน */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            รายการคำขอฝึกงานหลังการอนุมัติ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>นักศึกษา</TableHead>
                <TableHead>สถานประกอบการ</TableHead>
                <TableHead>ตำแหน่งงาน</TableHead>
                <TableHead>สถานะคำขอ</TableHead>
                <TableHead>สถานะการตอบรับ</TableHead>
                <TableHead>วันที่ส่ง</TableHead>
                <TableHead>การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => {
                const companyResponseStatus = getCompanyResponseStatus(application.companyResponses);
                const hasIntroductionLetter = application.internshipDocuments.some(doc => doc.type === 'student_introduction_letter');
                
                return (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{application.student.name}</p>
                        <p className="text-sm text-gray-500">{application.student.email}</p>
                      </div>
                    </TableCell>
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
                      <Badge variant={companyResponseStatus.variant}>
                        {companyResponseStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-500">
                        {new Date(application.createdAt).toLocaleDateString('th-TH')}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {application.status === 'waiting_company_response' && !hasIntroductionLetter && (
                          <Button
                            size="sm"
                            onClick={() => handleSendToCompany(application.id)}
                            disabled={sendingToCompany === application.id}
                            className="bg-amber-600 hover:bg-amber-700"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            {sendingToCompany === application.id ? 'กำลังส่ง...' : 'ส่งคำขอ'}
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
                            ดาวน์โหลดเอกสาร
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
              <p className="text-gray-500">ไม่มีคำขอฝึกงานที่รอการจัดการ</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
