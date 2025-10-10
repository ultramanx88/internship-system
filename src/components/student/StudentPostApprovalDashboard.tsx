'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Download,
  FileText,
  Calendar,
  Building2,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye
} from 'lucide-react';

interface Application {
  id: string;
  status: string;
  dateApplied: string;
  preferredStartDate?: string;
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

export function StudentPostApprovalDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStartInternshipDialogOpen, setIsStartInternshipDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [startDate, setStartDate] = useState('');

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
        setError(data.error || 'ไม่สามารถโหลดข้อมูลได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInternship = async () => {
    if (!selectedApplication || !startDate) return;

    try {
      const response = await fetch(`/api/applications/${selectedApplication.id}/start-internship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsStartInternshipDialogOpen(false);
        setSelectedApplication(null);
        setStartDate('');
        fetchApplications();
      } else {
        alert(data.error || 'ไม่สามารถบันทึกการเริ่มฝึกงานได้');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกการเริ่มฝึกงาน');
    }
  };

  const handleDownloadDocument = (documentUrl: string, title: string) => {
    if (documentUrl) {
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'company_accepted': { label: 'ได้รับการตอบรับ', variant: 'default' as const, icon: CheckCircle },
      'internship_started': { label: 'เริ่มฝึกงาน', variant: 'default' as const, icon: Calendar },
      'internship_ongoing': { label: 'กำลังฝึกงาน', variant: 'default' as const, icon: Clock },
      'internship_completed': { label: 'จบการฝึกงาน', variant: 'default' as const, icon: CheckCircle },
      'completed': { label: 'เสร็จสิ้น', variant: 'default' as const, icon: CheckCircle },
      'rejected': { label: 'ปฏิเสธ', variant: 'destructive' as const, icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      variant: 'outline' as const,
      icon: AlertCircle
    };

    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getCompanyResponseStatus = (companyResponses: Application['companyResponses']) => {
    if (companyResponses.length === 0) return null;
    
    const response = companyResponses[0];
    if (response.status === 'accepted') {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />ตอบรับแล้ว</Badge>;
    } else if (response.status === 'rejected') {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />ปฏิเสธ</Badge>;
    } else {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />รอการตอบรับ</Badge>;
    }
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
          <h1 className="text-3xl font-bold">สถานะการฝึกงาน</h1>
          <p className="text-muted-foreground">
            ติดตามสถานะและจัดการการฝึกงานของคุณ
          </p>
        </div>
      </div>

      <Tabs defaultValue="accepted" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accepted">ได้รับการตอบรับ</TabsTrigger>
          <TabsTrigger value="ongoing">กำลังฝึกงาน</TabsTrigger>
          <TabsTrigger value="documents">เอกสาร</TabsTrigger>
          <TabsTrigger value="reports">รายงานประจำสัปดาห์</TabsTrigger>
        </TabsList>

        <TabsContent value="accepted" className="space-y-4">
          <div className="grid gap-4">
            {applications
              .filter(app => app.status === 'company_accepted')
              .map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          {application.internship.title}
                        </CardTitle>
                        <CardDescription>
                          {application.internship.company.name}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(application.status)}
                        {getCompanyResponseStatus(application.companyResponses)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        สถานประกอบการตอบรับเมื่อ: {
                          application.companyResponses[0]?.responseDate 
                            ? new Date(application.companyResponses[0].responseDate).toLocaleDateString('th-TH')
                            : '-'
                        }
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            setSelectedApplication(application);
                            setIsStartInternshipDialogOpen(true);
                          }}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          บันทึกวันเริ่มฝึกงาน
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="ongoing" className="space-y-4">
          <div className="grid gap-4">
            {applications
              .filter(app => ['internship_started', 'internship_ongoing'].includes(app.status))
              .map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          {application.internship.title}
                        </CardTitle>
                        <CardDescription>
                          {application.internship.company.name}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(application.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        เริ่มฝึกงานเมื่อ: {
                          application.preferredStartDate 
                            ? new Date(application.preferredStartDate).toLocaleDateString('th-TH')
                            : '-'
                        }
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          ส่งรายงานประจำสัปดาห์
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid gap-4">
            {applications
              .filter(app => app.internshipDocuments.length > 0)
              .map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      เอกสารการฝึกงาน
                    </CardTitle>
                    <CardDescription>
                      {application.internship.title} - {application.internship.company.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {application.internshipDocuments.map((document) => (
                        <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>{document.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {new Date(document.generatedAt).toLocaleDateString('th-TH')}
                            </Badge>
                          </div>
                          {document.fileUrl && (
                            <Button
                              size="sm"
                              onClick={() => handleDownloadDocument(document.fileUrl!, document.title)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              ดาวน์โหลด
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4">
            {applications
              .filter(app => app.weeklyReports.length > 0)
              .map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      รายงานประจำสัปดาห์
                    </CardTitle>
                    <CardDescription>
                      {application.internship.title} - {application.internship.company.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {application.weeklyReports.map((report) => (
                        <div key={report.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">สัปดาห์ที่ {report.weekNumber}</h4>
                            <Badge variant="outline" className="text-xs">
                              {new Date(report.reportDate).toLocaleDateString('th-TH')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {report.content.substring(0, 100)}...
                          </p>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            ดูรายละเอียด
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Start internship dialog */}
      <Dialog open={isStartInternshipDialogOpen} onOpenChange={setIsStartInternshipDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>บันทึกวันเริ่มฝึกงาน</DialogTitle>
            <DialogDescription>
              บันทึกวันที่เริ่มฝึกงานสำหรับ {selectedApplication?.internship.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="startDate">วันที่เริ่มฝึกงาน</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStartInternshipDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleStartInternship}>
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
