'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Send,
  Download,
  Eye
} from 'lucide-react';

interface Application {
  id: string;
  status: string;
  dateApplied: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  // Embedded company fields (internal-only)
  companyName?: string;
  position?: string;
  externalResponseStatus?: 'pending' | 'accepted' | 'rejected';
  externalResponseAt?: string;
  documentsPrepared?: boolean;
  documentsPreparedAt?: string;
  internshipDocuments: Array<{
    id: string;
    type: string;
    title: string;
    fileUrl?: string;
    generatedAt: string;
  }>;
}

export function StaffPostApprovalDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(data.error || 'ไม่สามารถโหลดข้อมูลได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handlePrepareDocuments = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/staff/documents/prepare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // อัปเดตสถานะใน UI
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: 'awaiting_external_response', documentsPrepared: true, documentsPreparedAt: new Date().toISOString() }
              : app
          )
        );
      } else {
        alert(data.error || 'ไม่สามารถเตรียมเอกสารได้');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเตรียมเอกสาร');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'committee_approved': { label: 'รอเตรียมเอกสาร', variant: 'default' as const },
      'documents_prepared': { label: 'เตรียมเอกสารแล้ว', variant: 'default' as const },
      'awaiting_external_response': { label: 'รอผลตอบรับ', variant: 'secondary' as const },
      'company_accepted': { label: 'ได้รับการตอบรับ', variant: 'default' as const },
      'internship_started': { label: 'เริ่มฝึกงาน', variant: 'default' as const },
      'internship_ongoing': { label: 'กำลังฝึกงาน', variant: 'default' as const },
      'internship_completed': { label: 'จบการฝึกงาน', variant: 'default' as const },
      'completed': { label: 'เสร็จสิ้น', variant: 'default' as const },
      'rejected': { label: 'ปฏิเสธ', variant: 'destructive' as const }
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

  const getExternalResponseBadge = (status?: Application['externalResponseStatus']) => {
    if (!status || status === 'pending') {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />รอผลตอบรับ</Badge>;
    }
    if (status === 'accepted') {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />ตอบรับแล้ว</Badge>;
    }
    return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />ปฏิเสธ</Badge>;
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
          <h1 className="text-3xl font-bold">จัดการคำขอหลังการอนุมัติ</h1>
          <p className="text-muted-foreground">
            จัดการคำขอฝึกงานที่ได้รับการอนุมัติจากกรรมการแล้ว
          </p>
        </div>
      </div>

      <Tabs defaultValue="waiting" className="space-y-4">
        <TabsList>
          <TabsTrigger value="waiting">รอเตรียมเอกสาร</TabsTrigger>
          <TabsTrigger value="company-response">รอผลตอบรับ</TabsTrigger>
          <TabsTrigger value="accepted">ได้รับการตอบรับ</TabsTrigger>
          <TabsTrigger value="ongoing">กำลังฝึกงาน</TabsTrigger>
        </TabsList>

        <TabsContent value="waiting" className="space-y-4">
          <div className="grid gap-4">
            {applications
              .filter(app => app.status === 'committee_approved')
              .map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          {application.student.name}
                        </CardTitle>
                        <CardDescription>
                          {application.position || '-'} {application.companyName ? `- ${application.companyName}` : ''}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(application.status)}
                        <Button
                          onClick={() => handlePrepareDocuments(application.id)}
                          size="sm"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          เตรียมเอกสาร
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      ส่งคำขอเมื่อ: {new Date(application.dateApplied).toLocaleDateString('th-TH')}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="company-response" className="space-y-4">
          <div className="grid gap-4">
            {applications
              .filter(app => app.status === 'awaiting_external_response')
              .map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          {application.student.name}
                        </CardTitle>
                        <CardDescription>
                          {application.position || '-'} {application.companyName ? `- ${application.companyName}` : ''}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(application.status)}
                        {getExternalResponseBadge(application.externalResponseStatus)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      เตรียมเอกสารเมื่อ: {application.documentsPreparedAt ? new Date(application.documentsPreparedAt).toLocaleDateString('th-TH') : '-'}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          <div className="grid gap-4">
            {applications
              .filter(app => ['company_accepted', 'internship_started'].includes(app.status))
              .map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          {application.student.name}
                        </CardTitle>
                        <CardDescription>
                          {application.position || '-'} {application.companyName ? `- ${application.companyName}` : ''}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(application.status)}
                        {getCompanyResponseStatus(application.companyResponses)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        หน่วยงานภายนอกตอบรับเมื่อ: {
                          application.externalResponseAt 
                            ? new Date(application.externalResponseAt).toLocaleDateString('th-TH')
                            : '-'
                        }
                      </div>
                      {application.internshipDocuments.length > 0 && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">เอกสารที่สร้างแล้ว:</span>
                          {application.internshipDocuments.map((doc) => (
                            <Button key={doc.id} variant="outline" size="sm">
                              <Download className="w-3 h-3 mr-1" />
                              {doc.title}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="ongoing" className="space-y-4">
          <div className="grid gap-4">
            {applications
              .filter(app => ['internship_ongoing', 'internship_completed', 'completed'].includes(app.status))
              .map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          {application.student.name}
                        </CardTitle>
                        <CardDescription>
                          {application.position || '-'} {application.companyName ? `- ${application.companyName}` : ''}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(application.status)}
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          ดูรายละเอียด
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      สถานะปัจจุบัน: {getStatusBadge(application.status)}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
