'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SupervisorGuard } from '@/components/auth/PermissionGuard';
import { SupervisorMenu } from '@/components/supervisor/SupervisorMenu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Building, 
  Calendar, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  MessageSquare
} from 'lucide-react';

interface ApplicationDetails {
  id: string;
  studentId: string;
  studentName: string;
  companyName: string;
  position: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress';
  dateApplied: string;
  documents: string[];
  supervisorStatus: 'not_assigned' | 'assigned' | 'accepted' | 'rejected';
  assignmentDate?: string;
  responseDate?: string;
  rejectionReason?: string;
  studentProfile?: {
    faculty: string;
    major: string;
    phone: string;
    email: string;
    gpa: string;
  };
  internshipDetails?: {
    startDate: string;
    endDate: string;
    duration: string;
    supervisor: string;
    contact: string;
  };
}

export default function SupervisorApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = decodeURIComponent(String(params?.id || ''));
  const [isLoading, setIsLoading] = useState(true);
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!applicationId) {
        router.push('/supervisor/applications');
        return;
      }

      try {
        // Mock data - ในระบบจริงจะดึงจาก API
        const mockApplication: ApplicationDetails = {
          id: applicationId,
          studentId: 's6800001',
          studentName: 'นาย สมชาย ใจดี',
          companyName: 'บริษัท เทคโนโลยี จำกัด',
          position: 'นักพัฒนาซอฟต์แวร์',
          status: 'approved',
          dateApplied: '2024-01-15',
          documents: ['ใบสมัครฝึกงาน', 'ใบรับรองจากอาจารย์', 'Transcript', 'Portfolio'],
          supervisorStatus: 'assigned',
          assignmentDate: '2024-01-16',
          studentProfile: {
            faculty: 'คณะวิศวกรรมศาสตร์',
            major: 'วิศวกรรมคอมพิวเตอร์',
            phone: '081-234-5678',
            email: 'somchai@student.university.ac.th',
            gpa: '3.45'
          },
          internshipDetails: {
            startDate: '2024-06-01',
            endDate: '2024-08-31',
            duration: '3 เดือน',
            supervisor: 'คุณ วิชัย เก่งมาก',
            contact: '02-123-4567'
          }
        };

        if (mounted) {
          setApplication(mockApplication);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading application:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => { mounted = false; };
  }, [applicationId, router]);

  const handleAccept = () => {
    // ฟังก์ชันสำหรับตอบรับการมอบหมาย
    alert('ตอบรับการมอบหมายนิเทศเรียบร้อยแล้ว');
    setApplication(prev => prev ? { ...prev, supervisorStatus: 'accepted', responseDate: new Date().toISOString() } : null);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('กรุณาระบุเหตุผลในการปฏิเสธ');
      return;
    }
    
    // ฟังก์ชันสำหรับปฏิเสธการมอบหมาย
    alert('ปฏิเสธการมอบหมายนิเทศเรียบร้อยแล้ว');
    setApplication(prev => prev ? { 
      ...prev, 
      supervisorStatus: 'rejected', 
      responseDate: new Date().toISOString(),
      rejectionReason 
    } : null);
    setShowRejectDialog(false);
    setRejectionReason('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">รอดำเนินการ</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">อนุมัติแล้ว</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">ปฏิเสธ</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">กำลังดำเนินการ</Badge>;
      default:
        return <Badge variant="secondary">ไม่ทราบสถานะ</Badge>;
    }
  };

  const getSupervisorStatusBadge = (status: string) => {
    switch (status) {
      case 'not_assigned':
        return <Badge variant="outline" className="text-gray-600">ยังไม่ได้รับมอบหมาย</Badge>;
      case 'assigned':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">ได้รับมอบหมาย</Badge>;
      case 'accepted':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">ตอบรับแล้ว</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">ปฏิเสธ</Badge>;
      default:
        return <Badge variant="outline">ไม่ทราบสถานะ</Badge>;
    }
  };

  if (isLoading) {
    return (
      <SupervisorGuard>
        <div className="flex h-screen bg-gray-50">
          <SupervisorMenu />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        </div>
      </SupervisorGuard>
    );
  }

  if (!application) {
    return (
      <SupervisorGuard>
        <div className="flex h-screen bg-gray-50">
          <SupervisorMenu />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบข้อมูล</h3>
              <p className="text-gray-600 mb-4">ไม่พบรายการเอกสารที่ต้องการ</p>
              <Button onClick={() => router.push('/supervisor/applications')}>
                กลับไปรายการเอกสาร
              </Button>
            </div>
          </div>
        </div>
      </SupervisorGuard>
    );
  }

  return (
    <SupervisorGuard>
      <div className="flex h-screen bg-gray-50">
        <SupervisorMenu />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/supervisor/applications')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  กลับ
                </Button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">{application.studentName}</h1>
                  <p className="text-gray-600">({application.studentId}) - {application.companyName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(application.status)}
                {getSupervisorStatusBadge(application.supervisorStatus)}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Action Buttons */}
              {application.supervisorStatus === 'assigned' && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-medium text-blue-900">รอการตอบรับการมอบหมาย</h3>
                          <p className="text-sm text-blue-700">
                            คุณได้รับมอบหมายให้นิเทศนักศึกษาคนนี้ กรุณาตอบรับหรือปฏิเสธ
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAccept} className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          ตอบรับ
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowRejectDialog(true)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          ปฏิเสธ
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Student Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    ข้อมูลนักศึกษา
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">ชื่อ-นามสกุล</Label>
                      <p className="text-gray-900">{application.studentName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">รหัสนักศึกษา</Label>
                      <p className="text-gray-900">{application.studentId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">คณะ</Label>
                      <p className="text-gray-900">{application.studentProfile?.faculty}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">สาขาวิชา</Label>
                      <p className="text-gray-900">{application.studentProfile?.major}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">เบอร์โทรศัพท์</Label>
                      <p className="text-gray-900">{application.studentProfile?.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">อีเมล</Label>
                      <p className="text-gray-900">{application.studentProfile?.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">เกรดเฉลี่ย</Label>
                      <p className="text-gray-900">{application.studentProfile?.gpa}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Internship Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    ข้อมูลการฝึกงาน/สหกิจศึกษา
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">สถานประกอบการ</Label>
                      <p className="text-gray-900">{application.companyName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">ตำแหน่ง</Label>
                      <p className="text-gray-900">{application.position}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">วันที่เริ่ม</Label>
                      <p className="text-gray-900">
                        {application.internshipDetails?.startDate ? 
                          new Date(application.internshipDetails.startDate).toLocaleDateString('th-TH') : 
                          '-'
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">วันที่สิ้นสุด</Label>
                      <p className="text-gray-900">
                        {application.internshipDetails?.endDate ? 
                          new Date(application.internshipDetails.endDate).toLocaleDateString('th-TH') : 
                          '-'
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">ระยะเวลา</Label>
                      <p className="text-gray-900">{application.internshipDetails?.duration}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">ผู้ควบคุมที่บริษัท</Label>
                      <p className="text-gray-900">{application.internshipDetails?.supervisor}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">เบอร์ติดต่อ</Label>
                      <p className="text-gray-900">{application.internshipDetails?.contact}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">วันที่ยื่นคำขอ</Label>
                      <p className="text-gray-900">
                        {new Date(application.dateApplied).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    เอกสารประกอบ
                  </CardTitle>
                  <CardDescription>
                    เอกสารที่นักศึกษาส่งมาพร้อมคำขอ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {application.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <span className="text-gray-900">{doc}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowDocumentPreview(true)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            ดู
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => alert('กำลังดาวน์โหลด...')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            ดาวน์โหลด
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Assignment History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    ประวัติการมอบหมาย
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">ได้รับมอบหมาย</p>
                        <p className="text-sm text-blue-700">
                          {application.assignmentDate ? 
                            new Date(application.assignmentDate).toLocaleDateString('th-TH') : 
                            'ไม่ระบุวันที่'
                          }
                        </p>
                      </div>
                    </div>
                    
                    {application.responseDate && (
                      <div className={`flex items-center gap-3 p-3 rounded-lg ${
                        application.supervisorStatus === 'accepted' ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        {application.supervisorStatus === 'accepted' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className={`font-medium ${
                            application.supervisorStatus === 'accepted' ? 'text-green-900' : 'text-red-900'
                          }`}>
                            {application.supervisorStatus === 'accepted' ? 'ตอบรับแล้ว' : 'ปฏิเสธ'}
                          </p>
                          <p className={`text-sm ${
                            application.supervisorStatus === 'accepted' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {new Date(application.responseDate).toLocaleDateString('th-TH')}
                          </p>
                          {application.rejectionReason && (
                            <p className="text-sm text-red-600 mt-1">
                              เหตุผล: {application.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ปฏิเสธการมอบหมายนิเทศ</DialogTitle>
              <DialogDescription>
                กรุณาระบุเหตุผลในการปฏิเสธการมอบหมายนิเทศนักศึกษาคนนี้
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejection-reason">เหตุผลในการปฏิเสธ *</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="กรุณาระบุเหตุผลในการปฏิเสธ..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                ยกเลิก
              </Button>
              <Button 
                onClick={handleReject}
                className="bg-red-600 hover:bg-red-700"
              >
                ปฏิเสธ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Document Preview Dialog */}
        <Dialog open={showDocumentPreview} onOpenChange={setShowDocumentPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>พรีวิวเอกสาร</DialogTitle>
              <DialogDescription>
                ตัวอย่างเอกสารที่นักศึกษาส่งมา
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">เอกสารตัวอย่าง</h4>
                <p className="text-sm text-gray-600">
                  เนื้อหาเอกสารจะแสดงที่นี่ (ในระบบจริงจะแสดงไฟล์ PDF หรือเอกสารจริง)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDocumentPreview(false)}>
                ปิด
              </Button>
              <Button onClick={() => alert('กำลังดาวน์โหลด...')}>
                <Download className="h-4 w-4 mr-2" />
                ดาวน์โหลด
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SupervisorGuard>
  );
}
